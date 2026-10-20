/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface ArticulatedPedestrian extends THREE.Group {
  leftArm?: THREE.Group;
  rightArm?: THREE.Group;
  leftLeg?: THREE.Group;
  rightLeg?: THREE.Group;
  torso?: THREE.Mesh;
  head?: THREE.Group;
  isHailing?: boolean;
  hailArmAngle?: number;
  walkPhase?: number;
  walkSpeed?: number;
  updateAnimation?: (delta: number, isWalking: boolean, isHailing: boolean) => void;
}

// Egyptian realistic skin tone palettes
const SKIN_TONES = [0xd6b48c, 0xc59c72, 0xad8259, 0xe0c4a4, 0x8a623e];
// Egyptian casual clothing color palettes
const SHIRT_COLORS = [0x1d4ed8, 0x059669, 0xd97706, 0x475569, 0xf1f5f9, 0x9333ea, 0xb91c1c];
const PANTS_COLORS = [0x1e293b, 0x334155, 0x27272a, 0x4b5563, 0x78716c];
const HAIR_COLORS = [0x0f172a, 0x1c1917, 0x27272a, 0x44403c];

export function createAlexandriaPedestrian(isElderly: boolean = false, isFemale: boolean = false): ArticulatedPedestrian {
  const root = new THREE.Group() as ArticulatedPedestrian;

  const skinColor = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  const hairColor = isElderly ? 0xd4d4d8 : HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
  const shirtColor = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
  const pantsColor = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)];

  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 });

  // 1. Torso
  const torsoHeight = 0.68;
  const torsoWidth = isFemale ? 0.42 : 0.48;
  const torsoDepth = 0.26;
  const torsoGeo = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 1.25;
  torso.castShadow = true;
  root.add(torso);
  root.torso = torso;

  // 2. Head with facial features and hair / cap
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.76, 0);

  // Cranium / Face
  const faceGeo = new THREE.BoxGeometry(0.26, 0.3, 0.28);
  const face = new THREE.Mesh(faceGeo, skinMat);
  face.castShadow = true;
  headGroup.add(face);

  // Hair or cap
  if (isElderly) {
    // Egyptian Taqiyah / Keffiyeh cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.15, 0.12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
    );
    cap.position.y = 0.16;
    headGroup.add(cap);
  } else {
    // Hair mesh
    const hair = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.12, 0.3),
      hairMat
    );
    hair.position.y = 0.14;
    headGroup.add(hair);
  }

  // Sunglasses or subtle eyes
  const glasses = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.06, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2, metalness: 0.8 })
  );
  glasses.position.set(0, 0.04, 0.15);
  headGroup.add(glasses);

  root.add(headGroup);
  root.head = headGroup;

  // 3. Articulated Left Arm (Pivot at shoulder)
  const leftArm = new THREE.Group();
  leftArm.position.set(torsoWidth / 2 + 0.09, 1.52, 0);
  const leftSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.34, 0.14), shirtMat);
  leftSleeve.position.y = -0.17;
  leftSleeve.castShadow = true;
  leftArm.add(leftSleeve);
  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.12), skinMat);
  leftHand.position.y = -0.45;
  leftHand.castShadow = true;
  leftArm.add(leftHand);
  root.add(leftArm);
  root.leftArm = leftArm;

  // 4. Articulated Right Arm (Used for taxi hailing!)
  const rightArm = new THREE.Group();
  rightArm.position.set(-torsoWidth / 2 - 0.09, 1.52, 0);
  const rightSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.34, 0.14), shirtMat);
  rightSleeve.position.y = -0.17;
  rightSleeve.castShadow = true;
  rightArm.add(rightSleeve);
  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.12), skinMat);
  rightHand.position.y = -0.45;
  rightHand.castShadow = true;
  rightArm.add(rightHand);
  root.add(rightArm);
  root.rightArm = rightArm;

  // 5. Articulated Left Leg (Pivot at hip)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(0.13, 0.9, 0);
  const leftPants = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.2), pantsMat);
  leftPants.position.y = -0.32;
  leftPants.castShadow = true;
  leftLeg.add(leftPants);
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.16, 0.28), shoeMat);
  leftShoe.position.set(0, -0.7, 0.04);
  leftShoe.castShadow = true;
  leftLeg.add(leftShoe);
  root.add(leftLeg);
  root.leftLeg = leftLeg;

  // 6. Articulated Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(-0.13, 0.9, 0);
  const rightPants = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.2), pantsMat);
  rightPants.position.y = -0.32;
  rightPants.castShadow = true;
  rightLeg.add(rightPants);
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.16, 0.28), shoeMat);
  rightShoe.position.set(0, -0.7, 0.04);
  rightShoe.castShadow = true;
  rightLeg.add(rightShoe);
  root.add(rightLeg);
  root.rightLeg = rightLeg;

  root.walkPhase = Math.random() * Math.PI * 2;
  root.walkSpeed = 4.2;

  // Animation update loop
  root.updateAnimation = (delta: number, isWalking: boolean, isHailing: boolean) => {
    if (isHailing) {
      // Raise right arm to hail taxi, wave hand up and down
      root.walkPhase = (root.walkPhase || 0) + delta * 5.0;
      if (rightArm) {
        // Point arm forward-up
        rightArm.rotation.x = -Math.PI / 1.7 + Math.sin(root.walkPhase) * 0.2;
        rightArm.rotation.z = -0.3;
      }
      if (leftArm) {
        leftArm.rotation.x = 0;
        leftArm.rotation.z = 0.05;
      }
      if (leftLeg) leftLeg.rotation.x = 0;
      if (rightLeg) rightLeg.rotation.x = 0;
    } else if (isWalking) {
      root.walkPhase = (root.walkPhase || 0) + delta * (root.walkSpeed || 4.2);
      const swing = Math.sin(root.walkPhase) * 0.55;

      if (leftArm) leftArm.rotation.x = swing;
      if (rightArm) rightArm.rotation.x = -swing;
      if (leftLeg) leftLeg.rotation.x = -swing * 0.9;
      if (rightLeg) rightLeg.rotation.x = swing * 0.9;
    } else {
      // Idle breathing
      root.walkPhase = (root.walkPhase || 0) + delta * 1.5;
      const breath = Math.sin(root.walkPhase) * 0.04;
      if (torso) torso.position.y = 1.25 + breath;
      if (leftArm) leftArm.rotation.x = breath;
      if (rightArm) rightArm.rotation.x = breath;
      if (leftLeg) leftLeg.rotation.x = 0;
      if (rightLeg) rightLeg.rotation.x = 0;
    }
  };

  return root;
}
