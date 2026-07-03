'use client';

import React from 'react';
import { useTopologyStore } from '../store/useTopologyStore';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '../context/ThemeContext';
import { Database, Link2, ShieldCheck, AlertCircle, Heart, Sun, Moon, LogOut, History } from 'lucide-react';

export const StatsBar: React.FC = () => {
  const { devices, links, setShowHistory, activeTab, setActiveTab } = useTopologyStore();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const totalDevices = devices.length;
  const totalLinks = links.length;

  const redundantCount = devices.filter(d => d.powerMode === 'redundant').length;
  const singleFeedCount = totalDevices - redundantCount;

  const downCount = devices.filter(d => d.status === 'down').length;
  const degradedCount = devices.filter(d => d.status === 'degraded').length;

  return (
    <div className="w-full bg-white dark:bg-[#1C1C1E] border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors duration-200">
      {/* Client Identity & Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-sm">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight leading-none">DCIM Topology Mapper</h1>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1 block">Banking Network Ops</span>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 border border-slate-200/40 dark:border-slate-700/40">
        <button
          onClick={() => setActiveTab('2D')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
            activeTab === '2D'
              ? 'bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-850 dark:text-slate-450 dark:hover:text-slate-200'
          }`}
        >
          2D Canvas
        </button>
        <button
          onClick={() => setActiveTab('3D')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
            activeTab === '3D'
              ? 'bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-855 dark:text-slate-455 dark:hover:text-slate-200'
          }`}
        >
          3D Rack View
        </button>
      </div>

      {/* Stats Cards */}
      <div className="flex items-center gap-8 flex-wrap">
        {/* Total Devices */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <Database className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Devices</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{totalDevices}</span>
          </div>
        </div>

        {/* Total Links */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <Link2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Links</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{totalLinks}</span>
          </div>
        </div>

        {/* Power Feeds */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Power Redundancy</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {redundantCount} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">redundant</span> / {singleFeedCount} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">single</span>
            </span>
          </div>
        </div>

        {/* System Health */}
        <div className="flex items-center gap-2.5 border-l border-slate-200/80 dark:border-slate-800 pl-8">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            downCount > 0 ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' :
            degradedCount > 0 ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' :
            'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
          }`}>
            {downCount > 0 || degradedCount > 0 ? (
              <AlertCircle className="w-4.5 h-4.5" />
            ) : (
              <Heart className="w-4.5 h-4.5 fill-current" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">System Health</span>
            <div className="flex items-center gap-2 mt-0.5">
              {downCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
                  {downCount} Down
                </span>
              )}
              {degradedCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                  {degradedCount} Degraded
                </span>
              )}
              {downCount === 0 && degradedCount === 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                  Healthy
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Actions Panel */}
      <div className="flex items-center gap-3 ml-auto shrink-0 border-l border-slate-200/80 dark:border-slate-800 pl-6">
        {/* User profile details */}
        {session?.user && (
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
              {session.user.email}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Operator</span>
          </div>
        )}

        {/* History sidebar toggle */}
        <button
          onClick={() => setShowHistory(true)}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/85 dark:hover:border-slate-700 rounded-xl transition cursor-pointer"
          title="Open saved topologies history"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/85 dark:hover:border-slate-700 rounded-xl transition cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-200/50 dark:hover:border-red-900/30 rounded-xl transition cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
