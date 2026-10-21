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
  TimeOfDay,
  VehicleMode
} from '../types/game';
import { createAlexandriaMicrobus, createAlexandriaTaxi, TaxiVehicleMesh } from '../city/vehicleModels';
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
  vehicleMode: VehicleMode;
  stats: TaxiStats;
  setStats: React.Dispatch<React.SetStateAction<TaxiStats>>;
  onSaveProgress: () => void;
}

export const AlexandriaGame: React.FC<AlexandriaGameProps> = ({
  vehicleMode,
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
  const [sayMessage, setSayMessage] = useState<string | null>(vehicleMode === 'microbus' ? 'أهلاً بك في ميكروباص الإسكندرية! اتبع خط الكورنيش واستقبل الركاب.' : 'أهلاً بك في تاكسي الإسكندرية! دوّر على زبون أو اطلب رحلة.');
  const [canRefuel, setCanRefuel] = useState<boolean>(false);
  const [refuelCost, setRefuelCost] = useState<number>(0);
  const [isGarageOpen, setIsGarageOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [gameError, setGameError] = useState<string | null>(null);

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
  const cameraModeRef = useRef<CameraViewMode>(cameraMode);
  cameraModeRef.current = cameraMode;

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

    setGameError(null);
    let rendererForError: THREE.WebGLRenderer | null = null;
    try {
    soundEngine.init();

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      graphicSettings.drawDistance
    );

    const compactDevice = window.matchMedia('(max-width: 768px)').matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    rendererForError = renderer;
    // Keep high detail on desktop and cap render cost on smaller screens to avoid GPU resets.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactDevice ? 1.35 : 2));
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
    sunLight.shadow.mapSize.set(compactDevice ? 1024 : 2048, compactDevice ? 1024 : 2048);
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
    let playerTaxiMesh: TaxiVehicleMesh = vehicleMode === 'microbus'
      ? createAlexandriaMicrobus()
      : createAlexandriaTaxi(statsRef.current.paintStyle);
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
    let animFrameId: number;
    let lastUiUpdate = 0;
    let lastCanRefuel = false;
    let lastRefuelCost = -1;

    const clock = new THREE.Clock();

    const renderLoop = () => {
      animFrameId = requestAnimationFrame(renderLoop);
      try {
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
        cameraModeRef.current,
        vehicleMode
      );

      const pState = physics.state;
      // Keep simulation/rendering at full frame rate without forcing React to
      // reconcile the entire HUD on every animation frame.
      const now = performance.now();
      if (now - lastUiUpdate >= 100) {
        lastUiUpdate = now;
        setPlayerPos({
          x: pState.x,
          y: pState.y,
          z: pState.z,
          speed: pState.speed,
          yaw: pState.yaw
        });
        setActiveTrip(missionRef.current.activeTrip);
      }

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


      // 5. Gas Station Proximity Check
      const refuelStatus = missionRef.current.checkGasStationRefuel(
        { x: pState.x, y: pState.y, z: pState.z, speed: pState.speed },
        cityEnv.gasPumps,
        statsRef.current
      );
      const canRefuelNow = Boolean(refuelStatus?.canRefuel);
      const nextRefuelCost = canRefuelNow ? refuelStatus!.cost : 0;
      if (canRefuelNow !== lastCanRefuel) {
        lastCanRefuel = canRefuelNow;
        setCanRefuel(canRefuelNow);
      }
      if (canRefuelNow && nextRefuelCost !== lastRefuelCost) {
        lastRefuelCost = nextRefuelCost;
        setRefuelCost(nextRefuelCost);
      }

      // Render 3D Scene
      renderer.render(scene, camera);
      } catch (error) {
        cancelAnimationFrame(animFrameId);
        console.error('Alexandria game frame failed:', error);
        const detail = error instanceof Error ? error.message : String(error);
        setGameError('توقفت دورة الرسوم بسبب خطأ: ' + detail);
      }
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
      setGameError('فقد المتصفح الاتصال بكارت الشاشة. أعد تشغيل اللعبة، وإذا تكررت المشكلة حدّث تعريف كارت الشاشة.');
    };
    const canvasElem = renderer.domElement;
    canvasElem.addEventListener('webglcontextlost', handleContextLost);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      canvasElem.removeEventListener('webglcontextlost', handleContextLost);
      if (sayTimeoutRef.current !== null) {
        window.clearTimeout(sayTimeoutRef.current);
        sayTimeoutRef.current = null;
      }
      // Release scene-owned GPU resources when settings trigger a renderer rebuild
      // or the player leaves the game, preventing WebGL memory growth.
      scene.traverse(object => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : mesh.material ? [mesh.material] : [];
        materials.forEach(material => {
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) value.dispose();
          }
          material.dispose();
        });
      });
      scene.environment?.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    } catch (error) {
      console.error('Alexandria game initialization failed:', error);
      if (rendererForError) {
        const failedCanvas = rendererForError.domElement;
        rendererForError.dispose();
        if (container.contains(failedCanvas)) container.removeChild(failedCanvas);
      }
      const detail = error instanceof Error ? error.message : String(error);
      setGameError('تعذر تهيئة مشهد اللعبة ثلاثي الأبعاد: ' + detail);
    }
  }, [timeOfDay, graphicSettings.shadows, graphicSettings.trafficDensity, vehicleMode]);

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

      {gameError && (
        <div
          role="alert"
          className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-5 text-slate-100"
          dir="rtl"
        >
          <div className="w-full max-w-lg rounded-3xl border border-amber-500/40 bg-slate-900 p-6 text-center shadow-2xl">
            <h2 className="mb-3 text-2xl font-black text-amber-400">تعذر تشغيل الجرافيك ثلاثي الأبعاد</h2>
            <p className="mb-3 text-sm leading-7 text-slate-200">{gameError}</p>
            <p className="mb-5 text-xs leading-6 text-slate-400">
              حدّث تعريف كارت الشاشة وأغلق برامج تسجيل الشاشة التي تستخدم تسريع الرسوم، ثم أعد المحاولة.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950 hover:bg-amber-300"
            >
              إعادة تشغيل اللعبة
            </button>
          </div>
        </div>
      )}

      {/* Floating Arabic Game HUD Overlay */}
      <GameHUD
        vehicleMode={vehicleMode}
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
