import { create } from 'zustand';
import { Device, Link, DeviceStatus } from '../types';
import { initialDevices, initialLinks } from '../utils/demoData';

interface TopologyState {
  devices: Device[];
  links: Link[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  activeDeviceId: string | null;
  setActiveDeviceId: (id: string | null) => void;
  activeTab: '2D' | '3D';
  setActiveTab: (tab: '2D' | '3D') => void;
  addDevice: (device: Omit<Device, 'status'>) => void;
  deleteDevice: (id: string) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  addLink: (link: Omit<Link, 'id' | 'status'>) => void;
  deleteLink: (id: string) => void;
  toggleLinkStatus: (id: string) => void;
  reset: () => void;
  importTopology: (devices: Device[], links: Link[]) => void;
  updateDevicePosition: (id: string, position: { x: number; y: number }) => void;
  setTopologyPositions: (positions: Record<string, { x: number; y: number }>) => void;
  moveDeviceInRack: (id: string, targetCabinet: number, targetSlot: number) => void;
  cabinetCount: number;
  addRack: () => void;
  deleteRack: (index?: number) => void;
  rackLabels: Record<number, string>;
  updateRackLabel: (index: number, label: string) => void;
}

// Reachability/Cascade Connectivity Simulation Logic
const computeSimulation = (devices: Device[], links: Link[]): Device[] => {
  // 1. Identify active root devices (Tiers: 'edge' and 'core')
  // A root device is active if it hasn't been simulated down,
  // and if it's single-feed, it hasn't lost power.
  const activeRoots = devices.filter(d => 
    (d.tier === 'core' || d.tier === 'edge') &&
    !d.isSimulatedDown &&
    !(d.powerMode === 'single-feed' && d.isPowerLost)
  );

  // 2. Build Adjacency List for reachability graph
  const adj: Record<string, string[]> = {};
  devices.forEach(d => {
    adj[d.id] = [];
  });

  links.forEach(l => {
    // Only traverse through links that are active ('up')
    if (l.status === 'up') {
      if (adj[l.source] && adj[l.target]) {
        adj[l.source].push(l.target);
        adj[l.target].push(l.source);
      }
    }
  });

  // 3. BFS to find reachable nodes from active root nodes
  const visited = new Set<string>();
  const queue: string[] = [];

  activeRoots.forEach(root => {
    visited.add(root.id);
    queue.push(root.id);
  });

  while (queue.length > 0) {
    const currId = queue.shift()!;
    const neighbors = adj[currId] || [];

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        const neighbor = devices.find(d => d.id === neighborId);
        if (neighbor) {
          // A node is operational and can propagate connectivity if:
          // - It is NOT simulated shut down
          // - If it is single-feed, it has NOT lost power
          const isNeighborActive = !neighbor.isSimulatedDown &&
            !(neighbor.powerMode === 'single-feed' && neighbor.isPowerLost);

          if (isNeighborActive) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }
    }
  }

  // 4. Update status for all devices based on reachability and power status
  return devices.map(d => {
    // Directly down if shut down or single-feed with power lost
    const isDirectlyDown = d.isSimulatedDown || (d.powerMode === 'single-feed' && d.isPowerLost);
    if (isDirectlyDown) {
      return { ...d, status: 'down' as DeviceStatus };
    }

    // Reachable path to root exists
    if (visited.has(d.id)) {
      if (d.isPowerLost && d.powerMode === 'redundant') {
        return { ...d, status: 'degraded' as DeviceStatus };
      }
      return { ...d, status: 'up' as DeviceStatus };
    }

    // Unreachable/Isolated goes down
    return { ...d, status: 'down' as DeviceStatus };
  });
};

export const useTopologyStore = create<TopologyState>((set) => {
  // Initialize with simulated states
  const initDevicesWithStatus = initialDevices.map(d => ({
    ...d,
    status: 'up' as DeviceStatus,
    isSimulatedDown: d.isSimulatedDown ?? false,
    isPowerLost: d.isPowerLost ?? false,
  }));
  const initialSimulatedDevices = computeSimulation(initDevicesWithStatus, initialLinks);

  return {
    devices: initialSimulatedDevices,
    links: initialLinks,
    showHistory: false,
    setShowHistory: (show) => set({ showHistory: show }),
    activeDeviceId: null,
    setActiveDeviceId: (id) => set({ activeDeviceId: id }),
    activeTab: '2D',
    setActiveTab: (tab) => set({ activeTab: tab }),

    addDevice: (newDevice) => set((state) => {
      const device: Device = {
        ...newDevice,
        status: 'up',
        isSimulatedDown: false,
        isPowerLost: false,
      };
      const updatedDevices = [...state.devices, device];
      return {
        devices: computeSimulation(updatedDevices, state.links),
      };
    }),

    deleteDevice: (id) => set((state) => {
      const updatedDevices = state.devices.filter(d => d.id !== id);
      // Remove any links connected to the deleted device
      const updatedLinks = state.links.filter(l => l.source !== id && l.target !== id);
      return {
        devices: computeSimulation(updatedDevices, updatedLinks),
        links: updatedLinks,
      };
    }),

    updateDevice: (id, updates) => set((state) => {
      const updatedDevices = state.devices.map(d => 
        d.id === id ? { ...d, ...updates } : d
      );
      return {
        devices: computeSimulation(updatedDevices, state.links),
      };
    }),

    addLink: (newLink) => set((state) => {
      // Avoid duplicate links between same devices
      const linkExists = state.links.some(l => 
        (l.source === newLink.source && l.target === newLink.target) ||
        (l.source === newLink.target && l.target === newLink.source)
      );
      if (linkExists) return {};

      const link: Link = {
        id: `link-${Date.now()}`,
        source: newLink.source,
        target: newLink.target,
        status: 'up',
      };
      const updatedLinks = [...state.links, link];
      return {
        links: updatedLinks,
        devices: computeSimulation(state.devices, updatedLinks),
      };
    }),

    deleteLink: (id) => set((state) => {
      const updatedLinks = state.links.filter(l => l.id !== id);
      return {
        links: updatedLinks,
        devices: computeSimulation(state.devices, updatedLinks),
      };
    }),

    toggleLinkStatus: (id) => set((state) => {
      const updatedLinks = state.links.map(l => 
        l.id === id ? { ...l, status: l.status === 'up' ? 'down' as const : 'up' as const } : l
      );
      return {
        links: updatedLinks,
        devices: computeSimulation(state.devices, updatedLinks),
      };
    }),

    reset: () => set((state) => {
      const resetDevices = state.devices.map(d => ({
        ...d,
        isSimulatedDown: false,
        isPowerLost: false,
        status: 'up' as DeviceStatus,
      }));
      const resetLinks = state.links.map(l => ({
        ...l,
        status: 'up' as const,
      }));
      return {
        devices: computeSimulation(resetDevices, resetLinks),
        links: resetLinks,
      };
    }),

    importTopology: (devices, links) => set(() => {
      // Ensure all devices have clean fields
      const cleanDevices = devices.map(d => ({
        ...d,
        isSimulatedDown: d.isSimulatedDown ?? false,
        isPowerLost: d.isPowerLost ?? false,
        status: d.status ?? 'up',
      }));
      return {
        devices: computeSimulation(cleanDevices, links),
        links: links,
      };
    }),

    updateDevicePosition: (id, position) => set((state) => ({
      devices: state.devices.map(d => d.id === id ? { ...d, position } : d),
    })),

    setTopologyPositions: (positions) => set((state) => ({
      devices: state.devices.map(d => positions[d.id] ? { ...d, position: positions[d.id] } : d),
    })),

    moveDeviceInRack: (id, targetCabinet, targetSlot) => set((state) => {
      const updatedDevices = state.devices.map(d => 
        d.id === id ? { ...d, rackCabinet: targetCabinet, rackSlot: targetSlot } : d
      );
      return {
        devices: computeSimulation(updatedDevices, state.links),
      };
    }),

    cabinetCount: 3,
    addRack: () => set((state) => ({ cabinetCount: state.cabinetCount + 1 })),
    deleteRack: (index) => set((state) => {
      const targetIdx = index !== undefined ? index : state.cabinetCount - 1;
      if (state.cabinetCount <= 1) return {};

      // Reset devices in deleted cabinet, shift indices for cabinets after
      const updatedDevices = state.devices.map((d) => {
        if (d.rackCabinet === targetIdx) {
          return { ...d, rackCabinet: undefined, rackSlot: undefined };
        }
        if (d.rackCabinet !== undefined && d.rackCabinet > targetIdx) {
          return { ...d, rackCabinet: d.rackCabinet - 1 };
        }
        return d;
      });

      // Shift rackLabels keys
      const newLabels: Record<number, string> = {};
      Object.entries(state.rackLabels).forEach(([keyStr, val]) => {
        const key = parseInt(keyStr, 10);
        if (key < targetIdx) {
          newLabels[key] = val;
        } else if (key > targetIdx) {
          newLabels[key - 1] = val;
        }
      });

      return {
        cabinetCount: state.cabinetCount - 1,
        devices: computeSimulation(updatedDevices, state.links),
        rackLabels: newLabels,
      };
    }),
    rackLabels: {},
    updateRackLabel: (index, label) => set((state) => ({
      rackLabels: { ...state.rackLabels, [index]: label }
    })),
  };
});
