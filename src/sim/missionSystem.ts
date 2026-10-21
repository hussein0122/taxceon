/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActiveTrip, Passenger, TaxiStats, VehicleMode } from '../types/game';
import { ALEXANDRIA_LANDMARKS, MICROBUS_ROUTE_STOP_IDS, PASSENGER_POOL } from '../city/alexandriaData';
import { soundEngine } from '../audio/soundEngine';

export class TaxiMissionSystem {
  public activeTrip: ActiveTrip | null = null;
  public availablePassenger: Passenger | null = null;
  private tripIndex: number = 0;
  private readonly vehicleMode: VehicleMode;

  constructor(vehicleMode: VehicleMode = 'taxi') {
    this.vehicleMode = vehicleMode;
    this.spawnNextPassenger();
  }

  public spawnNextPassenger() {
    const requestIndex = this.tripIndex;
    const template = PASSENGER_POOL[requestIndex % PASSENGER_POOL.length];
    this.tripIndex++;

    let pickupId = template.pickupId;
    let dropoffId = template.dropoffId;
    if (this.vehicleMode === 'microbus') {
      // A line service moves one stop at a time from Montaza to Qaitbay,
      // then reverses direction without duplicating the terminal stops.
      const eastToWest = [...MICROBUS_ROUTE_STOP_IDS];
      const lineLoop = [...eastToWest, ...eastToWest.slice(1, -1).reverse()];
      pickupId = lineLoop[requestIndex % lineLoop.length];
      dropoffId = lineLoop[(requestIndex + 1) % lineLoop.length];
    }

    const pickupLm = ALEXANDRIA_LANDMARKS.find(l => l.id === pickupId) || ALEXANDRIA_LANDMARKS[3];
    const dropoffLm = ALEXANDRIA_LANDMARKS.find(l => l.id === dropoffId) || ALEXANDRIA_LANDMARKS[7];

    const distEstimate = Math.hypot(
      pickupLm.position.x - dropoffLm.position.x,
      pickupLm.position.z - dropoffLm.position.z
    ) / 1000; // in km

    this.availablePassenger = {
      id: `trip_${Date.now()}`,
      nameAr: template.nameAr,
      avatarIcon: template.avatarIcon,
      pickupLocation: {
        x: pickupLm.position.x,
        y: pickupLm.position.y,
        z: pickupLm.position.z,
        nameAr: pickupLm.nameAr
      },
      dropoffLocation: {
        x: dropoffLm.position.x,
        y: dropoffLm.position.y,
        z: dropoffLm.position.z,
        nameAr: dropoffLm.nameAr
      },
      quoteAr: this.vehicleMode === 'microbus'
        ? `نازل عند ${dropoffLm.nameAr} يا أسطى، خليك ماشي على خط الكورنيش.`
        : template.quoteAr,
      fareBase: this.vehicleMode === 'microbus' ? 5.0 : 15.0,
      farePerKm: this.vehicleMode === 'microbus' ? 2.2 : 5.5
      urgency: template.urgency,
      personality: template.personality
    };
  }

  public acceptTrip() {
    if (!this.availablePassenger) return;

    this.activeTrip = {
      passenger: this.availablePassenger,
      state: 'to_pickup',
      distanceCoveredKm: 0,
      waitTimeSeconds: 0,
      currentFare: this.availablePassenger.fareBase,
      boardingTimer: 0,
      ratingScore: 5.0,
      tipAmount: 0
    };
    this.availablePassenger = null;
    soundEngine.playMeterBeep();
  }

  public update(
    delta: number,
    playerPos: { x: number; y: number; z: number; speed: number },
    stats: TaxiStats,
    onTripCompleted: (fare: number, tip: number, rating: number) => void,
    onMessageSay: (msg: string) => void
  ) {
    // 1. Consume fuel proportionally to engine speed & throttle
    if (stats.fuel > 0) {
      const consumption = (0.015 + (Math.abs(playerPos.speed) / 30) * 0.08) * delta;
      stats.fuel = Math.max(0, stats.fuel - consumption);
    }

    if (!this.activeTrip) return;

    const trip = this.activeTrip;
    const speedKmh = Math.abs(playerPos.speed * 3.6);

    if (trip.state === 'to_pickup') {
      const distToPickup = Math.hypot(
        playerPos.x - trip.passenger.pickupLocation.x,
        playerPos.z - trip.passenger.pickupLocation.z
      );

      // Player arrived at pickup spot and stopped
      if (distToPickup < 14 && speedKmh < 8) {
        trip.state = 'passenger_boarding';
        trip.boardingTimer = 2.4; // 2.4s boarding transition
        soundEngine.playDoorThud();
        onMessageSay(`${trip.passenger.nameAr}: "${trip.passenger.quoteAr}"`);
      }

    } else if (trip.state === 'passenger_boarding') {
      trip.boardingTimer -= delta;
      if (trip.boardingTimer <= 0) {
        trip.state = 'to_dropoff';
        soundEngine.playMeterBeep();
        onMessageSay(`تم تشغيل العداد — التوجه إلى: ${trip.passenger.dropoffLocation.nameAr}`);
      }

    } else if (trip.state === 'to_dropoff') {
      // Distance & fare accumulation
      const kmDelta = (Math.abs(playerPos.speed) * delta) / 1000;
      trip.distanceCoveredKm += kmDelta;

      // Waiting in traffic (speed < 5 km/h)
      if (speedKmh < 5) {
        trip.waitTimeSeconds += delta;
      }

      // Alexandria Taximeter calculation formula: Base + (Dist * Rate) + (WaitMinutes * WaitRate)
      const waitMinutes = trip.waitTimeSeconds / 60;
      trip.currentFare = Math.round(
        (trip.passenger.fareBase + trip.distanceCoveredKm * trip.passenger.farePerKm + waitMinutes * 2.0) * 10
      ) / 10;

      const distToDropoff = Math.hypot(
        playerPos.x - trip.passenger.dropoffLocation.x,
        playerPos.z - trip.passenger.dropoffLocation.z
      );

      // Arrived at dropoff spot and stopped
      if (distToDropoff < 16 && speedKmh < 8) {
        trip.state = 'passenger_alighting';
        trip.boardingTimer = 2.0;
        soundEngine.playDoorThud();
      }

    } else if (trip.state === 'passenger_alighting') {
      trip.boardingTimer -= delta;
      if (trip.boardingTimer <= 0) {
        // Calculate generous tip if rating was high
        const finalFare = Math.ceil(trip.currentFare);
        const tip = trip.ratingScore >= 4.5 ? Math.ceil(finalFare * 0.2) : 0;

        soundEngine.playCashRegister();
        onMessageSay(`${trip.passenger.nameAr}: "تسلم يا أسطى، الحساب ${finalFare} جنيه وخلي الباقي عشانك!"`);
        onTripCompleted(finalFare, tip, trip.ratingScore);

        this.activeTrip = null;
        this.spawnNextPassenger();
      }
    }
  }

  public registerPlayerCrash() {
    if (this.activeTrip && this.activeTrip.state === 'to_dropoff') {
      this.activeTrip.ratingScore = Math.max(1.0, this.activeTrip.ratingScore - 0.7);
    }
  }

  public checkGasStationRefuel(
    playerPos: { x: number; y: number; z: number; speed: number },
    gasPumps: any[],
    stats: TaxiStats
  ): { canRefuel: boolean; stationName: string; cost: number } | null {
    if (Math.abs(playerPos.speed) > 1.5) return null;

    for (const pump of gasPumps) {
      const dist = Math.hypot(playerPos.x - pump.position.x, playerPos.z - pump.position.z);
      if (dist < 14) {
        const neededFuel = stats.maxFuel - stats.fuel;
        if (neededFuel < 5) {
          return { canRefuel: false, stationName: 'محطة وقود الكورنيش', cost: 0 };
        }
        const cost = Math.ceil(neededFuel * 0.75); // 0.75 EGP per liter
        return { canRefuel: true, stationName: 'محطة تموين وقود الإسكندرية', cost };
      }
    }
    return null;
  }
}
