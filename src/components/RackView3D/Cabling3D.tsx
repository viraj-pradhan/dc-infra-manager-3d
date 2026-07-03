'use client';

import React from 'react';
import { Device, Link } from '../../types';
import { Line } from '@react-three/drei';

interface Cabling3DProps {
  devices: Device[];
  links: Link[];
}

export const Cabling3D: React.FC<Cabling3DProps> = ({ devices, links }) => {
  // Spacing constants (must match RackCabinet.tsx exactly)
  const spacingBetweenRacks = 4.5;
  const verticalSpacing = 0.62;
  const startY = 0.5;

  // Helper to resolve device 3D position
  const getDevicePos = (id: string): [number, number, number] | null => {
    const globalIdx = devices.findIndex((d) => d.id === id);
    if (globalIdx === -1) return null;

    const cabinetIdx = Math.floor(globalIdx / 10);
    const slotIdx = globalIdx % 10;

    const posX = cabinetIdx * spacingBetweenRacks;
    const posY = startY + slotIdx * verticalSpacing;
    
    // Connect cables to the back side of the chassis (z = -0.9) to mimic real cables
    return [posX, posY, -0.9];
  };

  return (
    <group>
      {links.map((link) => {
        const startPos = getDevicePos(link.source);
        const endPos = getDevicePos(link.target);

        if (!startPos || !endPos) return null;

        // Determine status (red/dashed if down or connecting to down nodes)
        const srcDev = devices.find((d) => d.id === link.source);
        const tgtDev = devices.find((d) => d.id === link.target);
        
        const isDown = 
          link.status === 'down' || 
          srcDev?.status === 'down' || 
          tgtDev?.status === 'down';

        const color = isDown ? '#f87171' : '#a1a1aa'; // Light red vs Muted gray
        const lineWidth = isDown ? 2 : 1.5;

        // Create a slight curve (catenary/sag effect) between ports
        // Add a midpoint that sag downwards slightly
        const midPoint: [number, number, number] = [
          (startPos[0] + endPos[0]) / 2,
          Math.min(startPos[1], endPos[1]) - 0.4,
          (startPos[2] + endPos[2]) / 2 - 0.2,
        ];

        return (
          <group key={link.id}>
            <Line
              points={[startPos, midPoint, endPos]}
              color={color}
              lineWidth={lineWidth}
              dashed={isDown}
              dashSize={0.15}
              gapSize={0.1}
            />
          </group>
        );
      })}
    </group>
  );
};
