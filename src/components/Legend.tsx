import React, { useState } from 'react';
import { Router, Network, Server, ShieldCheck, Waypoints, ChevronDown, ChevronUp, MousePointer, Link2, Trash2, Info } from 'lucide-react';

export const Legend: React.FC = () => {
  const [showHelp, setShowHelp] = useState(true);

  return (
    <div className="absolute bottom-4 left-4 z-50 bg-white/95 dark:bg-[#1E1E21]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-lg font-sans w-64 overflow-hidden text-slate-800 dark:text-slate-200 transition-colors duration-200">

      {/* ── How to use (collapsible) ── */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>How to Use</span>
          </div>
          {showHelp ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {showHelp && (
          <div className="px-4 pb-3 space-y-2.5">

            {/* Add Link */}
            <div className="flex gap-3 items-start">
              <div className="mt-0.5 w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Link2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Add a Link</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  Hover over any device — a <span className="font-semibold text-blue-600 dark:text-blue-400">blue dot</span> appears at top &amp; bottom. Drag from that dot to another device to create a connection.
                </p>
              </div>
            </div>

            {/* Select & Configure */}
            <div className="flex gap-3 items-start">
              <div className="mt-0.5 w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <MousePointer className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Configure a Device</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  Click any device to open its panel. Edit name, type, tier, power mode, simulate shutdown or power loss. Click <span className="font-semibold">✕</span> or the canvas to close.
                </p>
              </div>
            </div>

            {/* Delete link */}
            <div className="flex gap-3 items-start">
              <div className="mt-0.5 w-6 h-6 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Delete a Link</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  Click any connection line to open the link panel. Toggle its port up/down or delete it. Or select it and press <span className="font-semibold">Delete / Backspace</span>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Topology Key ── */}
      <div className="px-4 py-3">
        <h3 className="font-semibold text-[10px] text-slate-400 dark:text-slate-550 uppercase tracking-wider mb-2">Topology Key</h3>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3">
          {[
            { icon: Router,    bg: 'bg-blue-50 dark:bg-blue-950/20',   border: 'border-blue-200 dark:border-blue-900/30',   text: 'text-blue-700 dark:text-blue-400',   label: 'Router' },
            { icon: Network,   bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-900/30',text: 'text-emerald-700 dark:text-emerald-400',label: 'Switch' },
            { icon: Server,    bg: 'bg-indigo-50 dark:bg-indigo-950/20',  border: 'border-indigo-200 dark:border-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', label: 'Server' },
            { icon: ShieldCheck,bg:'bg-rose-50 dark:bg-rose-950/20',    border: 'border-rose-200 dark:border-rose-900/30',   text: 'text-rose-700 dark:text-rose-400',   label: 'Firewall' },
            { icon: Waypoints, bg: 'bg-purple-50 dark:bg-purple-950/20',  border: 'border-purple-200 dark:border-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Load Balancer' },
          ].map(({ icon: Icon, bg, border, text, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-350">
              <div className={`w-5 h-5 rounded-md ${bg} border ${border} ${text} flex items-center justify-center shrink-0`}>
                <Icon className="w-3 h-3" />
              </div>
              <span className="truncate text-[10px]">{label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400">
            <div className="w-4 h-4 rounded-full border border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 shrink-0" />
            <span>Operational</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400">
            <div className="w-4 h-4 rounded-full border border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 animate-pulse shrink-0" />
            <span>Degraded (redundancy lost)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400">
            <div className="w-4 h-4 rounded-full border border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 shrink-0" />
            <span>Down / Isolated</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center w-4 shrink-0">
              <div className="w-full border-t-2 border-red-400 dark:border-red-500 border-dashed" />
            </div>
            <span>Link Down</span>
          </div>
        </div>
      </div>
    </div>
  );
};
