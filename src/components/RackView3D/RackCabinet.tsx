'use client';

import React from 'react';
import { Device, DeviceType } from '../../types';
import { Html } from '@react-three/drei';

interface RackCabinetProps {
  devices: Device[];
  cabinetIndex: number;
  activeDeviceId: string | null;
  setActiveDeviceId: (id: string | null) => void;
  label: string;
}

export const RackCabinet: React.FC<RackCabinetProps> = ({
  devices,
  cabinetIndex,
  activeDeviceId,
  setActiveDeviceId,
  label,
}) => {
  // Spacing in 3D scene
  const cabinetWidth = 2.4;
  const cabinetHeight = 7.0;
  const cabinetDepth = 2.4;
  const spacingBetweenRacks = 4.5;

  // X position of the cabinet in the room row
  const posX = cabinetIndex * spacingBetweenRacks;

  // Color mapping by device type
  const getTypeColor = (type: DeviceType) => {
    switch (type) {
      case 'router':        return '#3b82f6'; // Slate Blue
      case 'switch':        return '#10b981'; // Emerald
      case 'server':        return '#6366f1'; // Indigo
      case 'firewall':      return '#f43f5e'; // Rose
      case 'load-balancer': return '#f59e0b'; // Amber
      default:              return '#64748b'; // Slate
    }
  };

  // Color mapping by status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':       return '#10b981'; // Green
      case 'degraded': return '#f59e0b'; // Amber
      case 'down':     return '#ef4444'; // Red
      default:         return '#ef4444';
    }
  };

  return (
    <group position={[posX, 0, 0]}>
      {/* ── Cabinet Frame ── */}
      {/* Outer rack frame / cabinet box */}
      <mesh position={[0, cabinetHeight / 2 - 0.2, 0]}>
        <boxGeometry args={[cabinetWidth, cabinetHeight, cabinetDepth]} />
        <meshBasicMaterial 
          color="#374151" 
          wireframe 
          transparent 
          opacity={0.15} 
        />
      </mesh>

      {/* Rack structural columns (corners) */}
      {[
        [-cabinetWidth/2, -cabinetDepth/2],
        [cabinetWidth/2, -cabinetDepth/2],
        [-cabinetWidth/2, cabinetDepth/2],
        [cabinetWidth/2, cabinetDepth/2]
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, cabinetHeight / 2 - 0.2, z]}>
          <cylinderGeometry args={[0.08, 0.08, cabinetHeight, 8]} />
          <meshStandardMaterial color="#1f2937" roughness={0.7} metalness={0.2} />
        </mesh>
      ))}

      {/* Cabinet Label */}
      <Html position={[0, cabinetHeight + 0.3, 0]} center>
        <div className="bg-slate-900/90 backdrop-blur-sm text-slate-200 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-700 shadow-md whitespace-nowrap uppercase tracking-wider">
          {label}
        </div>
      </Html>

      {/* ── Render Devices (stacked vertically) ── */}
      {devices.map((device, idx) => {
        // Compute vertical position (slot offset)
        // 10 units maximum per cabinet. Height of each unit is 0.5 units, with 0.15 spacing.
        const slotHeight = 0.5;
        const verticalSpacing = 0.62;
        const startY = 0.5;
        const slotIdx = device.rackSlot !== undefined ? device.rackSlot : idx;
        const posY = startY + slotIdx * verticalSpacing;

        const isSelected = activeDeviceId === device.id;
        const deviceColor = getTypeColor(device.type);
        const statusColor = getStatusColor(device.status);

        return (
          <group 
            key={device.id} 
            position={[0, posY, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setActiveDeviceId(isSelected ? null : device.id);
            }}
          >
            {/* 3D Box representing the device: Solid hardware chassis */}
            <mesh>
              <boxGeometry args={[2.0, slotHeight, 2.0]} />
              <meshStandardMaterial 
                color={deviceColor} 
                roughness={0.4} 
                metalness={0.5} 
                emissive={isSelected ? '#3b82f6' : '#000000'}
                emissiveIntensity={isSelected ? 0.3 : 0}
              />
            </mesh>

            {/* Front Panel details (metal accent faceplate) */}
            <mesh position={[0, 0, 1.01]}>
              <planeGeometry args={[1.9, slotHeight - 0.05]} />
              <meshStandardMaterial color="#111827" roughness={0.9} />
            </mesh>

            {/* Small stylized grid vents on front faceplate */}
            <mesh position={[0.1, 0, 1.02]}>
              <planeGeometry args={[1.2, 0.15]} />
              <meshBasicMaterial color="#374151" />
            </mesh>

            {/* Selection highlight frame */}
            {isSelected && (
              <mesh>
                <boxGeometry args={[2.1, slotHeight + 0.1, 2.1]} />
                <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.6} />
              </mesh>
            )}

            {/* Status LED Sphere */}
            <mesh position={[-0.8, 0, 1.03]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshBasicMaterial color={statusColor} />
            </mesh>

            {/* HTML label showing device name on hover or click */}
            <Html 
              position={[0, 0, 1.2]} 
              center 
              distanceFactor={8}
            >
              <div 
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider select-none pointer-events-none transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-black/60 text-slate-300'
                }`}
              >
                {device.name}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
