'use client';

import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useTopologyStore } from '../../store/useTopologyStore';
import { RackCabinet } from './RackCabinet';
import { Cabling3D } from './Cabling3D';
import { Info, ShieldAlert, Cpu, Power, Server, ShieldCheck, Router, Network, Waypoints, X } from 'lucide-react';

export const RackView3D: React.FC = () => {
  const [connectTargetId, setConnectTargetId] = useState<string>('');
  const { 
    devices, 
    links, 
    activeDeviceId, 
    setActiveDeviceId,
    updateDevice,
    moveDeviceInRack,
    addLink,
    deleteLink,
    cabinetCount,
    addRack,
    deleteRack
  } = useTopologyStore();

  const devices3D = useMemo(() => {
    return devices;
  }, [devices]);

  const links3D = useMemo(() => {
    return links;
  }, [links]);



  // Group devices into cabinets dynamically based on role or manual overrides
  const cabinets = useMemo(() => {
    const list: typeof devices[] = Array.from({ length: cabinetCount }, () => []);

    devices.forEach((d) => {
      let cabIdx = d.rackCabinet;
      if (cabIdx === undefined) {
        switch (d.type) {
          case 'router':        cabIdx = 0; break;
          case 'firewall':      cabIdx = 1; break;
          case 'load-balancer': cabIdx = 2; break;
          case 'switch':        cabIdx = 3; break;
          case 'server':        cabIdx = 4; break;
          default:              cabIdx = 4;
        }
      }

      const finalCabIdx = Math.min(cabIdx, cabinetCount - 1);
      const slotIdx = d.rackSlot !== undefined ? d.rackSlot : list[finalCabIdx].length;

      if (finalCabIdx >= 0 && finalCabIdx < cabinetCount) {
        list[finalCabIdx].push({ ...d, rackSlot: slotIdx });
      }
    });

    list.forEach(cab => {
      cab.sort((a, b) => (a.rackSlot ?? 0) - (b.rackSlot ?? 0));
    });

    // Helper to assign a clean dominant label to each cabinet
    return list.map((cabDevices, idx) => {
      let label = `RACK CABINET ${idx + 1}`;
      if (cabDevices.length > 0) {
        const types = cabDevices.map(d => d.type);
        const mostCommonType = types.reduce((a, b, i, arr) => 
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        );
        switch (mostCommonType) {
          case 'router':        label = 'CORE ROUTERS'; break;
          case 'firewall':      label = 'FIREWALLS'; break;
          case 'load-balancer': label = 'LOAD BALANCERS'; break;
          case 'switch':        label = 'SWITCHES'; break;
          case 'server':        label = `SERVERS ${idx + 1}`; break;
          default:              label = `RACK CABINET ${idx + 1}`;
        }
      } else {
        label = `RACK CABINET ${idx + 1} (EMPTY)`;
      }

      return {
        devices: cabDevices,
        label,
      };
    });
  }, [devices, cabinetCount]);

  // Selected device for the overlay panel
  const activeDevice = useMemo(() => {
    return devices.find(d => d.id === activeDeviceId) || null;
  }, [devices, activeDeviceId]);

  // Calculate default camera target / focus point
  const cameraTarget: [number, number, number] = useMemo(() => {
    if (cabinets.length === 0) return [0, 3, 0];
    const totalRacks = cabinets.length;
    const spacing = 4.5;
    const middleX = ((totalRacks - 1) * spacing) / 2;
    return [middleX, 3.2, 0];
  }, [cabinets]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'router':       return <Router className="w-4 h-4" />;
      case 'switch':       return <Network className="w-4 h-4" />;
      case 'server':       return <Server className="w-4 h-4" />;
      case 'firewall':     return <ShieldCheck className="w-4 h-4" />;
      case 'load-balancer':return <Waypoints className="w-4 h-4" />;
      default:             return <Server className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative flex-1 h-full w-full bg-[#0f0f12] text-slate-200 overflow-hidden font-sans">
      {/* ── 3D Scene Canvas ── */}
      <Canvas
        camera={{ position: [cameraTarget[0], 6, 9], fov: 50 }}
        shadows
      >
        {/* Environment Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 12, 8]} 
          intensity={0.8} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.3} />

        {/* Floor Grid for perspective */}
        <Grid
          position={[0, -0.01, 0]}
          args={[40, 40]}
          cellSize={1.0}
          cellThickness={1.0}
          cellColor="#27272a"
          sectionSize={5.0}
          sectionThickness={1.5}
          sectionColor="#3f3f46"
          fadeDistance={30}
        />

        {/* Racks Group */}
        <group>
          {cabinets.map((cab, idx) => (
            <RackCabinet
              key={idx}
              devices={cab.devices}
              cabinetIndex={idx}
              activeDeviceId={activeDeviceId}
              setActiveDeviceId={setActiveDeviceId}
              label={cab.label}
            />
          ))}

          {/* Inter-rack patching cords */}
          <Cabling3D devices={devices3D} links={links3D} cabinetCount={cabinetCount} />
        </group>

        {/* Orbit Camera controls */}
        <OrbitControls 
          target={cameraTarget}
          maxPolarAngle={Math.PI / 2 - 0.05} // Don't allow camera under floor
          minDistance={3}
          maxDistance={25}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* ── Actions Panel Overlay (Top Left) ── */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 shadow-lg">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Drag to rotate • Scroll to zoom • Click unit to view details</span>
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={addRack}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl border border-blue-500/20 shadow-lg transition duration-150 flex items-center gap-1.5 cursor-pointer"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Add Cabinet</span>
          </button>
          <button
            onClick={deleteRack}
            disabled={cabinetCount <= 1}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl border border-red-500/20 shadow-lg transition duration-150 flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Delete Cabinet</span>
          </button>
        </div>
      </div>

      {/* ── Selected Device Detail Card ── */}
      {activeDevice && (
        <div 
          className="absolute right-4 top-4 z-10 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-350">
                {getDeviceIcon(activeDevice.type)}
              </div>
              <div>
                <span className="font-bold text-slate-100 text-xs block leading-none">{activeDevice.name}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mt-1">{activeDevice.type}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveDeviceId(null)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          <div className="mt-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tier:</span>
              <span className="font-semibold text-slate-300 capitalize">{activeDevice.tier}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Power Config:</span>
              <span className="font-semibold text-slate-300">
                {activeDevice.powerMode === 'redundant' ? 'Redundant Feeds' : 'Single Feed'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Simulated Outage:</span>
              <span className={`font-semibold ${activeDevice.isSimulatedDown ? 'text-red-400' : 'text-slate-400'}`}>
                {activeDevice.isSimulatedDown ? 'Shutdown Active' : 'Normal Operations'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Power Status:</span>
              <span className={`font-semibold ${activeDevice.isPowerLost ? 'text-amber-400' : 'text-slate-400'}`}>
                {activeDevice.isPowerLost ? 'Power Feed Lost' : 'Power Connected'}
              </span>
            </div>

            {/* Simulation Control Buttons */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Outage Simulation</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateDevice(activeDevice.id, { isSimulatedDown: !activeDevice.isSimulatedDown })}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 active:scale-95 cursor-pointer text-center ${
                    activeDevice.isSimulatedDown
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {activeDevice.isSimulatedDown ? 'Cancel Shutdown' : 'Shutdown Unit'}
                </button>
                <button
                  onClick={() => updateDevice(activeDevice.id, { isPowerLost: !activeDevice.isPowerLost })}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 active:scale-95 cursor-pointer text-center ${
                    activeDevice.isPowerLost
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {activeDevice.isPowerLost ? 'Restore Power' : 'Cut Power'}
                </button>
              </div>
            </div>

            {/* Rack Placement Controls */}
            {activeDevice && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Rack Placement</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Cabinet</label>
                    <select
                      value={activeDevice.rackCabinet !== undefined ? activeDevice.rackCabinet : (() => {
                        switch (activeDevice.type) {
                          case 'router': return 0;
                          case 'firewall': return 1;
                          case 'load-balancer': return 2;
                          case 'switch': return 3;
                          case 'server': return 4;
                          default: return 4;
                        }
                      })()}
                      onChange={(e) => {
                        const cabIdx = parseInt(e.target.value, 10);
                        const slotIdx = activeDevice.rackSlot !== undefined ? activeDevice.rackSlot : 0;
                        moveDeviceInRack(activeDevice.id, cabIdx, slotIdx);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      {cabinets.map((_, idx) => (
                        <option key={idx} value={idx}>
                          Rack {idx + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Slot Position</label>
                    <select
                      value={activeDevice.rackSlot !== undefined ? activeDevice.rackSlot : 0}
                      onChange={(e) => {
                        const slotIdx = parseInt(e.target.value, 10);
                        const cabIdx = activeDevice.rackCabinet !== undefined ? activeDevice.rackCabinet : (() => {
                          switch (activeDevice.type) {
                            case 'router': return 0;
                            case 'firewall': return 1;
                            case 'load-balancer': return 2;
                            case 'switch': return 3;
                            case 'server': return 4;
                            default: return 4;
                          }
                        })();
                        moveDeviceInRack(activeDevice.id, cabIdx, slotIdx);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <option key={idx} value={idx}>
                          Unit {idx + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Topology Editing (Manage Links) in 3D */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Topology Connections</span>
              
              {/* Existing Links List */}
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {links3D.filter(l => l.source === activeDevice.id || l.target === activeDevice.id).map(l => {
                  const peerId = l.source === activeDevice.id ? l.target : l.source;
                  const peerDevice = devices3D.find(d => d.id === peerId);
                  if (!peerDevice) return null;
                  return (
                    <div key={l.id} className="flex items-center justify-between bg-slate-850 border border-slate-800 px-2 py-1 rounded">
                      <span className="text-[10px] text-slate-300 truncate max-w-[120px]">{peerDevice.name}</span>
                      <button
                        onClick={() => deleteLink(l.id)}
                        className="text-[9px] font-bold text-red-400 hover:text-red-300 transition cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  );
                })}
                {links3D.filter(l => l.source === activeDevice.id || l.target === activeDevice.id).length === 0 && (
                  <span className="text-[9px] text-slate-500 italic block">No active connections.</span>
                )}
              </div>

              {/* Add Link Control */}
              <div className="pt-1.5 flex gap-1.5">
                <select
                  value={connectTargetId}
                  onChange={(e) => setConnectTargetId(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select target...</option>
                  {devices3D
                    .filter(d => {
                      if (d.id === activeDevice.id) return false;
                      const alreadyConnected = links3D.some(l => 
                        (l.source === activeDevice.id && l.target === d.id) ||
                        (l.source === d.id && l.target === activeDevice.id)
                      );
                      return !alreadyConnected;
                    })
                    .map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.type})
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => {
                    if (!connectTargetId) return;
                    addLink({ source: activeDevice.id, target: connectTargetId });
                    setConnectTargetId('');
                  }}
                  className="px-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold transition active:scale-95 cursor-pointer"
                >
                  Connect
                </button>
              </div>
            </div>

            {/* Status Badge */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-450 font-bold uppercase text-[9px] tracking-wider">Overall Status</span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                activeDevice.status === 'up'
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                  : activeDevice.status === 'degraded'
                  ? 'bg-amber-950/40 text-amber-400 border-amber-900/40'
                  : 'bg-red-950/40 text-red-400 border-red-900/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  activeDevice.status === 'up' ? 'bg-emerald-400' : activeDevice.status === 'degraded' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
                {activeDevice.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
