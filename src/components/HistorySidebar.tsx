'use client';

import React, { useEffect, useState } from 'react';
import { useTopologyStore } from '../store/useTopologyStore';
import { useReactFlow } from 'reactflow';
import { History, Trash2, Calendar, Database, RefreshCw, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface TopologyRecord {
  _id: string;
  name: string;
  devices: any[];
  links: any[];
  createdAt: string;
}

export const HistorySidebar: React.FC = () => {
  const { showHistory, setShowHistory, importTopology } = useTopologyStore();
  const { fitView } = useReactFlow();
  const [topologies, setTopologies] = useState<TopologyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = () => {
    setLoading(true);
    setError(null);
    try {
      const saved = localStorage.getItem('saved_topologies');
      const data = saved ? JSON.parse(saved) : [];
      setTopologies(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [showHistory]);

  const handleLoadTopology = (record: TopologyRecord) => {
    const confirmLoad = window.confirm(
      `Load "${record.name}"? This will replace your current workspace topology layout.`
    );
    if (!confirmLoad) return;

    importTopology(record.devices, record.links);

    // Auto-fit view after loading
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 600 });
    }, 100);
  };

  const handleDeleteTopology = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const confirmDelete = window.confirm('Are you sure you want to delete this saved topology?');
    if (!confirmDelete) return;

    try {
      const saved = localStorage.getItem('saved_topologies');
      const topologies = saved ? JSON.parse(saved) : [];
      const updated = topologies.filter((item: TopologyRecord) => item._id !== id);
      localStorage.setItem('saved_topologies', JSON.stringify(updated));
      setTopologies(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to delete topology.');
    }
  };

  return (
    <div 
      className={`h-full border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#18181B] flex flex-col font-sans text-slate-800 dark:text-zinc-300 transition-all duration-300 relative shrink-0 z-40 ${
        showHistory ? 'w-72 sm:w-80 border-r' : 'w-0 border-r-0'
      }`}
    >
      {/* Scrollable / Interactive Sidebar Contents (clipping only applied here) */}
      <div className={`w-full h-full flex flex-col overflow-hidden ${showHistory ? '' : 'hidden'}`}>
        {/* Sidebar Header */}
        <div className="px-5 py-4.5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between min-w-[280px]">
          <div className="flex items-center gap-2">
            <History className="w-4.5 h-4.5 text-slate-500 dark:text-zinc-400" />
            <h2 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 tracking-tight">Saved Topologies</h2>
          </div>
          <button
            onClick={() => setShowHistory(false)}
            className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-450 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Collapse panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-w-[280px] scrollbar-thin">
          <button
            onClick={fetchHistory}
            className="w-full py-2 px-3 border border-dashed border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/40 rounded-xl text-slate-550 dark:text-zinc-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer mb-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh List
          </button>

          {loading && topologies.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-zinc-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-[10px] font-semibold">Loading history...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs border border-red-200/50 dark:border-red-900/30 rounded-xl p-3 text-center font-medium">
              {error}
            </div>
          )}

          {!loading && !error && topologies.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-zinc-500 gap-3">
              <Database className="w-7 h-7 opacity-30" />
              <div>
                <span className="text-xs font-semibold block text-slate-800 dark:text-zinc-400">No Saved Layouts</span>
                <span className="text-[10px] block mt-1 px-4 text-slate-500 dark:text-zinc-505 leading-normal">
                  Use "Save Topology" in the top-right toolbar to save states to the cloud.
                </span>
              </div>
            </div>
          )}

          {topologies.map((item) => {
            const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item._id}
                onClick={() => handleLoadTopology(item)}
                className="group relative bg-slate-50 hover:bg-slate-100/80 dark:bg-[#202024] dark:hover:bg-[#27272C] border border-slate-200/50 dark:border-zinc-800/40 hover:border-slate-300 dark:hover:border-zinc-800 rounded-xl p-3 cursor-pointer transition flex items-start gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
              >
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                  <FolderOpen className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block truncate leading-snug">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-semibold text-slate-400 dark:text-zinc-500 block tracking-wide">
                    <Calendar className="w-2.5 h-2.5 shrink-0" />
                    <span>{dateStr}</span>
                  </div>
                  <div className="mt-1 text-[9px] text-slate-500">
                    {item.devices.length} devices • {item.links.length} links
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteTopology(e, item._id)}
                  className="absolute top-3 right-3 p-1.5 text-slate-405 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 rounded-lg hover:bg-white dark:hover:bg-zinc-800 border border-transparent transition opacity-0 group-hover:opacity-100"
                  title="Delete topology"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Toggle handle when collapsed */}
      {!showHistory && (
        <button
          onClick={() => setShowHistory(true)}
          className="absolute top-4 -right-10 z-50 w-10 h-10 rounded-r-xl bg-white dark:bg-[#18181B] border border-l-0 border-slate-200/80 dark:border-zinc-805 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center shadow-[4px_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[4px_2px_8px_rgba(0,0,0,0.25)] cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all duration-200"
          title="Show saved topologies panel"
        >
          <ChevronRight className="w-4.5 h-4.5" />
        </button>
      )}
    </div>
  );
};
