import React, { useState, useMemo } from 'react';
import { Opportunity, OutcomeType, ASEANCountry, STAGES_BY_TYPE, COUNTRY_NAMES, COUNTRY_FLAGS } from '../types.ts';
import { OpportunityCard } from './OpportunityCard.tsx';
import { Filter, Search, Plus, Sparkles, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface OpportunityBoardProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onUpdateStage: (opp: Opportunity, newStage: string) => void;
  onOpenNewOpportunity: () => void;
}

const UNIFIED_STAGES = [
  'Intro',
  'Discovery / Meeting',
  'Follow-up / Scoping',
  'Pilot / Data Room',
  'Closed / Contracted',
];

export const OpportunityBoard: React.FC<OpportunityBoardProps> = ({
  opportunities,
  onSelectOpportunity,
  onUpdateStage,
  onOpenNewOpportunity,
}) => {
  const [selectedType, setSelectedType] = useState<OutcomeType | 'ALL'>('Partnership');
  const [selectedCountry, setSelectedCountry] = useState<ASEANCountry | 'ALL'>('ALL');
  const [selectedHealth, setSelectedHealth] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Determine which column stages to show
  const activeStages = useMemo(() => {
    if (selectedType !== 'ALL') {
      return STAGES_BY_TYPE[selectedType];
    }
    return UNIFIED_STAGES;
  }, [selectedType]);

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      if (selectedType !== 'ALL' && opp.type !== selectedType) {
        return false;
      }
      if (selectedCountry !== 'ALL' && opp.targetCountry !== selectedCountry && opp.sourceCountry !== selectedCountry) {
        return false;
      }
      if (selectedHealth !== 'ALL' && opp.health !== selectedHealth) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(query);
        const matchesCounterparty = opp.counterparty.toLowerCase().includes(query);
        const matchesContact = opp.contactPerson.toLowerCase().includes(query);
        return matchesTitle || matchesCounterparty || matchesContact;
      }
      return true;
    });
  }, [opportunities, selectedType, selectedCountry, selectedHealth, searchQuery]);

  // Map opportunity stage to column
  const getStageForColumn = (opp: Opportunity, columnStage: string): boolean => {
    if (selectedType !== 'ALL') {
      return opp.stage.toLowerCase() === columnStage.toLowerCase();
    }
    // Unified mapping
    const s = opp.stage.toLowerCase();
    if (columnStage.startsWith('Intro')) {
      return s === 'intro' || s === 'brief' || s === 'interest';
    }
    if (columnStage.startsWith('Discovery')) {
      return s === 'discovery' || s === 'meeting' || s === 'local partner' || s === 'scoped';
    }
    if (columnStage.startsWith('Follow-up')) {
      return s === 'follow-up' || s === 'data room' || s === 'running';
    }
    if (columnStage.startsWith('Pilot')) {
      return s === 'pilot' || s === 'term sheet';
    }
    if (columnStage.startsWith('Closed')) {
      return s === 'contract' || s === 'closed' || s === 'launch' || s === 'evaluated';
    }
    return false;
  };

  // Metrics summary for active view
  const stalledCount = filteredOpportunities.filter(o => o.health === 'stalled').length;
  const atRiskCount = filteredOpportunities.filter(o => o.health === 'at_risk').length;
  const totalValue = filteredOpportunities.reduce((acc, o) => acc + o.estimatedValueUSD, 0);

  return (
    <div className="space-y-6">

      {/* Top Banner / Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">

        {/* Row 1: Outcome Type Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

          {/* Outcome Type Segmented Control with specific funnel notification */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            <button
              onClick={() => setSelectedType('Partnership')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${selectedType === 'Partnership'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Commercial Partnerships
            </button>
            <button
              onClick={() => setSelectedType('Investment')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${selectedType === 'Investment'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Investments
            </button>
            <button
              onClick={() => setSelectedType('POC')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${selectedType === 'POC'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Corporate POCs
            </button>
            <button
              onClick={() => setSelectedType('Expansion')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${selectedType === 'Expansion'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Market Expansions
            </button>
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${selectedType === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              All Types
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search counterparty or deal..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Row 2: Secondary Filters & Funnel Stage Note */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Filter by Market:</span>
            <div className="flex items-center gap-1">
              {(['ALL', 'ID', 'VN', 'SG', 'MY', 'TH', 'PH'] as const).map(code => (
                <button
                  key={code}
                  onClick={() => setSelectedCountry(code)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${selectedCountry === code
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {code === 'ALL' ? 'All ASEAN' : code}
                </button>
              ))}
            </div>

            <span className="text-slate-300 mx-1">|</span>

            <span className="text-slate-500 font-medium">Health:</span>
            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
            >
              <option value="ALL">All Health</option>
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="stalled">Stalled</option>
            </select>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-600">
            <span>
              <strong className="text-slate-900">{filteredOpportunities.length}</strong> deals
            </span>
            <span>·</span>
            <span>
              Pipeline Value: <strong className="text-slate-900">${totalValue.toLocaleString()}</strong>
            </span>
            {stalledCount > 0 && (
              <>
                <span>·</span>
                <span className="text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {stalledCount} stalled
                </span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Funnel Stage Indicator Bar */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Funnel Stages:</span>
          <span>
            {selectedType !== 'ALL'
              ? `Calibrated for ${selectedType} (${activeStages.join(' → ')})`
              : 'Cross-functional stage view'}
          </span>
        </div>
        <span className="text-slate-400">Click card for details & AI copilot</span>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {activeStages.map((stageName, colIdx) => {
          const colOpportunities = filteredOpportunities.filter(opp =>
            getStageForColumn(opp, stageName)
          );

          return (
            <div
              key={stageName}
              className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-3 min-h-[520px] flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    0{colIdx + 1}
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {stageName}
                  </h3>
                </div>
                <span className="text-xs font-mono font-medium text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                  {colOpportunities.length}
                </span>
              </div>

              {/* Column Card List */}
              <div className="space-y-3 flex-1">
                {colOpportunities.map(opp => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onSelect={onSelectOpportunity}
                    onMoveStage={onUpdateStage}
                    availableStages={activeStages}
                  />
                ))}

                {colOpportunities.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center p-3 text-center">
                    <p className="text-xs text-slate-400">No deals in {stageName}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
