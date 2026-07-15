'use client';

import React, { useMemo, useRef } from 'react';
import { Device, Link } from '../../types';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Cabling3DProps {
  devices: Device[];
  links: Link[];
}

interface CableLineProps {
  link: Link;
  startPos: [number, number, number];
  endPos: [number, number, number];
  srcDev?: Device;
  tgtDev?: Device;
}

const CableLine: React.FC<CableLineProps> = ({ link, startPos, endPos, srcDev, tgtDev }) => {
  const isDown = 
    link.status === 'down' || 
    srcDev?.status === 'down' || 
    tgtDev?.status === 'down';

  const isDegraded = srcDev?.status === 'degraded' || tgtDev?.status === 'degraded';

  // Styling wires specifically based on their connection type and status
  let color = '#a1a1aa'; // default gray
  let lineWidth = 1.5;
  let packetColor = '#ffffff';

  if (isDown) {
    color = '#ef4444'; // Red for down/disconnected
    lineWidth = 2.0;
  } else if (srcDev && tgtDev) {
    const isCore = srcDev.tier === 'core' && tgtDev.tier === 'core';
    const isEdge = srcDev.tier === 'edge' || tgtDev.tier === 'edge';
    
    if (isCore) {
      color = '#06b6d4'; // Cyan for Core networks
      lineWidth = 3.0;
      packetColor = '#22d3ee';
    } else if (isEdge) {
      color = '#8b5cf6'; // Violet for Edge/Gateway links
      lineWidth = 2.2;
      packetColor = '#c084fc';
    } else if (srcDev.type === 'server' || tgtDev.type === 'server') {
      color = '#10b981'; // Green for Server access links
      lineWidth = 1.5;
      packetColor = '#34d399';
    } else {
      color = '#3b82f6'; // Blue for Distribution/Access switch links
      lineWidth = 1.8;
      packetColor = '#60a5fa';
    }
  }

  // Create a clean path routing curves (sag/catenary effect)
  const curve = useMemo(() => {
    const vStart = new THREE.Vector3(...startPos);
    const vEnd = new THREE.Vector3(...endPos);
    
    // Calculate a structured routing midpoint to look neat
    const midPoint = new THREE.Vector3(
      (startPos[0] + endPos[0]) / 2,
      Math.min(startPos[1], endPos[1]) - 0.4,
      (startPos[2] + endPos[2]) / 2 - 0.2
    );
    
    return new THREE.QuadraticBezierCurve3(vStart, midPoint, vEnd);
  }, [startPos, endPos]);

  // Points for rendering the Line component
  const linePoints = useMemo(() => {
    return curve.getPoints(20);
  }, [curve]);

  const packetRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);

  useFrame((state, delta) => {
    if (isDown || !packetRef.current) return;

    // Normal speed is 0.4, degraded speed is 0.15 (struggling)
    const speed = isDegraded ? 0.12 : 0.35;
    progressRef.current += delta * speed;
    if (progressRef.current >= 1) {
      progressRef.current = 0;
    }

    const currentPos = curve.getPointAt(progressRef.current);
    packetRef.current.position.copy(currentPos);
  });

  return (
    <group>
      <Line
        points={linePoints}
        color={color}
        lineWidth={lineWidth}
        dashed={isDown}
        dashSize={0.15}
        gapSize={0.1}
      />
      {!isDown && (
        <mesh ref={packetRef}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color={packetColor} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

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

        const srcDev = devices.find((d) => d.id === link.source);
        const tgtDev = devices.find((d) => d.id === link.target);

        return (
          <CableLine
            key={link.id}
            link={link}
            startPos={startPos}
            endPos={endPos}
            srcDev={srcDev}
            tgtDev={tgtDev}
          />
        );
      })}
    </group>
  );
};
