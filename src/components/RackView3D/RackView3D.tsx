'use client';

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useTopologyStore } from '../../store/useTopologyStore';
import { RackCabinet } from './RackCabinet';
import { Cabling3D } from './Cabling3D';
import { Info, ShieldAlert, Cpu, Power, Server, ShieldCheck, Router, Network, Waypoints, X } from 'lucide-react';

export const RackView3D: React.FC = () => {
  const { 
    devices, 
    links, 
    activeDeviceId, 
    setActiveDeviceId,
    updateDevice,
    moveDeviceInRack
  } = useTopologyStore();

  // Group devices into cabinets of 10 units each sequentially
  const cabinets = useMemo(() => {
    const cabList: typeof devices[] = [];
    for (let i = 0; i < devices.length; i += 10) {
      cabList.push(devices.slice(i, i + 10));
    }
    return cabList;
  }, [devices]);

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
          {cabinets.map((cabDevices, idx) => (
            <RackCabinet
              key={idx}
              devices={cabDevices}
              cabinetIndex={idx}
              activeDeviceId={activeDeviceId}
              setActiveDeviceId={setActiveDeviceId}
            />
          ))}

          {/* Inter-rack patching cords */}
          <Cabling3D devices={devices} links={links} />
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

      {/* ── Instruction Overlay Badge ── */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl text-[10px] font-semibold tracking-wider text-slate-400 pointer-events-none uppercase flex items-center gap-1.5 shadow-lg">
        <Info className="w-3.5 h-3.5 text-blue-500" />
        <span>Drag to rotate • Scroll to zoom • Click unit to view details</span>
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

            {/* Rack Placement Controls (Only for Switches and Routers) */}
            {(activeDevice.type === 'switch' || activeDevice.type === 'router') && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Rack Placement</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Cabinet</label>
                    <select
                      value={Math.floor(devices.findIndex(d => d.id === activeDevice.id) / 10)}
                      onChange={(e) => {
                        const cabIdx = parseInt(e.target.value, 10);
                        const devIdx = devices.findIndex(d => d.id === activeDevice.id);
                        const slotIdx = devIdx % 10;
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
                      value={devices.findIndex(d => d.id === activeDevice.id) % 10}
                      onChange={(e) => {
                        const slotIdx = parseInt(e.target.value, 10);
                        const devIdx = devices.findIndex(d => d.id === activeDevice.id);
                        const cabIdx = Math.floor(devIdx / 10);
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
