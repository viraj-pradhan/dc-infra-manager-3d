import React, { useState, useRef, useEffect } from 'react';
import { useTopologyStore } from '../store/useTopologyStore';
import { Plus, X } from 'lucide-react';
import { DeviceType, DeviceTier, PowerMode } from '../types';

export const AddDeviceFab: React.FC = () => {
  const { addDevice } = useTopologyStore();
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<DeviceType>('server');
  const [tier, setTier] = useState<DeviceTier>('server');
  const [powerMode, setPowerMode] = useState<PowerMode>('single-feed');

  // Generate a realistic default name when type/tier changes
  useEffect(() => {
    if (!name || name.match(/^(RTR|SW|SRV|FW|LB)-\d+$/)) {
      const prefix = 
        type === 'router' ? 'RTR' :
        type === 'switch' ? (tier === 'core' || tier === 'distribution' ? 'DIST-SW' : 'ACC-SW') :
        type === 'firewall' ? 'FW' :
        type === 'load-balancer' ? 'LB' : 'SRV';
      const randomId = Math.floor(10 + Math.random() * 90);
      setName(`${prefix}-${randomId}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, tier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Place the new device near the center of the canvas initially,
    // or let it be auto-placed at (100, 100). The layout algorithm will place it.
    addDevice({
      id: `dev-${Date.now()}`,
      name: name.trim().toUpperCase(),
      type,
      tier,
      powerMode,
      position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
      isSimulatedDown: false,
      isPowerLost: false,
    });

    // Reset Form
    setName('');
    setIsOpen(false);
  };

  // Close form on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="absolute bottom-4 right-4 z-50 font-sans">
      {/* Floating Form Popover */}
      {isOpen && (
        <div 
          ref={formRef}
          className="absolute bottom-16 right-0 w-80 bg-white dark:bg-[#1E1E21] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 text-slate-900 dark:text-slate-100"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Add Network Device</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Device Name (Material floating label feel) */}
            <div className="relative">
              <input
                type="text"
                id="device-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                required
                className="block w-full px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-[#1E1E21] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all peer"
              />
              <label 
                htmlFor="device-name"
                className="absolute text-xs text-slate-400 dark:text-slate-500 duration-150 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-[#1E1E21] px-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600 dark:peer-focus:text-blue-450 left-2.5"
              >
                Device Name
              </label>
            </div>

            {/* Device Type Select (Material input feel) */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-555 uppercase tracking-wider mb-1">
                Device Type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as DeviceType;
                  setType(newType);
                  // Auto-map type to realistic tier
                  if (newType === 'router') setTier('core');
                  else if (newType === 'firewall') setTier('edge');
                  else if (newType === 'load-balancer') setTier('access');
                  else if (newType === 'switch') setTier('distribution');
                  else setTier('server');
                }}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-[#2C2C2E] focus:bg-white dark:focus:bg-[#1E1E21] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-250 transition-all cursor-pointer"
              >
                <option value="router">Router</option>
                <option value="switch">Switch</option>
                <option value="server">Server</option>
                <option value="firewall">Firewall / Security</option>
                <option value="load-balancer">Load Balancer</option>
              </select>
            </div>

            {/* Tier Select */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-555 uppercase tracking-wider mb-1">
                Network Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as DeviceTier)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-[#2C2C2E] focus:bg-white dark:focus:bg-[#1E1E21] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-250 transition-all cursor-pointer"
              >
                <option value="edge">Edge / Security Tier</option>
                <option value="core">Core Routing Tier</option>
                <option value="distribution">Distribution Switching Tier</option>
                <option value="access">Access Switching Tier</option>
                <option value="server">Server / Compute Tier</option>
              </select>
            </div>

            {/* Power Mode Select */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-555 uppercase tracking-wider mb-1">
                Power Configuration
              </label>
              <select
                value={powerMode}
                onChange={(e) => setPowerMode(e.target.value as PowerMode)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-[#2C2C2E] focus:bg-white dark:focus:bg-[#1E1E21] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-250 transition-all cursor-pointer"
              >
                <option value="single-feed">Single Feed (Non-Redundant)</option>
                <option value="redundant">Redundant Power Feeds</option>
              </select>
            </div>

            {/* Submit Button (Material raised design with ripple elevation) */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:bg-black text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg active:shadow-sm active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Device to Canvas
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) - Material style circular */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white bg-slate-900 dark:bg-slate-800 shadow-xl hover:shadow-2xl active:shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
          isOpen ? 'rotate-45 bg-red-600 hover:bg-red-700' : 'hover:bg-slate-800 dark:hover:bg-slate-700'
        }`}
        title="Add new network device"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
};
