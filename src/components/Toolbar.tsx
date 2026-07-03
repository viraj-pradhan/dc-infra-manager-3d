import React, { useRef } from 'react';
import { useTopologyStore } from '../store/useTopologyStore';
import { RefreshCw, Download, Upload, Maximize, Cloud } from 'lucide-react';
import { useReactFlow } from 'reactflow';

export const Toolbar: React.FC = () => {
  const { devices, links, reset, importTopology } = useTopologyStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fitView } = useReactFlow();

  const handleExport = () => {
    const dataStr = JSON.stringify({ devices, links }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dcim-topology-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.devices && parsed.links) {
          importTopology(parsed.devices, parsed.links);
          // Auto-fit view after importing
          setTimeout(() => {
            fitView({ padding: 0.2, duration: 500 });
          }, 100);
        } else {
          alert('Invalid file format. Must contain devices and links.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow importing the same file again
    e.target.value = '';
  };

  const handleCloudSave = () => {
    const name = window.prompt(
      'Enter a name for this topology snapshot:',
      `Topology Snapshot ${new Date().toLocaleDateString()}`
    );
    if (!name || name.trim() === '') return;

    try {
      const saved = localStorage.getItem('saved_topologies');
      const topologies = saved ? JSON.parse(saved) : [];
      
      const newTopology = {
        _id: 'topo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        devices,
        links,
        createdAt: new Date().toISOString(),
      };

      topologies.unshift(newTopology);
      localStorage.setItem('saved_topologies', JSON.stringify(topologies));
      alert('Topology snapshot saved successfully to local storage!');
    } catch (err) {
      alert('Error saving topology to local storage.');
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white/90 dark:bg-[#1E1E21]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-1.5 rounded-xl shadow-lg font-sans">
      {/* Fit View */}
      <button
        onClick={() => fitView({ padding: 0.15, duration: 600 })}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
        title="Fit whole topology in view"
      >
        <Maximize className="w-3.5 h-3.5" />
        <span>Fit View</span>
      </button>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

      {/* Cloud Save */}
      <button
        onClick={handleCloudSave}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
        title="Save topology snapshot to cloud database"
      >
        <Cloud className="w-3.5 h-3.5" />
        <span>Save Topology</span>
      </button>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

      {/* Reset */}
      <button
        onClick={reset}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
        title="Restore all elements to healthy state"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Reset Health</span>
      </button>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

      {/* Export */}
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
        title="Download topology as JSON (offline backup)"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export</span>
      </button>

      {/* Import */}
      <button
        onClick={handleImportClick}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
        title="Upload topology from JSON file (offline restore)"
      >
        <Upload className="w-3.5 h-3.5" />
        <span>Import</span>
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        className="hidden"
      />
    </div>
  );
};
