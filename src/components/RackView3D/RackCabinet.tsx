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
  isSelectedCabinet?: boolean;
  onSelectCabinet?: () => void;
}

export const RackCabinet: React.FC<RackCabinetProps> = ({
  devices,
  cabinetIndex,
  activeDeviceId,
  setActiveDeviceId,
  label,
  isSelectedCabinet = false,
  onSelectCabinet,
}) => {
  // Spacing in 3D scene
  const cabinetWidth = 2.4;
  const cabinetHeight = 5.8;
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
      {/* ── Simple Wireframe Cabinet Frame (See-through for maximum legibility) ── */}
      {/* Visual wireframe helper (no onClick event, so clicks pass through to devices inside!) */}
      <mesh position={[0, cabinetHeight / 2 - 0.2, 0]}>
        <boxGeometry args={[cabinetWidth, cabinetHeight, cabinetDepth]} />
        <meshBasicMaterial 
          color={isSelectedCabinet ? '#f59e0b' : '#4b5563'} 
          wireframe 
          transparent 
          opacity={isSelectedCabinet ? 0.6 : 0.25} 
        />
      </mesh>

      {/* Selection highlight for the cabinet itself */}
      {isSelectedCabinet && (
        <mesh position={[0, cabinetHeight / 2 - 0.2, 0]}>
          <boxGeometry args={[cabinetWidth + 0.1, cabinetHeight + 0.1, cabinetDepth + 0.1]} />
          <meshBasicMaterial color="#f59e0b" wireframe transparent opacity={0.3} />
        </mesh>
      )}

      {/* Top Cap frame bar (Clickable to select rack) */}
      <mesh 
        position={[0, cabinetHeight - 0.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectCabinet?.();
        }}
      >
        <boxGeometry args={[cabinetWidth, 0.08, cabinetDepth]} />
        <meshStandardMaterial color={isSelectedCabinet ? '#f59e0b' : '#374151'} metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Rack structural columns (corners) - Clickable to select cabinet */}
      {[
        [-cabinetWidth/2, -cabinetDepth/2],
        [cabinetWidth/2, -cabinetDepth/2],
        [-cabinetWidth/2, cabinetDepth/2],
        [cabinetWidth/2, cabinetDepth/2]
      ].map(([x, z], i) => (
        <mesh 
          key={i} 
          position={[x, cabinetHeight / 2 - 0.2, z]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectCabinet?.();
          }}
        >
          <cylinderGeometry args={[0.04, 0.04, cabinetHeight, 8]} />
          <meshStandardMaterial color={isSelectedCabinet ? '#f59e0b' : '#374151'} roughness={0.5} metalness={0.8} />
        </mesh>
      ))}

      {/* Cabinet Label */}
      <Html position={[0, cabinetHeight + 0.3, 0]} center>
        <div className="bg-slate-950/90 backdrop-blur-md text-slate-100 text-[10px] font-bold px-4 py-1.5 rounded-xl border border-slate-800 shadow-2xl whitespace-nowrap uppercase tracking-wider">
          {label}
        </div>
      </Html>

      {/* ── Render Industrial UPS (Power Backup Unit) at Slot 0 ── */}
      {(() => {
        const slotHeight = 0.5;
        const verticalSpacing = 0.62;
        const startY = 0.5;
        const posY = startY + 0 * verticalSpacing;
        return (
          <group position={[0, posY, 0]}>
            <mesh>
              <boxGeometry args={[2.0, slotHeight, 2.0]} />
              <meshStandardMaterial color="#1a1a24" roughness={0.6} metalness={0.9} />
            </mesh>
            <mesh position={[0, 0, 1.01]}>
              <planeGeometry args={[1.9, slotHeight - 0.08]} />
              <meshStandardMaterial color="#09090c" roughness={0.9} />
            </mesh>
            <mesh position={[-0.8, 0, 1.025]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshBasicMaterial color="#10b981" toneMapped={false} />
            </mesh>
            <Html position={[0, 0, 1.15]} center distanceFactor={8}>
              <div className="px-1.5 py-0.5 rounded text-[7px] font-bold tracking-wider select-none pointer-events-none bg-slate-950 text-slate-400 border border-slate-800 uppercase">
                UPS POWER BACKUP
              </div>
            </Html>
          </group>
        );
      })()}

      {/* ── Render Devices (stacked vertically starting at Slot 1) ── */}
      {devices.map((device, idx) => {
        const slotHeight = 0.5;
        const verticalSpacing = 0.62;
        const startY = 0.5;
        const slotIdx = (device.rackSlot !== undefined ? device.rackSlot : idx) + 1;
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
            {/* 3D Hardware Chassis */}
            <mesh>
              <boxGeometry args={[2.0, slotHeight, 2.0]} />
              <meshStandardMaterial 
                color={deviceColor} 
                roughness={0.5} 
                metalness={0.8} 
                emissive={isSelected ? '#3b82f6' : '#000000'}
                emissiveIntensity={isSelected ? 0.4 : 0}
              />
            </mesh>

            {/* Faceplate / Front Panel strip */}
            <mesh position={[0, 0, 1.01]}>
              <planeGeometry args={[1.9, slotHeight - 0.08]} />
              <meshStandardMaterial color="#09090d" roughness={0.9} />
            </mesh>

            {/* Blinking Indicator LED Strips on the front (Tactile feel) */}
            {Array.from({ length: 5 }).map((_, ledIdx) => (
              <mesh key={ledIdx} position={[-0.4 + ledIdx * 0.15, 0, 1.025]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshBasicMaterial 
                  color={device.status === 'down' ? '#dc2626' : device.status === 'degraded' ? '#d97706' : '#059669'} 
                  toneMapped={false}
                />
              </mesh>
            ))}

            {/* Main Power/Status LED indicator on the left side of front panel */}
            <mesh position={[-0.8, 0, 1.025]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color={statusColor} toneMapped={false} />
            </mesh>

            {/* Selection highlight frame */}
            {isSelected && (
              <mesh>
                <boxGeometry args={[2.05, slotHeight + 0.05, 2.05]} />
                <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.8} />
              </mesh>
            )}

            {/* HTML label showing device name on hover or click */}
            <Html 
              position={[0, 0, 1.15]} 
              center 
              distanceFactor={8}
            >
              <div 
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider select-none pointer-events-none transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-black/80 text-slate-400 border border-slate-900'
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
