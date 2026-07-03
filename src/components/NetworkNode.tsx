import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Router, Network, Server, ShieldCheck, Waypoints, AlertCircle } from 'lucide-react';
import { Device } from '../types';

export const NetworkNode: React.FC<NodeProps<Device>> = ({ data: device, selected }) => {
  const getIcon = () => {
    switch (device.type) {
      case 'router':       return <Router className="w-5 h-5" />;
      case 'switch':       return <Network className="w-5 h-5" />;
      case 'server':       return <Server className="w-5 h-5" />;
      case 'firewall':     return <ShieldCheck className="w-5 h-5" />;
      case 'load-balancer':return <Waypoints className="w-5 h-5" />;
      default:             return <Server className="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    if (device.status === 'down') return {
      border: 'border-red-350 dark:border-red-900/50',
      text: 'text-red-700 dark:text-red-400',
      iconBg: 'bg-red-100/80 dark:bg-red-950/35',
    };
    if (device.status === 'degraded') return {
      border: 'border-amber-350 dark:border-amber-900/50',
      text: 'text-amber-700 dark:text-amber-400',
      iconBg: 'bg-amber-100/80 dark:bg-amber-950/35',
    };
    switch (device.type) {
      case 'router':        return { border: 'border-blue-200 dark:border-blue-900/30',   text: 'text-blue-700 dark:text-blue-400',   iconBg: 'bg-blue-100/80 dark:bg-blue-950/20' };
      case 'switch':        return { border: 'border-emerald-200 dark:border-emerald-900/30',text: 'text-emerald-700 dark:text-emerald-400',iconBg: 'bg-emerald-100/80 dark:bg-emerald-950/20' };
      case 'server':        return { border: 'border-indigo-200 dark:border-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', iconBg: 'bg-indigo-100/80 dark:bg-indigo-950/20' };
      case 'firewall':      return { border: 'border-rose-200 dark:border-rose-900/30',   text: 'text-rose-700 dark:text-rose-400',   iconBg: 'bg-rose-100/80 dark:bg-rose-950/20' };
      case 'load-balancer': return { border: 'border-purple-200 dark:border-purple-900/30', text: 'text-purple-700 dark:text-purple-400', iconBg: 'bg-purple-100/80 dark:bg-purple-950/20' };
      default:              return { border: 'border-slate-200 dark:border-slate-800',  text: 'text-slate-700 dark:text-slate-350',  iconBg: 'bg-slate-100/80 dark:bg-slate-850' };
    }
  };

  const colors = getColorClasses();

  return (
    <div
      className={`relative flex items-center w-[200px] h-[72px] px-3 py-2.5 rounded-2xl border bg-white/95 dark:bg-[#1E1E21]/95 dark:border-slate-800 backdrop-blur-sm transition-all duration-200 select-none ${colors.border} ${
        selected
          ? 'shadow-lg ring-2 ring-blue-500/30 border-blue-400 dark:border-blue-600'
          : 'shadow-[0_2px_8px_-3px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-md dark:hover:shadow-lg'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-slate-300 dark:!bg-slate-750 !border-2 !border-white dark:!border-[#1E1E21] hover:!bg-blue-500 hover:!border-blue-200 hover:!shadow-[0_0_0_3px_rgba(59,130,246,0.25)] transition-all duration-150 cursor-crosshair"
        title="Drag to connect"
      />

      <div className={`flex items-center justify-center w-10 h-10 rounded-xl mr-3 shrink-0 ${colors.iconBg} ${colors.text}`}>
        {getIcon()}
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate leading-snug">{device.name}</span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{device.tier}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate">
            {device.powerMode === 'redundant' ? 'Redundant' : 'Single'}
          </span>
        </div>
      </div>

      {device.status !== 'up' && (
        <div className="absolute top-1.5 right-1.5">
          <AlertCircle className={`w-3.5 h-3.5 ${device.status === 'down' ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-slate-300 dark:!bg-slate-750 !border-2 !border-white dark:!border-[#1E1E21] hover:!bg-blue-500 hover:!border-blue-200 hover:!shadow-[0_0_0_3px_rgba(59,130,246,0.25)] transition-all duration-150 cursor-crosshair"
        title="Drag to connect"
      />
    </div>
  );
};
