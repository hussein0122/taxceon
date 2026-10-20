/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ALEXANDRIA_ROADS } from '../city/alexandriaData';
import { createAlexandriaMicrobus, createShaheenSedan, createCivilianSedan } from '../city/vehicleModels';
import { createAlexandriaPedestrian, ArticulatedPedestrian } from '../city/characterModels';
import { TrafficCar, PedestrianData } from '../types/game';

export class TrafficAndPedestrianSystem {
  public trafficCars: TrafficCar[] = [];
  public pedestrians: PedestrianData[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, density: 'low' | 'medium' | 'high' = 'medium') {
    this.scene = scene;
    this.spawnTraffic(density);
    this.spawnPedestrians(density);
  }

  private spawnTraffic(density: 'low' | 'medium' | 'high') {
    const count = density === 'low' ? 12 : density === 'high' ? 28 : 20;

    const carColors = [0xf8fafc, 0x1e293b, 0x94a3b8, 0x1e40af, 0xb91c1c, 0x854d0e, 0x047857];

    for (let i = 0; i < count; i++) {
      const roadIdx = i % ALEXANDRIA_ROADS.length;
      const road = ALEXANDRIA_ROADS[roadIdx];
      const typeRoll = Math.random();

      let mesh: THREE.Group;
      let type: TrafficCar['type'];

      if (typeRoll < 0.35) {
        mesh = createAlexandriaMicrobus();
        type = 'microbus';
      } else if (typeRoll < 0.65) {
        const col = carColors[Math.floor(Math.random() * carColors.length)];
        mesh = createShaheenSedan(col);
        type = 'shaheen';
      } else {
        const col = carColors[Math.floor(Math.random() * carColors.length)];
        mesh = createCivilianSedan(col);
        type = 'sedan';
      }

      // Initial placement along road spline
      const t = (i / count);
      const roadLanes = road.lanes ?? road.points[0]?.lanes ?? 2;
      const laneOffset = (i % 2 === 0 ? 1 : -1) * (roadLanes >= 4 ? 4.5 : 2.5);

      this.scene.add(mesh);

      this.trafficCars.push({
        id: i,
        type,
        mesh,
        roadSegmentIndex: roadIdx,
        t,
        speed: 8 + Math.random() * 8, // 30 - 60 km/h
        targetSpeed: 10 + Math.random() * 6,
        laneOffset,
        color: 0xffffff
      });
    }
  }

  private spawnPedestrians(density: 'low' | 'medium' | 'high') {
    const count = density === 'low' ? 16 : density === 'high' ? 36 : 24;

    for (let i = 0; i < count; i++) {
      const isElderly = Math.random() > 0.65;
      const isFemale = Math.random() > 0.5;
      const mesh = createAlexandriaPedestrian(isElderly, isFemale);

      // Distribute pedestrians along coastal corniche sidewalks and city squares
      const cornichePts = ALEXANDRIA_ROADS[0].points;
      const ptIdx = Math.floor(Math.random() * (cornichePts.length - 1));
      const pt = cornichePts[ptIdx];

      const sidewalkOffset = (Math.random() > 0.5 ? 1 : -1) * (pt.width / 2 + 2.5);
      const x = pt.x + sidewalkOffset;
      const z = pt.z + (Math.random() - 0.5) * 12;

      mesh.position.set(x, 0, z);
      this.scene.add(mesh);

      this.pedestrians.push({
        id: i,
        mesh,
        x,
        z,
        targetX: x + (Math.random() - 0.5) * 35,
        targetZ: z + (Math.random() - 0.5) * 35,
        speed: 1.0 + Math.random() * 0.5,
        state: Math.random() > 0.7 ? 'idle' : 'walking',
        facingAngle: Math.random() * Math.PI * 2,
        walkCycle: Math.random() * 10,
        isMale: !isFemale
      });
    }
  }

  public update(delta: number, playerPos: { x: number; y: number; z: number; speed: number }, onPlayerHitCar?: () => void) {
    const dt = Math.min(delta, 0.05);

    // 1. Update AI Traffic Cars
    for (const car of this.trafficCars) {
      const road = ALEXANDRIA_ROADS[car.roadSegmentIndex];
      const pts = road.points;
      const totalSegments = pts.length - 1;

      // Progress along road segment
      car.t = (car.t + (car.speed * dt) / 320) % 1.0;

      const segFloat = car.t * totalSegments;
      const segIndex = Math.min(totalSegments - 1, Math.floor(segFloat));
      const segFraction = segFloat - segIndex;

      const p1 = pts[segIndex];
      const p2 = pts[segIndex + 1];

      // Interpolate spline center
      const rawX = p1.x + (p2.x - p1.x) * segFraction;
      const rawZ = p1.z + (p2.z - p1.z) * segFraction;

      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const heading = Math.atan2(dx, dz);

      // Offset into specific lane
      const laneX = rawX + Math.cos(heading) * car.laneOffset;
      const laneZ = rawZ - Math.sin(heading) * car.laneOffset;

      car.mesh.position.set(laneX, 0, laneZ);
      car.mesh.rotation.y = heading;

      // Check collision with player taxi
      const distToPlayer = Math.hypot(laneX - playerPos.x, laneZ - playerPos.z);
      if (distToPlayer < 3.2) {
        if (onPlayerHitCar) onPlayerHitCar();
        // Slow down AI car
        car.speed = 1.0;
      }
    }

    // 2. Update Pedestrians
    for (const ped of this.pedestrians) {
      const mesh = ped.mesh as ArticulatedPedestrian;
      if (ped.state === 'walking') {
        const dx = ped.targetX - ped.x;
        const dz = ped.targetZ - ped.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 1.2) {
          ped.facingAngle = Math.atan2(dx, dz);
          ped.x += (dx / dist) * ped.speed * dt;
          ped.z += (dz / dist) * ped.speed * dt;
        } else {
          // Reached destination, pick new point along sidewalk
          ped.targetX = ped.x + (Math.random() - 0.5) * 45;
          ped.targetZ = ped.z + (Math.random() - 0.5) * 45;
          ped.state = Math.random() > 0.4 ? 'walking' : 'idle';
        }

        mesh.position.set(ped.x, 0, ped.z);
        mesh.rotation.y = ped.facingAngle;

        if (mesh.updateAnimation) {
          mesh.updateAnimation(dt, true, false);
        }
      } else {
        // Idle
        if (mesh.updateAnimation) {
          mesh.updateAnimation(dt, false, ped.state === 'hailing');
        }
      }
    }
  }

  public setPassengerHailing(passengerPos: { x: number; z: number }): ArticulatedPedestrian | null {
    // Find closest pedestrian and make them hail the taxi
    let closest: PedestrianData | null = null;
    let minDist = Infinity;

    for (const ped of this.pedestrians) {
      const dist = Math.hypot(ped.x - passengerPos.x, ped.z - passengerPos.z);
      if (dist < minDist) {
        minDist = dist;
        closest = ped;
      }
    }

    if (closest) {
      closest.state = 'hailing';
      closest.x = passengerPos.x;
      closest.z = passengerPos.z;
      closest.mesh.position.set(closest.x, 0, closest.z);
      return closest.mesh as ArticulatedPedestrian;
    }
    return null;
  }
}
