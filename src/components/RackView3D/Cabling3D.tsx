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
    const dev = devices.find(d => d.id === id);
    if (!dev) return null;

    const cabinetIdx = dev.rackCabinet !== undefined ? dev.rackCabinet : Math.floor(devices.indexOf(dev) / 10);
    const slotIdx = dev.rackSlot !== undefined ? dev.rackSlot : devices.indexOf(dev) % 10;

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

        // Styling wires specifically based on their connection type and status
        let color = '#a1a1aa'; // default gray
        let lineWidth = 1.5;

        if (isDown) {
          color = '#ef4444'; // Red for down/disconnected
          lineWidth = 2.0;
        } else if (srcDev && tgtDev) {
          const isCore = srcDev.tier === 'core' && tgtDev.tier === 'core';
          const isEdge = srcDev.tier === 'edge' || tgtDev.tier === 'edge';
          
          if (isCore) {
            color = '#06b6d4'; // Cyan for Core networks
            lineWidth = 3.0; // Thicker backbone cables
          } else if (isEdge) {
            color = '#8b5cf6'; // Violet for Edge/Gateway links
            lineWidth = 2.2;
          } else if (srcDev.type === 'server' || tgtDev.type === 'server') {
            color = '#10b981'; // Green for Server access links
            lineWidth = 1.5;
          } else {
            color = '#3b82f6'; // Blue for Distribution/Access switch links
            lineWidth = 1.8;
          }
        }

        // Create a slight curve (catenary/sag effect) between ports
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
