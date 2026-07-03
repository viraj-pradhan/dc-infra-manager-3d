import dagre from 'dagre';
import { Device, Link } from '../types';

export const getLayoutedPositions = (devices: Omit<Device, 'status'>[] | Device[], links: Link[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Set layout options
  // TB = Top to Bottom
  // nodesep = horizontal separation between adjacent nodes
  // ranksep = vertical separation between tiers
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 100 });

  devices.forEach((device) => {
    // Width and height of our custom network node card (approx. 200px x 80px)
    dagreGraph.setNode(device.id, { width: 200, height: 80 });
  });

  links.forEach((link) => {
    dagreGraph.setEdge(link.source, link.target);
  });

  dagre.layout(dagreGraph);

  const positions: Record<string, { x: number; y: number }> = {};
  devices.forEach((device) => {
    const nodeWithPosition = dagreGraph.node(device.id);
    
    // React Flow coordinate system is top-left based, Dagre is center based.
    // Subtract half-width (100) and half-height (40) to center properly.
    positions[device.id] = {
      x: nodeWithPosition.x - 100,
      y: nodeWithPosition.y - 40,
    };
  });

  return positions;
};
