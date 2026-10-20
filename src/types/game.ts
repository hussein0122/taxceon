/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vector2D {
  x: number;
  z: number;
}

export interface Landmark {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  position: { x: number; y: number; z: number };
  radius: number;
  type: 'fort' | 'bridge' | 'library' | 'station' | 'plaza' | 'mosque' | 'beach' | 'gas';
}

export interface RoadPoint {
  x: number;
  z: number;
  width: number;
  lanes: number;
  isCorniche?: boolean;
}

export interface RoadSegment {
  id: string;
  nameAr: string;
  points: RoadPoint[];
  speedLimit: number;
  lanes?: number;
}

export type TimeOfDay = 'day' | 'sunset' | 'night';

export type CameraViewMode = 'chase' | 'hood' | 'top' | 'cinematic';

export interface Passenger {
  id: string;
  nameAr: string;
  avatarIcon: string;
  pickupLocation: { x: number; y: number; z: number; nameAr: string };
  dropoffLocation: { x: number; y: number; z: number; nameAr: string };
  quoteAr: string;
  fareBase: number;
  farePerKm: number;
  urgency: 'normal' | 'rush' | 'relaxed';
  personality: 'friendly' | 'tourist' | 'student' | 'elderly';
}

export interface ActiveTrip {
  passenger: Passenger;
  state: 'to_pickup' | 'passenger_boarding' | 'to_dropoff' | 'passenger_alighting' | 'completed';
  distanceCoveredKm: number;
  waitTimeSeconds: number;
  currentFare: number;
  boardingTimer: number;
  ratingScore: number;
  tipAmount: number;
}

export interface TaxiStats {
  money: number;
  tripsCompleted: number;
  ratingAverage: number;
  fuel: number; // 0 - 100
  maxFuel: number;
  speedLevel: number; // 1 - 5
  accelLevel: number; // 1 - 5
  brakeLevel: number; // 1 - 5
  tankLevel: number; // 1 - 5
  paintStyle: 'classic' | 'modern' | 'golden' | 'racing';
}

export interface TrafficCar {
  id: number;
  type: 'microbus' | 'shaheen' | 'sedan' | 'taxi_ai' | 'suv';
  mesh: any;
  roadSegmentIndex: number;
  t: number;
  speed: number;
  targetSpeed: number;
  laneOffset: number;
  color: number;
}

export interface PedestrianData {
  id: number;
  mesh: any;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  state: 'walking' | 'idle' | 'hailing';
  facingAngle: number;
  walkCycle: number;
  isMale: boolean;
}

export interface ControlState {
  gas: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
  handbrake: boolean;
  reverse: boolean;
  horn: boolean;
}

export interface GraphicSettings {
  shadows: boolean;
  trafficDensity: 'low' | 'medium' | 'high';
  pedestrianCount: 'low' | 'medium' | 'high';
  drawDistance: number;
  soundEnabled: boolean;
}
