import { Device, Link } from '../types';

export const initialDevices: Omit<Device, 'status'>[] = [
  // Edge/Firewall Tier
  {
    id: 'edge-fw-01',
    name: 'EDGE-FW-01',
    type: 'firewall',
    powerMode: 'redundant',
    tier: 'edge',
    position: { x: 0, y: 0 },
    isSimulatedDown: false,
    isPowerLost: false,
  },
  // Core Tier
  {
    id: 'core-rtr-01',
    name: 'CORE-RTR-01',
    type: 'router',
    powerMode: 'redundant',
    tier: 'core',
    position: { x: 0, y: 0 },
    isSimulatedDown: false,
    isPowerLost: false,
  },
  {
    id: 'core-rtr-02',
    name: 'CORE-RTR-02',
    type: 'router',
    powerMode: 'redundant',
    tier: 'core',
    position: { x: 0, y: 0 },
    isSimulatedDown: false,
    isPowerLost: false,
  },
  // Distribution Tier
  {
    id: 'dist-sw-01',
    name: 'DIST-SW-01',
    type: 'switch',
    powerMode: 'redundant',
    tier: 'distribution',
    position: { x: 0, y: 0 },
    isSimulatedDown: false,
    isPowerLost: false,
  },
  {
    id: 'dist-sw-02',
    name: 'DIST-SW-02',
    type: 'switch',
    powerMode: 'single-feed',
    tier: 'distribution',
    position: { x: 0, y: 0 },
    isSimulatedDown: false,
    isPowerLost: false,
  },
  // Access Tier
  {
    id: 'acc-sw-01',
    name: 'ACC-SW-01',
    type: 'switch',
    powerMode: 'single-feed',
    tier: 'access',
    position: { x: 0, y: 0 },
    isSimulatedDown: false,
    isPowerLost: false,
  },
  {
    id: 'acc-sw-02',
    name: 'ACC-SW-02',
    type: 'switch',
    powerMode: 'single-feed',
    tier: 'access',
    position: { x: 0, y: 0 },
    isSimulatedDown: false,
    isPowerLost: false,
  },
  {
    id: 'lb-app-01',
    name: 'LB-APP-01',
    type: 'load-balancer',
    powerMode: 'redundant',
    tier: 'access',
    position: { x: 0, y: 0 },
    isSimulatedDown: false,
    isPowerLost: false,
  },
  // Server Tier
  {
    id: 'web-srv-01',
    name: 'WEB-SRV-01',
    type: 'server',
    powerMode: 'single-feed',
    tier: 'server',
    position: { x: 0, y: 0 },
    isSimulatedDown: false,
    isPowerLost: false,
  },
  {
    id: 'app-srv-01',
    name: 'APP-SRV-01',
    type: 'server',
    powerMode: 'redundant',
    tier: 'server',
    position: { x: 0, y: 0 },
    isSimulatedDown: false,
    isPowerLost: false,
  },
  {
    id: 'db-srv-01',
    name: 'DB-SRV-01',
    type: 'server',
    powerMode: 'redundant',
    tier: 'server',
    position: { x: 0, y: 0 },
    isSimulatedDown: false,
    isPowerLost: false,
  },
];

export const initialLinks: Link[] = [
  // Edge to Core
  { id: 'l1', source: 'edge-fw-01', target: 'core-rtr-01', status: 'up' },
  { id: 'l2', source: 'edge-fw-01', target: 'core-rtr-02', status: 'up' },

  // Core to Distribution
  { id: 'l3', source: 'core-rtr-01', target: 'dist-sw-01', status: 'up' },
  { id: 'l4', source: 'core-rtr-01', target: 'dist-sw-02', status: 'up' },
  { id: 'l5', source: 'core-rtr-02', target: 'dist-sw-01', status: 'up' },
  { id: 'l6', source: 'core-rtr-02', target: 'dist-sw-02', status: 'up' },

  // Distribution to Access
  { id: 'l7', source: 'dist-sw-01', target: 'acc-sw-01', status: 'up' },
  { id: 'l8', source: 'dist-sw-02', target: 'acc-sw-02', status: 'up' },

  // Access to Load Balancer
  { id: 'l9', source: 'acc-sw-01', target: 'lb-app-01', status: 'up' },
  { id: 'l10', source: 'acc-sw-02', target: 'lb-app-01', status: 'up' },

  // Load Balancer to Web Server
  { id: 'l11', source: 'lb-app-01', target: 'web-srv-01', status: 'up' },

  // Access to App Server
  { id: 'l12', source: 'acc-sw-01', target: 'app-srv-01', status: 'up' },

  // Access to DB Server
  { id: 'l13', source: 'acc-sw-02', target: 'db-srv-01', status: 'up' },
];
