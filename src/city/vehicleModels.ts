/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Procedural Canvas Texture for Alexandria Taxi License Plate & Door Emblem
function createTaxiPlateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // White Egyptian Taxi License Plate background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 128);

  // Turquoise header for Alexandria Commercial / Taxi
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 256, 44);

  // Top Text: EGYPT / مصر
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('مــصــر · ALEX', 128, 32);

  // Bottom plate numbers (Arabic letters & numbers)
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 46px Cairo, sans-serif';
  ctx.fillText('س ق ب ٤٩٢', 128, 96);

  // Border
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 122);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Taxi Door Decal with "Alexandria Taxi - أجرة الإسكندرية"
function createTaxiDoorDecalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f5b800'; // Yellow taxi door background
  ctx.fillRect(0, 0, 256, 128);

  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 240, 112);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 22px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('أجرة الإسكندرية', 128, 50);

  ctx.font = 'bold 18px Cairo, sans-serif';
  ctx.fillText('ALEXANDRIA TAXI', 128, 84);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Microbus side stripe texture
function createMicrobusStripeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 128);

  // Classic Alexandria Blue and Red swoosh stripe
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 50, 512, 24);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, 78, 512, 12);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 20px Cairo, sans-serif';
  ctx.fillText('إسكندرية — الكورنيش', 40, 42);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export interface TaxiVehicleMesh extends THREE.Group {
  frontLeftWheel?: THREE.Group;
  frontRightWheel?: THREE.Group;
  rearLeftWheel?: THREE.Group;
  rearRightWheel?: THREE.Group;
  chassisMesh?: THREE.Group;
  roofSignMesh?: THREE.Mesh;
  headlights?: THREE.Mesh[];
  taillights?: THREE.Mesh[];
}

export function createAlexandriaTaxi(style: 'classic' | 'modern' | 'golden' | 'racing' = 'classic'): TaxiVehicleMesh {
  const car = new THREE.Group() as TaxiVehicleMesh;

  // Root chassis container that rolls and pitches with vehicle dynamics
  const chassis = new THREE.Group();
  car.chassisMesh = chassis;
  car.add(chassis);

  // Shared high-spec PBR materials
  const blackPaint = new THREE.MeshStandardMaterial({
    color: style === 'golden' ? 0x221d12 : 0x111317,
    roughness: 0.22,
    metalness: style === 'golden' ? 0.6 : 0.2
  });

  const yellowPaint = new THREE.MeshStandardMaterial({
    color: style === 'golden' ? 0xf5c324 : style === 'racing' ? 0xffb703 : 0xf5b800,
    roughness: 0.28,
    metalness: style === 'golden' ? 0.7 : 0.15
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: style === 'golden' ? 0xffd166 : 0xd8e0e8,
    roughness: 0.1,
    metalness: 0.95
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.85,
    transparent: true,
    opacity: 0.75
  });

  const interiorMat = new THREE.MeshStandardMaterial({
    color: 0x2b1d12, // Warm brown faux leather upholstery
    roughness: 0.8
  });

  // 1. Lower chassis frame (Black lower panels)
  const lowerBodyGeo = new THREE.BoxGeometry(4.7, 0.7, 2.05);
  const lowerBody = new THREE.Mesh(lowerBodyGeo, blackPaint);
  lowerBody.position.set(0, 0.65, 0);
  lowerBody.castShadow = true;
  lowerBody.receiveShadow = true;
  chassis.add(lowerBody);

  // 2. Yellow Doors & Mid-section (The classic Alexandria livery)
  const midBodyGeo = new THREE.BoxGeometry(4.55, 0.55, 2.02);
  const midBody = new THREE.Mesh(midBodyGeo, yellowPaint);
  midBody.position.set(0, 1.15, 0);
  midBody.castShadow = true;
  midBody.receiveShadow = true;
  chassis.add(midBody);

  // Door emblem decals
  const doorDecalMat = new THREE.MeshBasicMaterial({
    map: createTaxiDoorDecalTexture(),
    polygonOffset: true,
    polygonOffsetFactor: -1
  });
  const leftDoorDecal = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.45), doorDecalMat);
  leftDoorDecal.position.set(-0.1, 1.15, 1.02);
  chassis.add(leftDoorDecal);

  const rightDoorDecal = leftDoorDecal.clone();
  rightDoorDecal.position.set(-0.1, 1.15, -1.02);
  rightDoorDecal.rotation.y = Math.PI;
  chassis.add(rightDoorDecal);

  // 3. Cabin & Greenhouse (Pillars & Roof)
  const cabinGeo = new THREE.BoxGeometry(2.35, 0.9, 1.76);
  const cabin = new THREE.Mesh(cabinGeo, blackPaint);
  cabin.position.set(-0.35, 1.75, 0);
  cabin.castShadow = true;
  chassis.add(cabin);

  // Roof cap
  const roofGeo = new THREE.BoxGeometry(2.2, 0.1, 1.74);
  const roof = new THREE.Mesh(roofGeo, yellowPaint);
  roof.position.set(-0.35, 2.22, 0);
  roof.castShadow = true;
  chassis.add(roof);

  // Windshield & Windows
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, 1.62), glassMat);
  windshield.position.set(0.85, 1.72, 0);
  windshield.rotation.z = -0.32;
  chassis.add(windshield);

  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.68, 1.58), glassMat);
  rearGlass.position.set(-1.52, 1.72, 0);
  rearGlass.rotation.z = 0.28;
  chassis.add(rearGlass);

  const sideGlassLeft = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.62, 0.08), glassMat);
  sideGlassLeft.position.set(-0.35, 1.72, 0.86);
  chassis.add(sideGlassLeft);

  const sideGlassRight = sideGlassLeft.clone();
  sideGlassRight.position.z = -0.86;
  chassis.add(sideGlassRight);

  // Interior seat & dashboard preview
  const dash = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 1.5), interiorMat);
  dash.position.set(0.5, 1.35, 0);
  chassis.add(dash);

  // Steering wheel
  const wheelTorus = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.03, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 })
  );
  wheelTorus.position.set(0.32, 1.55, 0.42);
  wheelTorus.rotation.y = Math.PI / 2;
  wheelTorus.rotation.z = -0.3;
  chassis.add(wheelTorus);

  // 4. Iconic Glowing "TAXI" Roof Sign
  const roofSignGroup = new THREE.Group();
  const signBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.24, 0.32),
    new THREE.MeshStandardMaterial({
      color: 0xfff3b0,
      emissive: 0xf5b800,
      emissiveIntensity: 0.7,
      roughness: 0.3
    })
  );
  signBase.position.set(0, 0.12, 0);
  signBase.castShadow = true;
  roofSignGroup.add(signBase);

  // Taxi sign feet
  const signFoot1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1), chromeMat);
  signFoot1.position.set(-0.25, 0.02, 0);
  roofSignGroup.add(signFoot1);
  const signFoot2 = signFoot1.clone();
  signFoot2.position.set(0.25, 0.02, 0);
  roofSignGroup.add(signFoot2);

  roofSignGroup.position.set(-0.35, 2.27, 0);
  chassis.add(roofSignGroup);
  car.roofSignMesh = signBase;

  // 5. Front Chrome Bumper & Classic Radiator Grille
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 2.12), chromeMat);
  frontBumper.position.set(2.4, 0.52, 0);
  frontBumper.castShadow = true;
  chassis.add(frontBumper);

  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 2.12), chromeMat);
  rearBumper.position.set(-2.4, 0.52, 0);
  rearBumper.castShadow = true;
  chassis.add(rearBumper);

  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.38, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8, metalness: 0.8 })
  );
  grille.position.set(2.36, 0.88, 0);
  chassis.add(grille);

  // 6. Alexandria License Plates (Front & Back)
  const plateMat = new THREE.MeshBasicMaterial({ map: createTaxiPlateTexture() });
  const frontPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.26), plateMat);
  frontPlate.position.set(2.45, 0.52, 0);
  frontPlate.rotation.y = Math.PI / 2;
  chassis.add(frontPlate);

  const rearPlate = frontPlate.clone();
  rearPlate.position.set(-2.45, 0.52, 0);
  rearPlate.rotation.y = -Math.PI / 2;
  chassis.add(rearPlate);

  // 7. Headlights & Taillights
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xfffae0,
    emissive: 0xffea79,
    emissiveIntensity: 0.95,
    roughness: 0.1
  });
  const headlightLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 16), headMat);
  headlightLeft.rotation.z = Math.PI / 2;
  headlightLeft.position.set(2.36, 0.92, 0.72);
  chassis.add(headlightLeft);

  const headlightRight = headlightLeft.clone();
  headlightRight.position.set(2.36, 0.92, -0.72);
  chassis.add(headlightRight);

  car.headlights = [headlightLeft, headlightRight];

  const tailMat = new THREE.MeshStandardMaterial({
    color: 0xd90429,
    emissive: 0xd90429,
    emissiveIntensity: 0.8,
    roughness: 0.2
  });
  const tailLightLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.42), tailMat);
  tailLightLeft.position.set(-2.36, 0.92, 0.72);
  chassis.add(tailLightLeft);

  const tailLightRight = tailLightLeft.clone();
  tailLightRight.position.set(-2.36, 0.92, -0.72);
  chassis.add(tailLightRight);

  car.taillights = [tailLightLeft, tailLightRight];

  // Side mirrors
  const mirrorLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.22), blackPaint);
  mirrorLeft.position.set(0.7, 1.48, 1.12);
  chassis.add(mirrorLeft);
  const mirrorRight = mirrorLeft.clone();
  mirrorRight.position.z = -1.12;
  chassis.add(mirrorRight);

  // 8. Rotating Wheels with Chrome Hubcaps
  function buildWheel(): THREE.Group {
    const wg = new THREE.Group();
    // Black rubber tire
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 })
    );
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    wg.add(tire);

    // Chrome hubcap
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.33, 12),
      chromeMat
    );
    rim.rotation.x = Math.PI / 2;
    wg.add(rim);

    return wg;
  }

  const flWheel = buildWheel(); flWheel.position.set(1.48, 0.42, 1.05); car.add(flWheel); car.frontLeftWheel = flWheel;
  const frWheel = buildWheel(); frWheel.position.set(1.48, 0.42, -1.05); car.add(frWheel); car.frontRightWheel = frWheel;
  const rlWheel = buildWheel(); rlWheel.position.set(-1.42, 0.42, 1.05); car.add(rlWheel); car.rearLeftWheel = rlWheel;
  const rrWheel = buildWheel(); rrWheel.position.set(-1.42, 0.42, -1.05); car.add(rrWheel); car.rearRightWheel = rrWheel;

  return car;
}

// Alexandria Toyota Microbus (ميكروباص الإسكندرية)
export function createAlexandriaMicrobus(): THREE.Group {
  const bus = new THREE.Group();

  const whitePaint = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.1 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x1e293b, roughness: 0.05, transmission: 0.8, transparent: true, opacity: 0.8 });
  const bumperMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

  // Main high-roof van body
  const body = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.9, 2.15), whitePaint);
  body.position.set(0, 1.45, 0);
  body.castShadow = true;
  bus.add(body);

  // Side stripe decal
  const stripeMat = new THREE.MeshBasicMaterial({ map: createMicrobusStripeTexture(), polygonOffset: true, polygonOffsetFactor: -1 });
  const leftStripe = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 0.6), stripeMat);
  leftStripe.position.set(0, 1.25, 1.08);
  bus.add(leftStripe);

  const rightStripe = leftStripe.clone();
  rightStripe.position.z = -1.08;
  rightStripe.rotation.y = Math.PI;
  bus.add(rightStripe);

  // Front sloped windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 1.8), glassMat);
  windshield.position.set(2.55, 1.85, 0);
  windshield.rotation.z = -0.25;
  bus.add(windshield);

  // Side windows row
  const sideGlassRow = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.65, 0.1), glassMat);
  sideGlassRow.position.set(-0.5, 1.85, 1.05);
  bus.add(sideGlassRow);
  const sideGlassRight = sideGlassRow.clone();
  sideGlassRight.position.z = -1.05;
  bus.add(sideGlassRight);

  // Bumpers
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 2.2), bumperMat);
  frontBumper.position.set(2.65, 0.6, 0);
  bus.add(frontBumper);

  // Wheels
  const tireGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.32, 12);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  [
    [1.7, 0.44, 1.05],
    [1.7, 0.44, -1.05],
    [-1.7, 0.44, 1.05],
    [-1.7, 0.44, -1.05]
  ].forEach(([x, y, z]) => {
    const w = new THREE.Mesh(tireGeo, tireMat);
    w.position.set(x, y, z);
    w.rotation.x = Math.PI / 2;
    w.castShadow = true;
    bus.add(w);
  });

  return bus;
}

// Egyptian Shaheen / Lada sedan (سيارة شاهين)
export function createShaheenSedan(color: number = 0x64748b): THREE.Group {
  const car = new THREE.Group();
  const paintMat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.25 });
  const blackTrim = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.1, transmission: 0.7, transparent: true, opacity: 0.85 });

  // Angular boxy 80s/90s sedan
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.8, 1.95), paintMat);
  body.position.set(0, 0.75, 0);
  body.castShadow = true;
  car.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.72, 1.68), paintMat);
  cabin.position.set(-0.25, 1.48, 0);
  cabin.castShadow = true;
  car.add(cabin);

  // Black side strips
  const strip = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 0.04), blackTrim);
  strip.position.set(0, 0.75, 0.99);
  car.add(strip);
  const stripR = strip.clone();
  stripR.position.z = -0.99;
  car.add(stripR);

  // Glass
  const frontWind = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.62, 1.55), glassMat);
  frontWind.position.set(0.82, 1.48, 0);
  frontWind.rotation.z = -0.32;
  car.add(frontWind);

  const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 12);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  [
    [1.4, 0.38, 0.96],
    [1.4, 0.38, -0.96],
    [-1.4, 0.38, 0.96],
    [-1.4, 0.38, -0.96]
  ].forEach(([x, y, z]) => {
    const w = new THREE.Mesh(tireGeo, tireMat);
    w.position.set(x, y, z);
    w.rotation.x = Math.PI / 2;
    w.castShadow = true;
    car.add(w);
  });

  return car;
}

// Modern Egyptian civilian sedan
export function createCivilianSedan(color: number = 0xd1d5db): THREE.Group {
  const car = new THREE.Group();
  const paintMat = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.4 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.05, transmission: 0.85, transparent: true, opacity: 0.8 });

  // Streamlined modern body
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.85, 2.05), paintMat);
  body.position.set(0, 0.75, 0);
  body.castShadow = true;
  car.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.76, 1.76), paintMat);
  cabin.position.set(-0.25, 1.52, 0);
  cabin.castShadow = true;
  car.add(cabin);

  // Sleek curved windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.68, 1.62), glassMat);
  windshield.position.set(0.96, 1.52, 0);
  windshield.rotation.z = -0.42;
  car.add(windshield);

  // Wheels
  const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  [
    [1.5, 0.42, 1.0],
    [1.5, 0.42, -1.0],
    [-1.5, 0.42, 1.0],
    [-1.5, 0.42, -1.0]
  ].forEach(([x, y, z]) => {
    const w = new THREE.Mesh(tireGeo, tireMat);
    w.position.set(x, y, z);
    w.rotation.x = Math.PI / 2;
    w.castShadow = true;
    car.add(w);
  });

  return car;
}
