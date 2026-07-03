export type DeviceType = 'router' | 'switch' | 'server' | 'firewall' | 'load-balancer';
export type PowerMode = 'single-feed' | 'redundant';
export type DeviceStatus = 'up' | 'down' | 'degraded';
export type DeviceTier = 'edge' | 'core' | 'distribution' | 'access' | 'server';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  powerMode: PowerMode;
  status: DeviceStatus;
  tier: DeviceTier;
  position: { x: number; y: number };
  isSimulatedDown?: boolean;
  isPowerLost?: boolean;
}

export interface Link {
  id: string;
  source: string;
  target: string;
  status: 'up' | 'down';
}
