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
    // Steering pivot changes yaw; only the nested wheel assembly spins around its axle.
    const steeringPivot = new THREE.Group();
    steeringPivot.name = 'wheel-steering-pivot';
    const spinGroup = new THREE.Group();
    spinGroup.name = 'wheel-spin';
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.32, 20),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 })
    );
    tire.rotation.x = Math.PI / 2; // Axle runs along local Z (vehicle side-to-side).
    tire.castShadow = true;
    tire.receiveShadow = true;
    spinGroup.add(tire);

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.335, 16),
      chromeMat
    );
    rim.rotation.x = Math.PI / 2;
    spinGroup.add(rim);
    steeringPivot.add(spinGroup);
    steeringPivot.userData.spinGroup = spinGroup;
    return steeringPivot;
  }

  const flWheel = buildWheel(); flWheel.position.set(1.48, 0.42, 1.05); car.add(flWheel); car.frontLeftWheel = flWheel;
  const frWheel = buildWheel(); frWheel.position.set(1.48, 0.42, -1.05); car.add(frWheel); car.frontRightWheel = frWheel;
  const rlWheel = buildWheel(); rlWheel.position.set(-1.42, 0.42, 1.05); car.add(rlWheel); car.rearLeftWheel = rlWheel;
  const rrWheel = buildWheel(); rrWheel.position.set(-1.42, 0.42, -1.05); car.add(rrWheel); car.rearRightWheel = rrWheel;

  return car;
}

// Alexandria passenger microbus inspired by common Egyptian high-roof vans.
export function createAlexandriaMicrobus(): TaxiVehicleMesh {
  const bus = new THREE.Group() as TaxiVehicleMesh;
  bus.name = 'alexandria-microbus';

  const chassis = new THREE.Group();
  chassis.name = 'microbus-chassis';
  bus.chassisMesh = chassis;
  bus.add(chassis);

  const whitePaint = new THREE.MeshStandardMaterial({ color: 0xf4f1e8, roughness: 0.34, metalness: 0.08 });
  const bluePaint = new THREE.MeshStandardMaterial({ color: 0x1477a8, roughness: 0.32, metalness: 0.12 });
  const redPaint = new THREE.MeshStandardMaterial({ color: 0xb7352b, roughness: 0.38, metalness: 0.08 });
  const darkTrim = new THREE.MeshStandardMaterial({ color: 0x20262c, roughness: 0.75 });
  const bumperMat = new THREE.MeshStandardMaterial({ color: 0x343c43, roughness: 0.62, metalness: 0.25 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x223846, roughness: 0.15, metalness: 0.03,
    transmission: 0.28, transparent: true, opacity: 0.7, side: THREE.DoubleSide
  });
  const interiorMat = new THREE.MeshStandardMaterial({ color: 0x59483a, roughness: 0.86 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x8c765e, roughness: 0.86 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcbd3d8, roughness: 0.28, metalness: 0.82 });

  // Main body and separate lower sill give the van a recognizable tall Egyptian microbus silhouette.
  const body = new THREE.Mesh(new THREE.BoxGeometry(5.15, 2.12, 2.12), whitePaint);
  body.position.set(-0.03, 1.5, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  chassis.add(body);

  const lowerSill = new THREE.Mesh(new THREE.BoxGeometry(5.05, 0.32, 2.18), darkTrim);
  lowerSill.position.set(-0.02, 0.62, 0);
  chassis.add(lowerSill);

  // Front grille, bumpers, plate and headlights. Vehicle front faces +X in this project.
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.75), darkTrim);
  grille.position.set(2.57, 1.04, 0);
  chassis.add(grille);
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.25, 2.18), bumperMat);
  frontBumper.position.set(2.61, 0.56, 0);
  chassis.add(frontBumper);
  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 2.18), bumperMat);
  rearBumper.position.set(-2.62, 0.55, 0);
  chassis.add(rearBumper);

  const plateMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.18, 0.42), plateMat);
  plate.position.set(2.69, 0.68, 0);
  chassis.add(plate);

  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfff5d6, emissive: 0xffdf88, emissiveIntensity: 0.7,
    roughness: 0.18, metalness: 0.05
  });
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c, emissive: 0x7f1d1d, emissiveIntensity: 0.45, roughness: 0.28
  });
  const headlights: THREE.Mesh[] = [];
  const taillights: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.24, 0.34), headlightMat);
    headlight.position.set(2.61, 1.18, side * 0.78);
    chassis.add(headlight);
    headlights.push(headlight);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.36, 0.26), tailLightMat);
    tail.position.set(-2.62, 1.02, side * 0.82);
    chassis.add(tail);
    taillights.push(tail);

    const mirrorStem = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.06), darkTrim);
    mirrorStem.position.set(2.1, 1.73, side * 1.1);
    chassis.add(mirrorStem);
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.1), darkTrim);
    mirror.position.set(2.2, 1.78, side * 1.13);
    chassis.add(mirror);
  }
  bus.headlights = headlights;
  bus.taillights = taillights;

  // Sloped windshield and rear glass.
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.82, 1.76), glassMat);
  windshield.position.set(2.24, 2.08, 0);
  windshield.rotation.z = -0.14;
  chassis.add(windshield);
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.78, 1.72), glassMat);
  rearGlass.position.set(-2.59, 2.0, 0);
  chassis.add(rearGlass);

  // Side glazing split into individual panes and pillars rather than one flat strip.
  const windowXs = [-1.62, -0.72, 0.18, 1.08];
  for (const side of [-1, 1]) {
    for (let i = 0; i < windowXs.length; i++) {
      const pane = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.68, 0.045), glassMat);
      pane.position.set(windowXs[i], 2.04, side * 1.071);
      chassis.add(pane);
      const divider = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.82, 0.065), darkTrim);
      divider.position.set(windowXs[i] + 0.43, 2.02, side * 1.085);
      chassis.add(divider);
    }
  }

  // Windshield wipers and sliding-door seams.
  for (const side of [-1, 1]) {
    const doorTrack = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.035, 0.035), darkTrim);
    doorTrack.position.set(-0.25, 1.54, side * 1.075);
    chassis.add(doorTrack);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.045), darkTrim);
    handle.position.set(-0.72, 1.2, side * 1.09);
    chassis.add(handle);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.18, 0.025), bluePaint);
    stripe.position.set(-0.05, 1.02, side * 1.085);
    chassis.add(stripe);
    const thinStripe = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.065, 0.027), redPaint);
    thinStripe.position.set(-0.05, 0.88, side * 1.09);
    chassis.add(thinStripe);
  }

  // Simple interior visible through the windows: dashboard and four rows of seats.
  const dashboard = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 1.55), interiorMat);
  dashboard.position.set(1.78, 1.35, 0);
  chassis.add(dashboard);
  for (let row = 0; row < 4; row++) {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.58, 1.42), seatMat);
    seat.position.set(1.1 - row * 0.83, 1.05, 0);
    chassis.add(seat);
    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.58, 1.42), interiorMat);
    seatBack.position.set(0.82 - row * 0.83, 1.34, 0);
    chassis.add(seatBack);
  }

  // Low-poly roof light, a common local route sign.
  const routeSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.14, 0.32),
    new THREE.MeshStandardMaterial({ color: 0xeff6ff, emissive: 0x1d4ed8, emissiveIntensity: 0.18, roughness: 0.38 })
  );
  routeSign.position.set(0.1, 2.63, 0);
  chassis.add(routeSign);

  // Front steering pivots and axle-aligned spin groups, consistent with the taxi physics.
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x151719, roughness: 0.92 });
  function buildWheel(): THREE.Group {
    const pivot = new THREE.Group();
    pivot.name = 'microbus-wheel-pivot';
    const spinGroup = new THREE.Group();
    spinGroup.name = 'microbus-wheel-spin';
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.3, 18), tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    tire.receiveShadow = true;
    spinGroup.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.315, 16), chromeMat);
    rim.rotation.x = Math.PI / 2;
    spinGroup.add(rim);
    pivot.add(spinGroup);
    pivot.userData.spinGroup = spinGroup;
    return pivot;
  }
  const fl = buildWheel(); fl.position.set(1.72, 0.43, 1.08); bus.add(fl); bus.frontLeftWheel = fl;
  const fr = buildWheel(); fr.position.set(1.72, 0.43, -1.08); bus.add(fr); bus.frontRightWheel = fr;
  const rl = buildWheel(); rl.position.set(-1.67, 0.43, 1.08); bus.add(rl); bus.rearLeftWheel = rl;
  const rr = buildWheel(); rr.position.set(-1.67, 0.43, -1.08); bus.add(rr); bus.rearRightWheel = rr;

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
