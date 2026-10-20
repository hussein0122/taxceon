/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ActiveTrip,
  CameraViewMode,
  ControlState,
  GraphicSettings,
  Passenger,
  TaxiStats,
  TimeOfDay
} from '../types/game';
import { createAlexandriaTaxi, TaxiVehicleMesh } from '../city/vehicleModels';
import { buildAlexandriaCity, CityEnvironment } from '../city/cityBuilder';
import { TaxiPhysicsEngine } from '../sim/physicsEngine';
import { TrafficAndPedestrianSystem } from '../sim/trafficSystem';
import { TaxiMissionSystem } from '../sim/missionSystem';
import { soundEngine } from '../audio/soundEngine';
import { GameHUD } from './GameHUD';
import { TouchControls } from './TouchControls';
import { GarageModal } from './GarageModal';
import { SettingsModal } from './SettingsModal';

interface AlexandriaGameProps {
  stats: TaxiStats;
  setStats: React.Dispatch<React.SetStateAction<TaxiStats>>;
  onSaveProgress: () => void;
}

export const AlexandriaGame: React.FC<AlexandriaGameProps> = ({
  stats,
  setStats,
  onSaveProgress
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Game UI States
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [availablePassenger, setAvailablePassenger] = useState<Passenger | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: -50, y: 0, z: -45, speed: 0, yaw: Math.PI / 2 });
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('sunset'); // Default to glorious Alexandria sunset!
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sayMessage, setSayMessage] = useState<string | null>('أهلاً بك في تاكسي الإسكندرية! دوّر على زبون أو اطلب رحلة.');
  const [canRefuel, setCanRefuel] = useState<boolean>(false);
  const [refuelCost, setRefuelCost] = useState<number>(0);
  const [isGarageOpen, setIsGarageOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [graphicSettings, setGraphicSettings] = useState<GraphicSettings>({
    shadows: true,
    trafficDensity: 'medium',
    pedestrianCount: 'medium',
    drawDistance: 1200,
    soundEnabled: true
  });

  const [controls, setControls] = useState<ControlState>({
    gas: false,
    brake: false,
    left: false,
    right: false,
    handbrake: false,
    reverse: false,
    horn: false
  });

  // Engine refs
  const physicsRef = useRef<TaxiPhysicsEngine>(new TaxiPhysicsEngine());
  const missionRef = useRef<TaxiMissionSystem>(new TaxiMissionSystem());
  const controlsRef = useRef<ControlState>(controls);
  controlsRef.current = controls;

  const statsRef = useRef<TaxiStats>(stats);
  statsRef.current = stats;

  const sayTimeoutRef = useRef<number | null>(null);

  const showSay = (msg: string, durationMs: number = 4000) => {
    setSayMessage(msg);
    if (sayTimeoutRef.current) clearTimeout(sayTimeoutRef.current);
    sayTimeoutRef.current = window.setTimeout(() => setSayMessage(null), durationMs);
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      soundEngine.init();
      soundEngine.resume();

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControls(c => ({ ...c, gas: true }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControls(c => ({ ...c, brake: true }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControls(c => ({ ...c, left: true }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControls(c => ({ ...c, right: true }));
          break;
        case 'Space':
          setControls(c => ({ ...c, handbrake: true }));
          break;
        case 'KeyR':
          setControls(c => ({ ...c, reverse: !c.reverse }));
          break;
        case 'KeyH':
          setControls(c => ({ ...c, horn: true }));
          soundEngine.playHorn();
          break;
        case 'KeyC':
          setCameraMode(prev => {
            const modes: CameraViewMode[] = ['chase', 'hood', 'top', 'cinematic'];
            const nextIdx = (modes.indexOf(prev) + 1) % modes.length;
            return modes[nextIdx];
          });
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControls(c => ({ ...c, gas: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControls(c => ({ ...c, brake: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControls(c => ({ ...c, left: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControls(c => ({ ...c, right: false }));
          break;
        case 'Space':
          setControls(c => ({ ...c, handbrake: false }));
          break;
        case 'KeyH':
          setControls(c => ({ ...c, horn: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Three.js Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    soundEngine.init();

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      graphicSettings.drawDistance
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = graphicSettings.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. RoomEnvironment Reflections (Mandatory Three.js skill directive)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Dynamic Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x0369a1, 0.9);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    sunLight.position.set(120, 160, 80);
    sunLight.castShadow = graphicSettings.shadows;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left = -220;
    sunLight.shadow.camera.right = 220;
    sunLight.shadow.camera.top = 220;
    sunLight.shadow.camera.bottom = -220;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 600;
    scene.add(sunLight);

    // 4. Alexandria City Environment
    const cityEnv: CityEnvironment = buildAlexandriaCity(scene);

    // 5. Hero Player Taxi Model
    let playerTaxiMesh: TaxiVehicleMesh = createAlexandriaTaxi(statsRef.current.paintStyle);
    scene.add(playerTaxiMesh);

    // Headlights spot cones for night driving
    const headlightTarget = new THREE.Object3D();
    scene.add(headlightTarget);

    const headlightSpotL = new THREE.SpotLight(0xfff3b0, 0, 80, Math.PI / 4, 0.4);
    headlightSpotL.target = headlightTarget;
    scene.add(headlightSpotL);

    const headlightSpotR = new THREE.SpotLight(0xfff3b0, 0, 80, Math.PI / 4, 0.4);
    headlightSpotR.target = headlightTarget;
    scene.add(headlightSpotR);

    // 6. Traffic & Pedestrian AI System
    const trafficSys = new TrafficAndPedestrianSystem(scene, graphicSettings.trafficDensity);

    // Time of day setup helper
    const applyTimeOfDay = (tod: TimeOfDay) => {
      if (tod === 'day') {
        scene.background = new THREE.Color(0x93c5fd); // Vivid Mediterranean blue
        scene.fog = new THREE.Fog(0x93c5fd, 300, 1200);
        sunLight.color.setHex(0xfffae5);
        sunLight.intensity = 1.6;
        sunLight.position.set(120, 180, 80);
        hemiLight.intensity = 1.0;
        cityEnv.streetLamps.forEach(l => (l.intensity = 0));
        headlightSpotL.intensity = 0;
        headlightSpotR.intensity = 0;
      } else if (tod === 'sunset') {
        scene.background = new THREE.Color(0xfdba74); // Golden Alexandria Sunset
        scene.fog = new THREE.Fog(0xfdba74, 250, 1100);
        sunLight.color.setHex(0xfb923c);
        sunLight.intensity = 1.3;
        sunLight.position.set(160, 70, 100);
        hemiLight.intensity = 0.8;
        cityEnv.streetLamps.forEach(l => (l.intensity = 0.4));
        headlightSpotL.intensity = 0.8;
        headlightSpotR.intensity = 0.8;
      } else {
        // Night
        scene.background = new THREE.Color(0x090d16); // Alexandria midnight sky
        scene.fog = new THREE.Fog(0x090d16, 180, 800);
        sunLight.color.setHex(0x1e293b);
        sunLight.intensity = 0.15;
        hemiLight.intensity = 0.25;
        cityEnv.streetLamps.forEach(l => (l.intensity = 1.4));
        headlightSpotL.intensity = 2.4;
        headlightSpotR.intensity = 2.4;
      }
    };

    applyTimeOfDay(timeOfDay);

    // Pre-warm WebGL shaders per Three.js skill
    renderer.compile(scene, camera);

    // Initial trip passenger state sync
    setAvailablePassenger(missionRef.current.availablePassenger);

    // 7. Main Animation & Physics Loop
    let lastTime = performance.now();
    let animFrameId: number;

    const clock = new THREE.Clock();

    const renderLoop = () => {
      animFrameId = requestAnimationFrame(renderLoop);

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsedTime = clock.getElapsedTime();

      // 1. Vehicle Physics Update
      const physics = physicsRef.current;
      physics.update(
        delta,
        controlsRef.current,
        playerTaxiMesh,
        statsRef.current,
        camera,
        cameraMode
      );

      const pState = physics.state;
      setPlayerPos({
        x: pState.x,
        y: pState.y,
        z: pState.z,
        speed: pState.speed,
        yaw: pState.yaw
      });

      // Update Headlight Spotlights
      const forwardX = Math.sin(pState.yaw);
      const forwardZ = Math.cos(pState.yaw);
      headlightTarget.position.set(
        pState.x + forwardX * 30,
        pState.y + 0.5,
        pState.z + forwardZ * 30
      );
      headlightSpotL.position.set(
        pState.x + forwardX * 2.3 + Math.cos(pState.yaw) * 0.7,
        pState.y + 0.9,
        pState.z + forwardZ * 2.3 - Math.sin(pState.yaw) * 0.7
      );
      headlightSpotR.position.set(
        pState.x + forwardX * 2.3 - Math.cos(pState.yaw) * 0.7,
        pState.y + 0.9,
        pState.z + forwardZ * 2.3 + Math.sin(pState.yaw) * 0.7
      );

      // 2. City Environment Animation (Sea waves, beacons)
      cityEnv.update(elapsedTime);

      // 3. Traffic and Pedestrians AI Update
      trafficSys.update(
        delta,
        { x: pState.x, y: pState.y, z: pState.z, speed: pState.speed },
        () => {
          // On collision with traffic car
          physics.triggerCollision();
          missionRef.current.registerPlayerCrash();
          pState.speed *= 0.4;
        }
      );

      // 4. Mission System Update (Taximeter, Boarding, Destinations)
      missionRef.current.update(
        delta,
        { x: pState.x, y: pState.y, z: pState.z, speed: pState.speed },
        statsRef.current,
        (fare, tip, rating) => {
          // Trip Completed Handler
          const totalEarned = fare + tip;
          setStats(prev => {
            const newStats = {
              ...prev,
              money: prev.money + totalEarned,
              tripsCompleted: prev.tripsCompleted + 1,
              ratingAverage: (prev.ratingAverage * prev.tripsCompleted + rating) / (prev.tripsCompleted + 1)
            };
            return newStats;
          });
          onSaveProgress();
          setActiveTrip(null);
          setAvailablePassenger(missionRef.current.availablePassenger);
        },
        msg => showSay(msg)
      );

      setActiveTrip(missionRef.current.activeTrip);

      // 5. Gas Station Proximity Check
      const refuelStatus = missionRef.current.checkGasStationRefuel(
        { x: pState.x, y: pState.y, z: pState.z, speed: pState.speed },
        cityEnv.gasPumps,
        statsRef.current
      );
      if (refuelStatus && refuelStatus.canRefuel) {
        setCanRefuel(true);
        setRefuelCost(refuelStatus.cost);
      } else {
        setCanRefuel(false);
      }

      // Render 3D Scene
      renderer.render(scene, camera);
    };

    renderLoop();

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // WebGL Context Safety (per 3D spatial guidelines)
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animFrameId);
    };
    const canvasElem = renderer.domElement;
    canvasElem.addEventListener('webglcontextlost', handleContextLost);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      canvasElem.removeEventListener('webglcontextlost', handleContextLost);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [timeOfDay, graphicSettings.shadows, graphicSettings.trafficDensity]);

  // Handle passenger acceptance
  const handleAcceptPassenger = () => {
    missionRef.current.acceptTrip();
    setActiveTrip(missionRef.current.activeTrip);
    setAvailablePassenger(null);
    showSay('تم قبول الرحلة — اتبع سهم الـ GPS للوصول للزبون.');
  };

  // Handle Refuel Action
  const handleRefuel = () => {
    if (stats.money >= refuelCost) {
      setStats(prev => ({
        ...prev,
        money: prev.money - refuelCost,
        fuel: prev.maxFuel
      }));
      soundEngine.playMeterBeep();
      showSay('تم ملء خزان الوقود بالكامل! قيادة آمنة.');
      setCanRefuel(false);
      onSaveProgress();
    } else {
      showSay('الرصيد لا يكفي لتموين الوقود!');
    }
  };

  // Handle Upgrades from Garage
  const handleUpgrade = (type: 'speed' | 'accel' | 'brake' | 'tank', cost: number) => {
    if (stats.money >= cost) {
      setStats(prev => {
        const next = { ...prev, money: prev.money - cost };
        if (type === 'speed') next.speedLevel++;
        if (type === 'accel') next.accelLevel++;
        if (type === 'brake') next.brakeLevel++;
        if (type === 'tank') {
          next.tankLevel++;
          next.maxFuel += 25;
          next.fuel += 25;
        }
        return next;
      });
      soundEngine.playMeterBeep();
      showSay('تم ترقية السيارة بنجاح!');
      onSaveProgress();
    }
  };

  const handleSelectPaint = (paint: TaxiStats['paintStyle']) => {
    setStats(prev => ({ ...prev, paintStyle: paint }));
    showSay('تم تغيير دهان التاكسي السكندري!');
    onSaveProgress();
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none touch-none bg-slate-950">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Floating Arabic Game HUD Overlay */}
      <GameHUD
        stats={stats}
        activeTrip={activeTrip}
        availablePassenger={availablePassenger}
        playerPos={playerPos}
        timeOfDay={timeOfDay}
        cameraMode={cameraMode}
        isMuted={isMuted}
        sayMessage={sayMessage}
        canRefuel={canRefuel}
        refuelCost={refuelCost}
        onAcceptPassenger={handleAcceptPassenger}
        onCycleCamera={() => {
          const modes: CameraViewMode[] = ['chase', 'hood', 'top', 'cinematic'];
          const nextIdx = (modes.indexOf(cameraMode) + 1) % modes.length;
          setCameraMode(modes[nextIdx]);
        }}
        onCycleTimeOfDay={() => {
          const times: TimeOfDay[] = ['day', 'sunset', 'night'];
          const nextIdx = (times.indexOf(timeOfDay) + 1) % times.length;
          setTimeOfDay(times[nextIdx]);
        }}
        onToggleMute={() => {
          const newMute = !isMuted;
          setIsMuted(newMute);
          soundEngine.setMuted(newMute);
        }}
        onOpenGarage={() => setIsGarageOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefuel={handleRefuel}
      />

      {/* Mobile Touch Controls */}
      <TouchControls
        controls={controls}
        setControls={setControls}
        onHornPress={() => soundEngine.playHorn()}
      />

      {/* Garage Upgrades Modal */}
      {isGarageOpen && (
        <GarageModal
          stats={stats}
          onUpgrade={handleUpgrade}
          onSelectPaint={handleSelectPaint}
          onClose={() => setIsGarageOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={graphicSettings}
          setSettings={setGraphicSettings}
          timeOfDay={timeOfDay}
          setTimeOfDay={setTimeOfDay}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};
