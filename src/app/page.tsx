'use client';

import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { StatsBar } from '../components/StatsBar';
import { NetworkCanvas } from '../components/NetworkCanvas';
import { HistorySidebar } from '../components/HistorySidebar';
import { RackView3D } from '../components/RackView3D/RackView3D';
import { useTopologyStore } from '../store/useTopologyStore';

export default function Home() {
  const { activeTab } = useTopologyStore();

  return (
    <main className="flex flex-col w-screen h-screen overflow-hidden bg-[#F5F5F7] dark:bg-[#121214] transition-colors duration-200">
      <ReactFlowProvider>
        <StatsBar />
        <div className="flex flex-1 w-full h-[calc(100vh-68px)] overflow-hidden">
          <HistorySidebar />
          {activeTab === '3D' ? <RackView3D /> : <NetworkCanvas />}
        </div>
      </ReactFlowProvider>
    </main>
  );
}
