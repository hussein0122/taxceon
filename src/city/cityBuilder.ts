/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ALEXANDRIA_LANDMARKS, ALEXANDRIA_ROADS } from './alexandriaData';

// Procedural texture for Egyptian storefronts and signs
function createStoreSignTexture(textAr: string, subAr: string, bgColor: string, textColor: string = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.fillStyle = textColor;
  ctx.font = '900 42px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(textAr, 256, 62);

  ctx.font = '600 24px Cairo, sans-serif';
  ctx.fillText(subAr, 256, 102);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Procedural asphalt texture with subtle road noise
function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#232930';
  ctx.fillRect(0, 0, 512, 512);

  // Micro gravel noise
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const s = 1 + Math.random() * 2;
    const l = 30 + Math.floor(Math.random() * 25);
    ctx.fillStyle = `rgb(${l},${l + 2},${l + 4})`;
    ctx.fillRect(x, y, s, s);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  return tex;
}

// Procedural Alexandria Sidewalk Curb (Yellow & Black alternating blocks)
function createCurbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f5b800'; // Yellow block
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = '#1e293b'; // Black/dark block
  ctx.fillRect(128, 0, 128, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 1);
  return tex;
}

export interface CityEnvironment {
  scene: THREE.Scene;
  seaMesh: THREE.Mesh;
  streetLamps: THREE.PointLight[];
  landmarkBeacons: Map<string, THREE.Group>;
  gasPumps: THREE.Group[];
  update: (time: number) => void;
}

export function buildAlexandriaCity(scene: THREE.Scene): CityEnvironment {
  const streetLamps: THREE.PointLight[] = [];
  const landmarkBeacons = new Map<string, THREE.Group>();
  const gasPumps: THREE.Group[] = [];

  // 1. Terrain Ground
  const groundGeo = new THREE.PlaneGeometry(1600, 1600);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xd8caa8, // Mediterranean limestone & coastal soil
    roughness: 0.95,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(50, -0.1, 50);
  ground.receiveShadow = true;
  scene.add(ground);

  // 2. Mediterranean Sea
  const seaGeo = new THREE.PlaneGeometry(1800, 900, 64, 32);
  const seaMat = new THREE.MeshStandardMaterial({
    color: 0x0f698e,
    roughness: 0.15,
    metalness: 0.35,
    transparent: true,
    opacity: 0.92
  });
  const sea = new THREE.Mesh(seaGeo, seaMat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(50, -0.3, -400); // North of city
  scene.add(sea);

  // Sandy Beach along coastal curve
  const beachGeo = new THREE.PlaneGeometry(1200, 80);
  const beachMat = new THREE.MeshStandardMaterial({
    color: 0xf3dca3,
    roughness: 0.96
  });
  const beach = new THREE.Mesh(beachGeo, beachMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(80, -0.05, -135);
  scene.add(beach);

  // 3. Roads Network Mesh Construction
  const roadMat = new THREE.MeshStandardMaterial({
    map: createAsphaltTexture(),
    roughness: 0.88,
    metalness: 0.12,
    polygonOffset: true,
    polygonOffsetFactor: -1
  });

  const curbMat = new THREE.MeshStandardMaterial({
    map: createCurbTexture(),
    roughness: 0.8
  });

  const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xf5b800 });

  ALEXANDRIA_ROADS.forEach(road => {
    const pts = road.points;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const mx = (p1.x + p2.x) / 2;
      const mz = (p1.z + p2.z) / 2;
      const width = p1.width;

      // Road Surface Plane
      const roadMesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, len), roadMat);
      roadMesh.position.set(mx, 0.05, mz);
      roadMesh.rotation.y = angle;
      roadMesh.receiveShadow = true;
      scene.add(roadMesh);

      // Yellow/Black Curbs on outer edges
      const curbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, len), curbMat);
      curbLeft.position.set(mx - Math.cos(angle) * (width / 2 + 0.25), 0.11, mz + Math.sin(angle) * (width / 2 + 0.25));
      curbLeft.rotation.y = angle;
      scene.add(curbLeft);

      const curbRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, len), curbMat);
      curbRight.position.set(mx + Math.cos(angle) * (width / 2 + 0.25), 0.11, mz - Math.sin(angle) * (width / 2 + 0.25));
      curbRight.rotation.y = angle;
      scene.add(curbRight);

      // Lane markings
      const numLanes = road.lanes ?? road.points[0]?.lanes ?? 2;
      if (numLanes >= 2) {
        // Center line is visible on ordinary two-lane Alexandria streets as well.
        if (numLanes >= 4) {
          for (const offset of [-0.2, 0.2]) {
            const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, len), yellowLineMat);
            centerLine.position.set(mx - Math.cos(angle) * offset, 0.115, mz + Math.sin(angle) * offset);
            centerLine.rotation.y = angle;
            scene.add(centerLine);
          }
        } else {
          const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, len), yellowLineMat);
          centerLine.position.set(mx, 0.115, mz);
          centerLine.rotation.y = angle;
          scene.add(centerLine);
        }

        // Broken white lane markings on wider roads.
        if (numLanes >= 4) {
          const numDashes = Math.max(1, Math.floor(len / 7));
          for (let d = 0; d < numDashes; d++) {
            const t = (d + 0.5) / numDashes;
            const px = p1.x + dx * t;
            const pz = p1.z + dz * t;
            const laneOffset = width * 0.28;
            for (const side of [-1, 1]) {
              const dash = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 3.2), dashMat);
              dash.position.set(px - Math.cos(angle) * laneOffset * side, 0.115, pz + Math.sin(angle) * laneOffset * side);
              dash.rotation.y = angle;
              scene.add(dash);
            }
          }
        }
      }

      // If Corniche road, add seaside stone balustrade (سور الكورنيش)
      if (p1.isCorniche) {
        const balustrade = buildCornicheBalustrade(len);
        balustrade.position.set(mx - Math.cos(angle) * (width / 2 + 3.2), 0, mz + Math.sin(angle) * (width / 2 + 3.2));
        balustrade.rotation.y = angle;
        scene.add(balustrade);
      }
    }
  });

  // 4. Alexandria Corniche Blue & White Balustrade Helper
  function buildCornicheBalustrade(length: number): THREE.Group {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 }); // Classic blue painted stone
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }); // White pillars

    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.85, length), stoneMat);
    wall.position.y = 0.42;
    wall.castShadow = true;
    g.add(wall);

    // Decorative pillars every 8 meters
    const steps = Math.floor(length / 8);
    for (let s = 0; s <= steps; s++) {
      const pz = -length / 2 + s * 8;
      const pil = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.1, 0.55), whiteMat);
      pil.position.set(0, 0.55, pz);
      pil.castShadow = true;
      g.add(pil);
    }
    return g;
  }

  // 5. Date Palm Trees along the Corniche Promenade
  const palmGroup = new THREE.Group();
  scene.add(palmGroup);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.9 });
  const frondMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7 });

  function createPalmTree(): THREE.Group {
    const palm = new THREE.Group();
    // Segmented curved trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.48, 8.5, 8), trunkMat);
    trunk.position.y = 4.25;
    trunk.castShadow = true;
    palm.add(trunk);

    // Palm fronds
    const frondGeo = new THREE.ConeGeometry(1.6, 6.5, 6, 1, true);
    for (let f = 0; f < 9; f++) {
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.rotation.z = Math.PI / 2.3;
      frond.rotation.y = (f * Math.PI * 2) / 9;
      frond.position.y = 8.4;
      palm.add(frond);
    }
    return palm;
  }

  // Place palms in medians and coastal promenade
  const cornichePts = ALEXANDRIA_ROADS[0].points;
  for (let i = 0; i < cornichePts.length; i += 2) {
    const pt = cornichePts[i];
    const palm = createPalmTree();
    palm.position.set(pt.x + 8, 0, pt.z + 14);
    palmGroup.add(palm);

    const palm2 = createPalmTree();
    palm2.position.set(pt.x - 12, 0, pt.z - 16);
    palmGroup.add(palm2);
  }

  // 6. Alexandria Street Lamps (Cast warm light at night)
  const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.8 });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff3b0,
    emissive: 0xffd166,
    emissiveIntensity: 1.0,
    roughness: 0.2
  });

  function createStreetLamp(x: number, z: number): THREE.Group {
    const lg = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 9, 8), lampPoleMat);
    pole.position.y = 4.5;
    pole.castShadow = true;
    lg.add(pole);

    // Dual ornate arms
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.12), lampPoleMat);
    arm.position.y = 8.8;
    lg.add(arm);

    // Lanterns
    const bulbL = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), bulbMat);
    bulbL.position.set(1.1, 8.6, 0);
    lg.add(bulbL);

    const bulbR = bulbL.clone();
    bulbR.position.x = -1.1;
    lg.add(bulbR);

    // Night point light
    const pLight = new THREE.PointLight(0xffe082, 0.8, 45, 1.8);
    pLight.position.set(0, 8.5, 0);
    lg.add(pLight);
    streetLamps.push(pLight);

    lg.position.set(x, 0, z);
    return lg;
  }

  for (let i = 1; i < cornichePts.length - 1; i += 2) {
    const p = cornichePts[i];
    scene.add(createStreetLamp(p.x, p.z + 12));
  }

  // 7. Iconic Stanley Bridge (تحفة كوبري ستانلي)
  const stanleyGroup = new THREE.Group();
  stanleyGroup.position.set(375, 0, -100);

  const bridgeStoneMat = new THREE.MeshStandardMaterial({ color: 0xd6cbb1, roughness: 0.7 });
  const roofTileMat = new THREE.MeshStandardMaterial({ color: 0x9c4221, roughness: 0.8 }); // Red terracotta roof

  // Bridge piers rising from sea
  for (let pr = -35; pr <= 35; pr += 35) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(6, 12, 18), bridgeStoneMat);
    pier.position.set(pr, 1, 0);
    pier.castShadow = true;
    stanleyGroup.add(pier);
  }

  // 4 Iconic Italian Florentine Towers
  const towerPositions = [
    [-38, 7.5, 11],
    [-38, 7.5, -11],
    [38, 7.5, 11],
    [38, 7.5, -11]
  ];

  towerPositions.forEach(([tx, ty, tz]) => {
    const tower = new THREE.Group();
    // Tower body with arched balconies
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 15, 4.2), bridgeStoneMat);
    body.position.y = ty;
    body.castShadow = true;
    tower.add(body);

    // Decorative balcony tier
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.2, 5.2), bridgeStoneMat);
    balcony.position.y = ty + 7.5;
    tower.add(balcony);

    // Terracotta Pyramidal Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 5.5, 4), roofTileMat);
    roof.position.y = ty + 10.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    tower.add(roof);

    tower.position.set(tx, 0, tz);
    stanleyGroup.add(tower);
  });

  scene.add(stanleyGroup);

  // 8. Citadel of Qaitbay (قلعة قايتباي)
  const qaitbayGroup = new THREE.Group();
  qaitbayGroup.position.set(-380, 0, -160);

  const fortStoneMat = new THREE.MeshStandardMaterial({ color: 0xdfd3b8, roughness: 0.85 });
  // Outer castle fortress walls
  const castleBase = new THREE.Mesh(new THREE.BoxGeometry(45, 18, 45), fortStoneMat);
  castleBase.position.y = 9;
  castleBase.castShadow = true;
  castleBase.receiveShadow = true;
  qaitbayGroup.add(castleBase);

  // Secondary central keep
  const keep = new THREE.Mesh(new THREE.BoxGeometry(26, 12, 26), fortStoneMat);
  keep.position.y = 24;
  keep.castShadow = true;
  qaitbayGroup.add(keep);

  // Corner watchtowers
  [
    [-20, 18, -20],
    [20, 18, -20],
    [-20, 18, 20],
    [20, 18, 20]
  ].forEach(([cx, cy, cz]) => {
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.2, 22, 12), fortStoneMat);
    tw.position.set(cx, cy / 2 + 4, cz);
    tw.castShadow = true;
    qaitbayGroup.add(tw);
  });

  // Flag of Egypt atop fortress
  const flagPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 9, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 })
  );
  flagPole.position.set(0, 34, 0);
  qaitbayGroup.add(flagPole);

  const flagMat = new THREE.MeshBasicMaterial({ color: 0xce1126 }); // Red Egyptian flag
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.8), flagMat);
  flag.position.set(1.6, 36.5, 0);
  qaitbayGroup.add(flag);

  scene.add(qaitbayGroup);

  // 9. Bibliotheca Alexandrina (مكتبة الإسكندرية)
  const libraryGroup = new THREE.Group();
  libraryGroup.position.set(70, 0, -35);

  const graniteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.3 });
  const glassRoofMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.8, roughness: 0.1 });

  // Iconic tilted disc of the Library
  const discGeo = new THREE.CylinderGeometry(38, 38, 14, 32);
  const disc = new THREE.Mesh(discGeo, graniteMat);
  disc.position.y = 7;
  disc.rotation.z = 0.28; // Dramatic tilt towards the sea
  disc.castShadow = true;
  disc.receiveShadow = true;
  libraryGroup.add(disc);

  // Glass roof skylights
  const roofGlass = new THREE.Mesh(new THREE.CircleGeometry(37, 32), glassRoofMat);
  roofGlass.position.y = 14.1;
  roofGlass.rotation.x = -Math.PI / 2;
  roofGlass.rotation.y = 0.28;
  libraryGroup.add(roofGlass);

  // Surrounding reflecting pool
  const pool = new THREE.Mesh(
    new THREE.CylinderGeometry(44, 44, 0.4, 32),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1 })
  );
  pool.position.y = 0.2;
  libraryGroup.add(pool);

  scene.add(libraryGroup);

  // 10. Abu El Abbas El Mursi Mosque Minarets (مسجد المرسي أبو العباس)
  const mosqueGroup = new THREE.Group();
  mosqueGroup.position.set(-280, 0, -80);

  const mosqueMat = new THREE.MeshStandardMaterial({ color: 0xf1ebe1, roughness: 0.6 });
  const domeMat = new THREE.MeshStandardMaterial({ color: 0xe2d7bf, roughness: 0.4 });

  const mosqueBody = new THREE.Mesh(new THREE.BoxGeometry(32, 16, 32), mosqueMat);
  mosqueBody.position.y = 8;
  mosqueBody.castShadow = true;
  mosqueGroup.add(mosqueBody);

  // Central Dome
  const dome = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
  dome.position.y = 16;
  dome.castShadow = true;
  mosqueGroup.add(dome);

  // Tall Andalusian Minaret
  const minaret = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.6, 42, 12), mosqueMat);
  minaret.position.set(14, 21, 14);
  minaret.castShadow = true;
  mosqueGroup.add(minaret);

  scene.add(mosqueGroup);

  // 11. Gas Stations (مصر للبترول وموبيل الكورنيش)
  function buildGasStation(x: number, z: number, brand: 'misr' | 'mobil'): THREE.Group {
    const station = new THREE.Group();
    const brandColor = brand === 'misr' ? 0x0284c7 : 0xd90429;
    const canopyMat = new THREE.MeshStandardMaterial({ color: brandColor, roughness: 0.3 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });

    // Large canopy
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 14), canopyMat);
    canopy.position.y = 6.8;
    canopy.castShadow = true;
    station.add(canopy);

    // Canopy support pillars
    [-8, 8].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6.8, 8), whiteMat);
      pillar.position.set(px, 3.4, 0);
      pillar.castShadow = true;
      station.add(pillar);
    });

    // Gas pumps
    for (let p = -5; p <= 5; p += 5) {
      const pump = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 2.4, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
      );
      pump.position.set(p, 1.2, 0);
      pump.castShadow = true;
      station.add(pump);
    }

    // Interactive refueling zone beacon
    const refuelZone = new THREE.Mesh(
      new THREE.CylinderGeometry(7, 7, 0.1, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35 })
    );
    refuelZone.position.y = 0.08;
    station.add(refuelZone);

    station.position.set(x, 0, z);
    gasPumps.push(station);
    return station;
  }

  scene.add(buildGasStation(130, -10, 'misr'));
  scene.add(buildGasStation(15, 75, 'mobil'));

  // 12. Alexandria Belle Époque & Coastal Buildings with Balconies & Storefronts
  const buildingColors = [0xe2d4be, 0xebd9c1, 0xdfceb5, 0xd4c2a8, 0xf3ede2, 0xd5e3e6, 0xe8dfd8];
  const windowLitMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 0.6,
    roughness: 0.3
  });
  const windowDarkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.2
  });
  const balconyMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.62, metalness: 0.18 });
  const sillMat = new THREE.MeshStandardMaterial({ color: 0xb8a58b, roughness: 0.9 });
  const rooftopRoomMat = new THREE.MeshStandardMaterial({ color: 0xc8bba5, roughness: 0.92 });
  const waterTankMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.38, metalness: 0.22 });

  const egyptianStores = [
    { name: 'مقهى الكورنيش العريق', sub: 'قهوة وشاي على البحر', bg: '#0369a1' },
    { name: 'أسماك قدورة والأنفوشي', sub: 'مأكولات بحرية طازجة', bg: '#0f766e' },
    { name: 'صيدلية الإسكندرية الحديثة', sub: 'خدمة ٢٤ ساعة', bg: '#15803d' },
    { name: 'حلواني طلعت حرب', sub: 'هريسة وبسبوسة سكندري', bg: '#b45309' },
    { name: 'بن البرازيلي ومحطة الرمل', sub: 'أجود أنواع القهوة', bg: '#78350f' },
    { name: 'كافيه البورصة وسعد زغلول', sub: 'ملتقى المثقفين والفنانين', bg: '#831843' }
  ];

  // Reuse geometry and batch repeated facade details. Creating thousands of
  // individual Mesh objects caused long stalls / black screens on game start.
  const windowGeo = new THREE.BoxGeometry(1.45, 1.55, 0.12);
  const sideWindowGeo = new THREE.BoxGeometry(0.12, 1.55, 1.35);
  const sillGeo = new THREE.BoxGeometry(1.72, 0.12, 0.24);
  const balconySlabGeo = new THREE.BoxGeometry(2.25, 0.14, 0.72);
  const balconyRailGeo = new THREE.BoxGeometry(2.25, 0.12, 0.08);
  const balconySideGeo = new THREE.BoxGeometry(0.08, 0.48, 0.72);
  const waterTankGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.5, 12);

  const facadeInstances: Record<string, THREE.Matrix4[]> = {
    frontLit: [],
    frontDark: [],
    sideLit: [],
    sideDark: [],
    sills: [],
    balconySlabs: [],
    balconyRails: [],
    balconySides: []
  };
  const instanceDummy = new THREE.Object3D();
  const queueFacadeInstance = (kind: keyof typeof facadeInstances, x: number, y: number, z: number) => {
    instanceDummy.position.set(x, y, z);
    instanceDummy.rotation.set(0, 0, 0);
    instanceDummy.scale.set(1, 1, 1);
    instanceDummy.updateMatrix();
    facadeInstances[kind].push(instanceDummy.matrix.clone());
  };

  const buildingGroup = new THREE.Group();
  scene.add(buildingGroup);

  for (let b = 0; b < 140; b++) {
    const rx = -420 + Math.random() * 950;
    const rz = 25 + Math.random() * 220;

    // Keep clear space around landmarks.
    let tooClose = false;
    for (const lm of ALEXANDRIA_LANDMARKS) {
      if (Math.hypot(rx - lm.position.x, rz - lm.position.z) < lm.radius + 14) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    const w = 18 + Math.random() * 22;
    const d = 16 + Math.random() * 20;
    const h = 24 + Math.random() * 55;
    const col = buildingColors[Math.floor(Math.random() * buildingColors.length)];
    const bMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 });

    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat);
    bMesh.position.set(rx, h / 2, rz);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    buildingGroup.add(bMesh);

    const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 1.4, d + 1.2), bMat);
    cornice.position.set(rx, h + 0.7, rz);
    buildingGroup.add(cornice);

    // Ground-floor storefront signs retain their unique Arabic artwork.
    if (Math.random() > 0.4) {
      const store = egyptianStores[Math.floor(Math.random() * egyptianStores.length)];
      const signMat = new THREE.MeshBasicMaterial({ map: createStoreSignTexture(store.name, store.sub, store.bg) });
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.75, 2.8), signMat);
      signMesh.position.set(rx, 3.8, rz - d / 2 - 0.1);
      buildingGroup.add(signMesh);
    }

    const floors = Math.floor(h / 4.2);
    const columns = Math.max(2, Math.min(5, Math.floor(w / 5.2)));
    const baySpacing = w / (columns + 1);
    for (let fl = 1; fl < floors; fl++) {
      const y = fl * 4.2;
      for (let colIndex = 1; colIndex <= columns; colIndex++) {
        const x = rx - w / 2 + baySpacing * colIndex;
        const isLit = ((fl * 7 + colIndex * 3 + b) % 5) < 2;
        queueFacadeInstance(isLit ? 'frontLit' : 'frontDark', x, y, rz - d / 2 - 0.1);
        queueFacadeInstance('sills', x, y - 0.88, rz - d / 2 - 0.13);

        if (colIndex % 2 === 0 && fl > 1 && (b + fl + colIndex) % 3 === 0) {
          queueFacadeInstance('balconySlabs', x, y - 0.82, rz - d / 2 - 0.42);
          queueFacadeInstance('balconyRails', x, y - 0.48, rz - d / 2 - 0.76);
          for (const side of [-1, 1]) {
            queueFacadeInstance('balconySides', x + side * 1.08, y - 0.58, rz - d / 2 - 0.42);
          }
        }
      }

      // Side windows add depth without one draw call per window.
      for (const side of [-1, 1]) {
        const kind = (fl + b + (side > 0 ? 1 : 0)) % 4 === 0 ? 'sideLit' : 'sideDark';
        queueFacadeInstance(kind, rx + side * (w / 2 + 0.07), y, rz);
      }
    }

    // Rooftop rooms and water tanks are shared-material objects.
    if (b % 3 === 0) {
      const rooftopRoom = new THREE.Mesh(new THREE.BoxGeometry(w * 0.32, 2.4, d * 0.34), rooftopRoomMat);
      rooftopRoom.position.set(rx - w * 0.18, h + 1.2, rz);
      rooftopRoom.castShadow = true;
      buildingGroup.add(rooftopRoom);
    }
    if (b % 4 === 0) {
      const tank = new THREE.Mesh(waterTankGeo, waterTankMat);
      tank.position.set(rx + w * 0.22, h + 1.15, rz + d * 0.18);
      buildingGroup.add(tank);
    }
  }

  const addFacadeBatch = (
    kind: keyof typeof facadeInstances,
    geometry: THREE.BufferGeometry,
    material: THREE.Material
  ) => {
    const matrices = facadeInstances[kind];
    if (matrices.length === 0) return;
    const batch = new THREE.InstancedMesh(geometry, material, matrices.length);
    matrices.forEach((matrix, index) => batch.setMatrixAt(index, matrix));
    batch.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    batch.instanceMatrix.needsUpdate = true;
    // Facade details do not need to cast individual shadows; buildings do.
    batch.castShadow = false;
    batch.receiveShadow = false;
    buildingGroup.add(batch);
  };

  addFacadeBatch('frontLit', windowGeo, windowLitMat);
  addFacadeBatch('frontDark', windowGeo, windowDarkMat);
  addFacadeBatch('sideLit', sideWindowGeo, windowLitMat);
  addFacadeBatch('sideDark', sideWindowGeo, windowDarkMat);
  addFacadeBatch('sills', sillGeo, sillMat);
  addFacadeBatch('balconySlabs', balconySlabGeo, balconyMat);
  addFacadeBatch('balconyRails', balconyRailGeo, balconyMat);
  addFacadeBatch('balconySides', balconySideGeo, balconyMat);

  // 13. Interactive Landmark 3D Floating Beacons (For GPS Navigation & Tourism)
  ALEXANDRIA_LANDMARKS.forEach(lm => {
    const beacon = new THREE.Group();
    // Glowing ring on ground
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(lm.radius * 0.85, lm.radius, 32),
      new THREE.MeshBasicMaterial({
        color: lm.type === 'gas' ? 0x10b981 : 0xf5b800,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.2;
    beacon.add(ring);

    // Floating diamond marker above landmark
    const marker = new THREE.Mesh(
      new THREE.OctahedronGeometry(2.4, 0),
      new THREE.MeshStandardMaterial({
        color: lm.type === 'gas' ? 0x10b981 : 0xf5b800,
        emissive: lm.type === 'gas' ? 0x059669 : 0xd97706,
        emissiveIntensity: 0.8,
        roughness: 0.2
      })
    );
    marker.position.y = 8;
    beacon.add(marker);

    beacon.position.set(lm.position.x, 0, lm.position.z);
    scene.add(beacon);
    landmarkBeacons.set(lm.id, beacon);
  });

  return {
    scene,
    seaMesh: sea,
    streetLamps,
    landmarkBeacons,
    gasPumps,
    update: (time: number) => {
      // Animate sea water waves
      sea.position.y = -0.3 + Math.sin(time * 1.8) * 0.08;

      // Animate floating landmark diamonds
      landmarkBeacons.forEach(b => {
        const marker = b.children[1];
        if (marker) {
          marker.rotation.y = time * 1.5;
          marker.position.y = 8 + Math.sin(time * 3) * 0.8;
        }
      });
    }
  };
}
