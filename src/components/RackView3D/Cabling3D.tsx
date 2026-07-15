'use client';

import React, { useMemo, useRef } from 'react';
import { Device, Link } from '../../types';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';



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

  // Create a clean structured routing path (no messy sags)
  const curve = useMemo(() => {
    const vStart = new THREE.Vector3(...startPos);
    const vEnd = new THREE.Vector3(...endPos);
    const xa = startPos[0];
    const ya = startPos[1];
    const xb = endPos[0];
    const yb = endPos[1];
    const sameCabinet = Math.abs(xa - xb) < 0.1;

    if (sameCabinet) {
      // In-rack routing: curve out to the right side of the rack and run vertically
      const pointsList = [
        vStart,
        new THREE.Vector3(xa + 0.9, ya, -0.9),
        new THREE.Vector3(xa + 0.9, yb, -0.9),
        vEnd
      ];
      return new THREE.CatmullRomCurve3(pointsList, false, 'centripetal', 0.15);
    } else {
      // Inter-rack routing: go to back spine, run overhead at y=7.5, drop down at target rack
      const pointsList = [
        vStart,
        new THREE.Vector3(xa, ya, -1.3),
        new THREE.Vector3(xa, 7.5, -1.3),
        new THREE.Vector3(xb, 7.5, -1.3),
        new THREE.Vector3(xb, yb, -1.3),
        vEnd
      ];
      return new THREE.CatmullRomCurve3(pointsList, false, 'centripetal', 0.1);
    }
  }, [startPos, endPos]);

  // Points for rendering the Line component (higher subdivisions for smooth curves)
  const linePoints = useMemo(() => {
    return curve.getPoints(32);
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

interface Cabling3DProps {
  devices: Device[];
  links: Link[];
  cabinetCount: number;
}

export const Cabling3D: React.FC<Cabling3DProps> = ({ devices, links, cabinetCount }) => {
  const spacingBetweenRacks = 4.5;
  const verticalSpacing = 0.62;
  const startY = 0.5;

  // Resolve device positions map dynamically based on role groupings or manual overrides (max 8 units per rack)
  const devicePositions = useMemo(() => {
    const map: Record<string, { cabinetIdx: number; slotIdx: number }> = {};
    const cabinetLengths = Array.from({ length: cabinetCount }, () => 0);

    let currentDefaultCabIdx = 0;

    const groupRole = (roleType: string) => {
      const roleDevices = devices.filter(d => d.type === roleType && d.rackCabinet === undefined);
      
      roleDevices.forEach((d) => {
        if (cabinetLengths[currentDefaultCabIdx] >= 8) {
          currentDefaultCabIdx++;
        }
        
        const finalCabIdx = Math.min(currentDefaultCabIdx, cabinetCount - 1);
        map[d.id] = {
          cabinetIdx: finalCabIdx,
          slotIdx: cabinetLengths[finalCabIdx] + 1, // Shift slot index by 1 for bottom UPS placement
        };
        cabinetLengths[finalCabIdx]++;
      });
      
      if (roleDevices.length > 0) {
        currentDefaultCabIdx++;
      }
    };

    // First map all devices that have manual overrides
    devices.forEach((d) => {
      if (d.rackCabinet !== undefined) {
        const finalCabIdx = Math.min(d.rackCabinet, cabinetCount - 1);
        const slotIdx = d.rackSlot !== undefined ? d.rackSlot : cabinetLengths[finalCabIdx];
        map[d.id] = {
          cabinetIdx: finalCabIdx,
          slotIdx: slotIdx + 1, // Shift slot index by 1 for bottom UPS placement
        };
        cabinetLengths[finalCabIdx]++;
      }
    });

    groupRole('router');
    groupRole('firewall');
    groupRole('load-balancer');
    groupRole('switch');
    groupRole('server');

    return map;
  }, [devices, cabinetCount]);

  // Helper to resolve device 3D position
  const getDevicePos = (id: string): [number, number, number] | null => {
    const pos = devicePositions[id];
    if (!pos) return null;

    const posX = pos.cabinetIdx * spacingBetweenRacks;
    const posY = startY + pos.slotIdx * verticalSpacing;
    
    // Connect cables to the back side of the chassis (z = -0.9)
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
