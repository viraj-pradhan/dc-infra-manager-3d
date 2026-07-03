import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useReactFlow,
  useViewport,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import { useTopologyStore } from '../store/useTopologyStore';
import { NetworkNode } from './NetworkNode';
import { NodePopover } from './NodePopover';
import { Toolbar } from './Toolbar';
import { Legend } from './Legend';
import { AddDeviceFab } from './AddDeviceFab';
import { getLayoutedPositions } from '../utils/layout';
import { useTheme } from '../context/ThemeContext';

// Defined outside component — prevents React Flow warning #002
const nodeTypes = { networkNode: NetworkNode };

export const NetworkCanvas: React.FC = () => {
  const {
    devices,
    links,
    updateDevicePosition,
    setTopologyPositions,
    addLink,
    deleteLink,
    toggleLinkStatus,
    activeDeviceId,
    setActiveDeviceId,
  } = useTopologyStore();

  const { fitView } = useReactFlow();
  const { x: vpX, y: vpY, zoom } = useViewport();
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // ─── Link popover state ────────────────────────────────────────────────────
  const [activeLinkPopover, setActiveLinkPopover] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  // ─── Initial dagre layout ─────────────────────────────────────────────────
  useEffect(() => {
    const positions = getLayoutedPositions(devices, links);
    setTopologyPositions(positions);
    const timer = setTimeout(() => fitView({ padding: 0.18, duration: 600 }), 150);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── React Flow nodes ─────────────────────────────────────────────────────
  const flowNodes: Node[] = useMemo(() =>
    devices.map((d) => ({
      id: d.id,
      type: 'networkNode',
      data: d,
      position: d.position,
      selected: d.id === activeDeviceId,
    })),
  [devices, activeDeviceId]);

  // ─── React Flow edges ─────────────────────────────────────────────────────
  const flowEdges: Edge[] = useMemo(() =>
    links.map((l) => {
      const srcDown = devices.find((d) => d.id === l.source)?.status === 'down';
      const tgtDown = devices.find((d) => d.id === l.target)?.status === 'down';
      const isDown = l.status === 'down' || srcDown || tgtDown;
      const srcUp   = devices.find((d) => d.id === l.source)?.status === 'up';
      const tgtUp   = devices.find((d) => d.id === l.target)?.status === 'up';
      return {
        id: l.id,
        source: l.source,
        target: l.target,
        type: 'smoothstep',
        animated: !isDown && srcUp && tgtUp,
        style: isDown
          ? { stroke: '#F87171', strokeWidth: 2, strokeDasharray: '5,4' }
          : { stroke: '#CBD5E1', strokeWidth: 2 },
      };
    }),
  [links, devices]);

  // ─── Compute popover screen position from flow coordinates ────────────────
  const popoverScreenPos = useMemo(() => {
    if (!activeDeviceId) return null;
    const dev = devices.find((d) => d.id === activeDeviceId);
    if (!dev) return null;
    // Convert flow-space position → screen-space position inside the container
    const screenX = dev.position.x * zoom + vpX + 216; // 200px node width + 16px gap
    const screenY = dev.position.y * zoom + vpY;
    return { x: screenX, y: screenY };
  }, [activeDeviceId, devices, zoom, vpX, vpY]);

  // ─── Active device for popover ────────────────────────────────────────────
  const activeDevice = useMemo(
    () => devices.find((d) => d.id === activeDeviceId) ?? null,
    [devices, activeDeviceId]
  );

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const onNodeDragStop = (_e: React.MouseEvent, node: Node) => {
    updateDevicePosition(node.id, node.position);
  };

  const onNodeClick = (_e: React.MouseEvent, node: Node) => {
    setActiveLinkPopover(null);
    // Toggle: clicking the same node again closes the popover
    setActiveDeviceId(activeDeviceId === node.id ? null : node.id);
  };

  const onConnect = (connection: Connection) => {
    if (connection.source && connection.target) {
      addLink({ source: connection.source, target: connection.target });
    }
  };

  const onEdgesDelete = (edgesToDelete: Edge[]) => {
    edgesToDelete.forEach((e) => deleteLink(e.id));
    if (activeLinkPopover && edgesToDelete.some((e) => e.id === activeLinkPopover.id)) {
      setActiveLinkPopover(null);
    }
  };

  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setActiveDeviceId(null);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setActiveLinkPopover({
        id: edge.id,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 44,
      });
    }
  };

  const onPaneClick = () => {
    setActiveDeviceId(null);
    setActiveLinkPopover(null);
  };

  // Link popover data
  const selectedLink       = useMemo(() => links.find((l) => l.id === activeLinkPopover?.id) ?? null, [activeLinkPopover, links]);
  const selectedLinkSource = useMemo(() => devices.find((d) => d.id === selectedLink?.source) ?? null, [selectedLink, devices]);
  const selectedLinkTarget = useMemo(() => devices.find((d) => d.id === selectedLink?.target) ?? null, [selectedLink, devices]);

  return (
    // Outer container — popover is a sibling of <ReactFlow>, NOT a child
    <div ref={containerRef} className="relative flex-1 h-full overflow-hidden">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        deleteKeyCode={['Backspace', 'Delete']}
        // Disable built-in node selection so our state fully controls it
        selectNodesOnDrag={false}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color={theme === 'dark' ? '#334155' : '#E2E8F0'} />
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="!bottom-20 !right-4 !shadow-md !border-slate-200 dark:!border-slate-800 !rounded-lg"
        />
        <Toolbar />
        <Legend />
        <AddDeviceFab />

        {/* ── Link popover (inside ReactFlow for coordinate alignment) ── */}
        {activeLinkPopover && selectedLink && (
          <div
            className="absolute z-50 bg-white dark:bg-[#1E1E21] rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-xl flex flex-col gap-2.5 font-sans w-56 text-xs text-slate-800 dark:text-slate-200 nodrag nowheel"
            style={{ left: activeLinkPopover.x, top: activeLinkPopover.y }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white">Link Properties</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                selectedLink.status === 'up'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                  : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30'
              }`}>
                {selectedLink.status.toUpperCase()}
              </span>
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Source:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedLinkSource?.name ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Target:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedLinkTarget?.name ?? '—'}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => toggleLinkStatus(selectedLink.id)}
                className="flex-1 py-1.5 px-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition active:scale-95 cursor-pointer"
              >
                Toggle Port
              </button>
              <button
                onClick={() => { deleteLink(selectedLink.id); setActiveLinkPopover(null); }}
                className="py-1.5 px-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-405 rounded-lg font-semibold transition active:scale-95 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </ReactFlow>

      {/* ── Device popover — lives OUTSIDE <ReactFlow>, never deselected ── */}
      {activeDevice && popoverScreenPos && (
        <div
          className="absolute z-[9999] pointer-events-auto"
          style={{ left: popoverScreenPos.x, top: popoverScreenPos.y }}
          // Stop ALL bubbling so the pane click handler never fires
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <NodePopover
            device={activeDevice}
            onClose={() => setActiveDeviceId(null)}
          />
        </div>
      )}
    </div>
  );
};
