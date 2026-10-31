import React from 'react';
import { 
  Network, 
  Layers, 
  CheckSquare, 
  BarChart3, 
  ShieldCheck, 
  Plus, 
  RotateCcw,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

interface NavbarProps {
  role: 'founder' | 'organizer';
  onRoleChange: (role: 'founder' | 'organizer') => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewOpportunity: () => void;
  onResetData: () => void;
  pendingVerificationsCount: number;
  stalledOpportunitiesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  role,
  onRoleChange,
  activeTab,
  onTabChange,
  onOpenNewOpportunity,
  onResetData,
  pendingVerificationsCount,
  stalledOpportunitiesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Wordmark & Core Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
              <Network className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                BridgeFlow
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  ASEAN
                </span>
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Outcome-Tracking & Deal-Flow Layer
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links based on active role */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {role === 'founder' ? (
              <>
                <button
                  onClick={() => onTabChange('board')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'board'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>Opportunity Board</span>
                </button>
                <button
                  onClick={() => onTabChange('tasks')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'tasks'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-slate-500" />
                  <span>My Tasks</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onTabChange('dashboard')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <span>Impact Dashboard</span>
                  {stalledOpportunitiesCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                      {stalledOpportunitiesCount} stalled
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onTabChange('verification')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'verification'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>Outcome Verification</span>
                  {pendingVerificationsCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-600 text-white font-semibold">
                      {pendingVerificationsCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Role Switcher & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* The Role Switcher: instant switch between Founder and ASEAN Organizer */}
            <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg">
              <button
                onClick={() => {
                  onRoleChange('founder');
                  if (activeTab === 'dashboard' || activeTab === 'verification') {
                    onTabChange('board');
                  }
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  role === 'founder'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Founder role (VoltEdge Singapore)"
              >
                Founder View
              </button>
              <button
                onClick={() => {
                  onRoleChange('organizer');
                  if (activeTab === 'board' || activeTab === 'tasks') {
                    onTabChange('dashboard');
                  }
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${
                  role === 'organizer'
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to ASEAN Organizer role (Secretariat)"
              >
                <span>Organizer View</span>
                {pendingVerificationsCount > 0 && (
                  <span className={`w-2 h-2 rounded-full ${role === 'organizer' ? 'bg-amber-300' : 'bg-indigo-600'}`} />
                )}
              </button>
            </div>

            {/* Quick Reset Demo button */}
            <button
              onClick={onResetData}
              title="Reset Demo Dataset (18 ASEAN Opportunities)"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* New Opportunity Button */}
            {role === 'founder' && (
              <button
                onClick={onOpenNewOpportunity}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Opportunity</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
