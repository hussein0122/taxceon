/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CameraViewMode, ControlState, TaxiStats, VehicleMode } from '../types/game';
import { TaxiVehicleMesh } from '../city/vehicleModels';
import { soundEngine } from '../audio/soundEngine';

export interface VehiclePhysicsState {
  x: number;
  y: number;
  z: number;
  yaw: number; // Heading angle in radians
  speed: number; // Current speed in m/s (1 m/s = 3.6 km/h)
  steerAngle: number; // Front wheel steer angle
  roll: number; // Chassis lean
  pitch: number; // Chassis squat/dive
  isGrounded: boolean;
  driftFactor: number;
}

export class TaxiPhysicsEngine {
  public state: VehiclePhysicsState = {
    x: -50, // Starts at Raml Station
    y: 0,
    z: -45,
    yaw: Math.PI / 2, // Heading east along Corniche
    speed: 0,
    steerAngle: 0,
    roll: 0,
    pitch: 0,
    isGrounded: true,
    driftFactor: 0
  };

  private lastCollisionTime: number = 0;

  constructor(vehicleMode: VehicleMode = 'taxi') {
    if (vehicleMode === 'microbus') {
      // Start at the east end of the line, facing west toward Bahary and Qaitbay.
      this.state.x = 735;
      this.state.z = -62;
      this.state.yaw = -Math.PI / 2;
    }
  }

  public update(
    delta: number,
    controls: ControlState,
    taxiMesh: TaxiVehicleMesh,
    stats: TaxiStats,
    camera: THREE.PerspectiveCamera,
    cameraMode: CameraViewMode,
    vehicleMode: VehicleMode = 'taxi'
  ) {
    const dt = Math.min(delta, 0.05);

    // 1. Upgrade Multipliers
    // A passenger microbus has a higher body and more weight: slower response and
    // a lower top speed than the upgraded taxi, while retaining the same controls.
    const maxSpeedKmh = (vehicleMode === 'microbus' ? 88 : 75) + (stats.speedLevel - 1) * (vehicleMode === 'microbus' ? 7 : 12);
    const maxSpeed = maxSpeedKmh / 3.6;
    const accelPower = (vehicleMode === 'microbus' ? 10.5 : 15) + (stats.accelLevel - 1) * (vehicleMode === 'microbus' ? 2.2 : 3.5);
    const brakePower = (vehicleMode === 'microbus' ? 22 : 24) + (stats.brakeLevel - 1) * 5.0;

    // Fuel check: if empty, engine stalls
    const hasFuel = stats.fuel > 0;

    // 2. Throttle & Braking
    let targetAccel = 0;
    if (controls.gas && hasFuel) {
      if (controls.reverse) {
        targetAccel = -accelPower * 0.6;
      } else {
        targetAccel = accelPower;
      }
    } else if (controls.brake) {
      if (this.state.speed > 0.5) {
        targetAccel = -brakePower;
        soundEngine.playBrakeScreech();
      } else if (this.state.speed < -0.5) {
        targetAccel = brakePower;
      } else {
        // Brake is a brake. Reverse is selected explicitly with R / the touch gear.
        targetAccel = 0;
      }
    } else if (controls.handbrake) {
      targetAccel = -brakePower * 1.6;
      this.state.driftFactor = Math.min(1.0, this.state.driftFactor + dt * 4);
      soundEngine.playBrakeScreech();
    } else {
      // Natural rolling friction & drag
      this.state.driftFactor = Math.max(0, this.state.driftFactor - dt * 3);
    }

    // Apply acceleration
    this.state.speed += targetAccel * dt;

    // Road friction damping
    const friction = controls.handbrake ? 0.94 : 0.985;
    this.state.speed *= Math.pow(friction, dt * 60);

    // Speed clamps
    const maxReverseSpeed = maxSpeed * 0.35;
    this.state.speed = THREE.MathUtils.clamp(this.state.speed, -maxReverseSpeed, maxSpeed);

    // Stop creep
    if (Math.abs(this.state.speed) < 0.05 && !controls.gas && !controls.brake) {
      this.state.speed = 0;
    }

    // 3. Steering Dynamics
    const maxSteer = vehicleMode === 'microbus' ? 0.46 : 0.58;
    const steerSpeed = vehicleMode === 'microbus' ? 3.1 : 4.2;
    let targetSteer = 0;

    if (controls.left) targetSteer += maxSteer;
    if (controls.right) targetSteer -= maxSteer;

    this.state.steerAngle = THREE.MathUtils.damp(this.state.steerAngle, targetSteer, steerSpeed, dt);

    // Yaw rate is proportional to speed and steer angle (Ackermann approximation)
    if (Math.abs(this.state.speed) > 0.1) {
      const turnMultiplier = this.state.speed >= 0 ? 1 : -1;
      const effectiveWheelbase = vehicleMode === 'microbus' ? 3.35 : 2.8;
      const driftBonus = 1 + this.state.driftFactor * (vehicleMode === 'microbus' ? 0.35 : 0.8);
      const yawRate = (this.state.speed / effectiveWheelbase) * Math.tan(this.state.steerAngle) * turnMultiplier * driftBonus;
      this.state.yaw += yawRate * dt;
    }

    // 4. Position Integration
    const forwardX = Math.sin(this.state.yaw);
    const forwardZ = Math.cos(this.state.yaw);

    this.state.x += forwardX * this.state.speed * dt;
    this.state.z += forwardZ * this.state.speed * dt;

    // Boundary constraints (Keep player inside Alexandria playable zone)
    const minX = -450;
    const maxX = 760;
    const minZ = -195; // Seaside barrier
    const maxZ = 240;  // Inland city boundary

    if (this.state.x < minX || this.state.x > maxX || this.state.z < minZ || this.state.z > maxZ) {
      this.state.x = THREE.MathUtils.clamp(this.state.x, minX, maxX);
      this.state.z = THREE.MathUtils.clamp(this.state.z, minZ, maxZ);
      this.state.speed = -this.state.speed * 0.3; // Bumper rebound
      this.triggerCollision();
    }

    // Stanley Bridge elevation curve (lifts the selected vehicle over Stanley Bay)
    if (this.state.x > 340 && this.state.x < 420 && this.state.z < -80 && this.state.z > -125) {
      const bridgeCenter = 380;
      const distFromCenter = Math.abs(this.state.x - bridgeCenter);
      const spanT = Math.max(0, 1 - distFromCenter / 40);
      this.state.y = THREE.MathUtils.damp(this.state.y, spanT * 3.6, 6, dt);
    } else {
      this.state.y = THREE.MathUtils.damp(this.state.y, 0, 8, dt);
    }

    // 5. Suspension Dynamics (Chassis Roll & Pitch)
    // Lateral roll during cornering
    const lateralG = (this.state.speed * this.state.steerAngle) / 22;
    const rollScale = vehicleMode === 'microbus' ? 0.48 : 0.35;
    const maxRoll = vehicleMode === 'microbus' ? 0.2 : 0.15;
    const targetRoll = THREE.MathUtils.clamp(lateralG * rollScale, -maxRoll, maxRoll);
    this.state.roll = THREE.MathUtils.damp(this.state.roll, targetRoll, 8, dt);

    // Pitch during acceleration / hard braking
    const targetPitch = THREE.MathUtils.clamp(targetAccel * 0.005, -0.1, 0.08);
    this.state.pitch = THREE.MathUtils.damp(this.state.pitch, targetPitch, 10, dt);

    // 6. Update 3D Taxi Mesh
    taxiMesh.position.set(this.state.x, this.state.y, this.state.z);
    taxiMesh.rotation.y = this.state.yaw;

    if (taxiMesh.chassisMesh) {
      taxiMesh.chassisMesh.rotation.z = this.state.roll;
      taxiMesh.chassisMesh.rotation.x = this.state.pitch;
    }

    // Rotate Wheels with movement
    const wheelCircumference = 2 * Math.PI * 0.42;
    const wheelRotDelta = (this.state.speed * dt) / wheelCircumference * Math.PI * 2;

    const spinWheel = (wheel?: THREE.Group) => {
      if (!wheel) return;
      const spinGroup = wheel.userData.spinGroup as THREE.Group | undefined;
      if (spinGroup) spinGroup.rotation.z += wheelRotDelta;
      else wheel.rotation.z += wheelRotDelta;
    };
    if (taxiMesh.frontLeftWheel) taxiMesh.frontLeftWheel.rotation.y = this.state.steerAngle;
    if (taxiMesh.frontRightWheel) taxiMesh.frontRightWheel.rotation.y = this.state.steerAngle;
    spinWheel(taxiMesh.frontLeftWheel);
    spinWheel(taxiMesh.frontRightWheel);
    spinWheel(taxiMesh.rearLeftWheel);
    spinWheel(taxiMesh.rearRightWheel);

    // 7. Update Engine Sound Pitch
    const speedRatio = this.state.speed / maxSpeed;
    soundEngine.updateEnginePitch(speedRatio, controls.gas && hasFuel);

    // Horn audio is triggered on key/pointer press, not every simulation frame.

    // 8. Dynamic Camera Modes
    this.updateCamera(camera, cameraMode, dt);
  }

  public triggerCollision() {
    const now = performance.now();
    if (now - this.lastCollisionTime > 400) {
      this.lastCollisionTime = now;
      soundEngine.playCollision();
    }
  }

  private updateCamera(camera: THREE.PerspectiveCamera, mode: CameraViewMode, dt: number) {
    const forwardX = Math.sin(this.state.yaw);
    const forwardZ = Math.cos(this.state.yaw);
    const speedKmh = Math.abs(this.state.speed * 3.6);

    if (mode === 'chase') {
      // Third-person smooth follow
      const followDist = 8.5 + (speedKmh / 100) * 2.5;
      const targetCamX = this.state.x - forwardX * followDist;
      const targetCamZ = this.state.z - forwardZ * followDist;
      const targetCamY = this.state.y + 3.8 + (speedKmh / 100) * 0.8;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 6.5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 6.5, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 6.5, dt);

      // Dynamic FOV widening with speed
      const targetFov = 60 + Math.min(18, (speedKmh / 100) * 14);
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 4, dt);
      camera.updateProjectionMatrix();

      // Look slightly ahead of taxi
      const lookX = this.state.x + forwardX * 6;
      const lookZ = this.state.z + forwardZ * 6;
      camera.lookAt(lookX, this.state.y + 1.8, lookZ);

    } else if (mode === 'hood') {
      // First-person hood view
      camera.position.set(
        this.state.x + forwardX * 1.2,
        this.state.y + 1.45,
        this.state.z + forwardZ * 1.2
      );
      camera.lookAt(
        this.state.x + forwardX * 24,
        this.state.y + 1.45,
        this.state.z + forwardZ * 24
      );
      camera.fov = 72;
      camera.updateProjectionMatrix();

    } else if (mode === 'top') {
      // Helicopter / Tactical top-down view
      camera.position.set(this.state.x, this.state.y + 42, this.state.z);
      camera.lookAt(this.state.x, this.state.y, this.state.z);
      camera.fov = 55;
      camera.updateProjectionMatrix();

    } else if (mode === 'cinematic') {
      // Rotating cinematic showcase camera
      const time = performance.now() * 0.0006;
      camera.position.set(
        this.state.x + Math.sin(time) * 12,
        this.state.y + 4.2,
        this.state.z + Math.cos(time) * 12
      );
      camera.lookAt(this.state.x, this.state.y + 1.5, this.state.z);
      camera.fov = 55;
      camera.updateProjectionMatrix();
    }
  }

  public getSpeedKmh(): number {
    return Math.abs(Math.round(this.state.speed * 3.6));
  }
}
