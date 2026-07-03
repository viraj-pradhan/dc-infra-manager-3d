import React, { useState } from 'react';
import { useTopologyStore } from '../store/useTopologyStore';
import { Device, DeviceType, DeviceTier, PowerMode } from '../types';
import { ToggleLeft, ToggleRight, Trash2, Power, AlertTriangle, X } from 'lucide-react';

interface NodePopoverProps {
  device: Device;
  onClose: () => void;
}

export const NodePopover: React.FC<NodePopoverProps> = ({ device, onClose }) => {
  const { updateDevice, deleteDevice } = useTopologyStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDevice(device.id, { name: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateDevice(device.id, { type: e.target.value as DeviceType });
  };

  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateDevice(device.id, { tier: e.target.value as DeviceTier });
  };

  const handlePowerModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateDevice(device.id, { powerMode: e.target.value as PowerMode });
  };

  const togglePower = () => {
    updateDevice(device.id, { isPowerLost: !device.isPowerLost });
  };

  const toggleShutdown = () => {
    updateDevice(device.id, { isSimulatedDown: !device.isSimulatedDown });
  };

  const handleDelete = () => {
    if (isDeleting) {
      deleteDevice(device.id);
      onClose();
    } else {
      setIsDeleting(true);
    }
  };

  return (
    <div
      className="w-72 bg-white dark:bg-[#1E1E21] rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-4 font-sans text-sm text-slate-800 dark:text-slate-200 transition-colors duration-200"
      // Stop ALL pointer events from bubbling up to the canvas
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white tracking-tight">Quick Actions</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            device.status === 'up'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
              : device.status === 'degraded'
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
              : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
          }`}>
            {device.status.toUpperCase()}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {/* Device Name */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1">
            Device Name
          </label>
          <input
            type="text"
            value={device.name}
            onChange={handleNameChange}
            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#2C2C2E] focus:bg-white dark:focus:bg-[#1E1E21] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
          />
        </div>

        {/* Type + Tier */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1">Type</label>
            <select
              value={device.type}
              onChange={handleTypeChange}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-[#2C2C2E] text-xs focus:bg-white dark:focus:bg-[#1E1E21] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
              <option value="router">Router</option>
              <option value="switch">Switch</option>
              <option value="server">Server</option>
              <option value="firewall">Firewall</option>
              <option value="load-balancer">Load Balancer</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1">Tier</label>
            <select
              value={device.tier}
              onChange={handleTierChange}
              className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-[#2C2C2E] text-xs focus:bg-white dark:focus:bg-[#1E1E21] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
              <option value="edge">Edge/FW</option>
              <option value="core">Core</option>
              <option value="distribution">Dist</option>
              <option value="access">Access</option>
              <option value="server">Server</option>
            </select>
          </div>
        </div>

        {/* Power Mode */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1">Power Mode</label>
          <select
            value={device.powerMode}
            onChange={handlePowerModeChange}
            className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-[#2C2C2E] text-xs focus:bg-white dark:focus:bg-[#1E1E21] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
          >
            <option value="single-feed">Single Feed</option>
            <option value="redundant">Redundant</option>
          </select>
        </div>

        {/* Simulation Controls */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Toggle Power Loss */}
          <button
            onClick={togglePower}
            className={`flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
              device.isPowerLost
                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50 text-amber-800 dark:text-amber-450'
                : 'bg-white dark:bg-[#1E1E21] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350'
            }`}
          >
            <div className="flex items-center gap-2">
              <Power className={`w-3.5 h-3.5 ${device.isPowerLost ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
              <span>{device.isPowerLost ? 'Restore Power Feed' : 'Simulate Power Loss'}</span>
            </div>
            {device.isPowerLost
              ? <ToggleRight className="w-5 h-5 text-amber-500" />
              : <ToggleLeft className="w-5 h-5 text-slate-400" />}
          </button>

          {/* Simulate Shutdown */}
          <button
            onClick={toggleShutdown}
            className={`flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
              device.isSimulatedDown
                ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900/50 text-red-800 dark:text-red-450'
                : 'bg-white dark:bg-[#1E1E21] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-3.5 h-3.5 ${device.isSimulatedDown ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`} />
              <span>{device.isSimulatedDown ? 'Cancel Shutdown' : 'Simulate Shutdown'}</span>
            </div>
            {device.isSimulatedDown
              ? <ToggleRight className="w-5 h-5 text-red-500" />
              : <ToggleLeft className="w-5 h-5 text-slate-400" />}
          </button>
        </div>

        {/* Delete */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          {isDeleting ? (
            <>
              <button
                onClick={handleDelete}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Delete
              </button>
              <button
                onClick={() => setIsDeleting(false)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/30 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Device
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
