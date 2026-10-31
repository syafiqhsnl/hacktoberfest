import React, { useState, useEffect } from 'react';
import { 
  Opportunity, 
  OutcomeReport, 
  EcosystemInsights, 
  COUNTRY_FLAGS, 
  COUNTRY_NAMES,
  OutcomeType 
} from '../types.ts';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Send, 
  ShieldCheck, 
  Globe2, 
  DollarSign, 
  Briefcase, 
  RefreshCw,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface OrganizerImpactDashboardProps {
  opportunities: Opportunity[];
  outcomeReports: OutcomeReport[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onNavigateToVerification: () => void;
  onSendOrganizerNudge: (opp: Opportunity) => void;
}

export const OrganizerImpactDashboard: React.FC<OrganizerImpactDashboardProps> = ({
  opportunities,
  outcomeReports,
  onSelectOpportunity,
  onNavigateToVerification,
  onSendOrganizerNudge,
}) => {
  const [insights, setInsights] = useState<EcosystemInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [nudgedOppIds, setNudgedOppIds] = useState<Record<string, boolean>>({});

  // Verified outcomes only count on this official dashboard!
  const verifiedOutcomes = outcomeReports.filter(r => r.status === 'verified');
  const pendingOutcomes = outcomeReports.filter(r => r.status === 'pending');

  // Total verified value
  const totalVerifiedValueUSD = verifiedOutcomes.reduce((acc, r) => acc + r.valueUSD, 0);

  // Conversion Funnel metrics
  const totalConnections = opportunities.length; // Intros made
  const activeDiscovery = opportunities.filter(o => 
    !o.stage.toLowerCase().includes('intro') && !o.stage.toLowerCase().includes('brief') && !o.stage.toLowerCase().includes('interest')
  ).length;
  const pilotsAndDataRooms = opportunities.filter(o =>
    o.stage.toLowerCase().includes('pilot') || 
    o.stage.toLowerCase().includes('data room') || 
    o.stage.toLowerCase().includes('term sheet') ||
    o.stage.toLowerCase().includes('running')
  ).length;
  const verifiedOutcomesCount = verifiedOutcomes.length;

  const funnelSteps = [
    { name: '1. Intros Made', count: totalConnections, pct: 100, desc: 'Facilitated ecosystem intros' },
    { name: '2. Active Discovery', count: activeDiscovery, pct: Math.round((activeDiscovery / totalConnections) * 100) || 0, desc: 'Passed beyond initial intro' },
    { name: '3. Pilots & Data Rooms', count: pilotsAndDataRooms, pct: Math.round((pilotsAndDataRooms / totalConnections) * 100) || 0, desc: 'Testing & diligence stage' },
    { name: '4. Verified Outcomes', count: verifiedOutcomesCount, pct: Math.round((verifiedOutcomesCount / totalConnections) * 100) || 0, desc: 'Officially verified results' },
  ];

  // Outcomes by Type breakdown
  const types: OutcomeType[] = ['Investment', 'Partnership', 'Expansion', 'POC'];
  const breakdownByType = types.map(type => {
    const verifiedOfType = verifiedOutcomes.filter(r => r.type === type);
    const value = verifiedOfType.reduce((acc, r) => acc + r.valueUSD, 0);
    const totalPipelineCount = opportunities.filter(o => o.type === type).length;
    return {
      type,
      verifiedCount: verifiedOfType.length,
      totalPipelineCount,
      valueUSD: value,
    };
  });

  // Cross-border bilateral corridors
  const corridorMap: Record<string, { count: number; value: number; from: string; to: string }> = {};
  opportunities.forEach(opp => {
    const key = `${opp.sourceCountry} → ${opp.targetCountry}`;
    if (!corridorMap[key]) {
      corridorMap[key] = { count: 0, value: 0, from: opp.sourceCountry, to: opp.targetCountry };
    }
    corridorMap[key].count += 1;
    corridorMap[key].value += opp.estimatedValueUSD;
  });

  const sortedCorridors = Object.entries(corridorMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  // Stalled opportunities list (>10 days inactive or flagged)
  const stalledOpportunities = opportunities.filter(o => o.health === 'stalled');

  // Fetch AI Insights on mount
  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const res = await fetch('/api/ai/organizer-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setInsights(data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleNudge = (opp: Opportunity) => {
    onSendOrganizerNudge(opp);
    setNudgedOppIds(prev => ({ ...prev, [opp.id]: true }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner: Verification Rule Notice & Quick Nav */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold">
              Startup ASEAN Ecosystem Intelligence & Verification Layer
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Measuring verified post-intro outcomes rather than raw connection volume.
            Only outcomes with two-sided counterparty verification count toward ecosystem economic impact.
          </p>
        </div>

        {pendingOutcomes.length > 0 && (
          <button
            onClick={onNavigateToVerification}
            className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 shadow-xs"
          >
            <span>Review {pendingOutcomes.length} Pending Outcomes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Verified Economic Value
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              ${totalVerifiedValueUSD.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-semibold font-mono">USD</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Backed by bilateral contracts & wire evidence
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Ecosystem Conversion Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-600">
              {Math.round((verifiedOutcomesCount / totalConnections) * 100)}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({verifiedOutcomesCount} / {totalConnections} verified)
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Intros converted to verified results
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active In-Pipeline Deals
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {totalConnections - verifiedOutcomesCount}
            </span>
            <span className="text-xs text-slate-500">opportunities</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Across 6 ASEAN member states
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Stalled Deal Alerts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600">
              {stalledOpportunities.length}
            </span>
            <span className="text-xs text-slate-500">flagged deals</span>
          </div>
          <p className="text-[11px] text-rose-700">
            &gt;10 days inactive or blocker unaddressed
          </p>
        </div>

      </div>

      {/* Row: Conversion Funnel & Outcomes by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Conversion Funnel (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Connection-to-Outcome Conversion Funnel
              </h3>
              <p className="text-xs text-slate-500">
                Tracking stage progression from initial ASEAN summit intro to verified closure
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              {totalConnections} total connections
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {funnelSteps.map((step, idx) => (
              <div key={step.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{step.name}</span>
                    <span className="text-slate-400 text-[11px]">({step.desc})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{step.count}</span>
                    <span className="text-slate-400">({step.pct}%)</span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 3
                        ? 'bg-emerald-500'
                        : idx === 2
                        ? 'bg-indigo-600'
                        : idx === 1
                        ? 'bg-indigo-400'
                        : 'bg-slate-700'
                    }`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Funnel Insight: </span>
            The biggest velocity drop occurs between <strong>Active Discovery</strong> and{' '}
            <strong>Pilots / Diligence</strong> (a 28% drop), showing that founders need
            standardized regional pilot agreements to close enterprise trials faster.
          </div>
        </div>

        {/* Verified Outcomes by Type (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Verified Outcomes by Type
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated economic outcomes verified with evidence
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {breakdownByType.map(item => (
              <div
                key={item.type}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-semibold text-slate-900">{item.type}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                    <span>{item.verifiedCount} verified</span>
                    <span>·</span>
                    <span>{item.totalPipelineCount} active</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-slate-900 text-sm">
                    ${item.valueUSD.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400">verified USD</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row: Cross-Border Bilateral Corridors & Stalled Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cross-border corridors (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cross-Border Bilateral Corridors
              </h3>
              <p className="text-xs text-slate-500">
                Deal flow velocity between ASEAN member ecosystems
              </p>
            </div>
            <Globe2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2.5">
            {sortedCorridors.map(([corridor, data]) => {
              const fromFlag = (COUNTRY_FLAGS as Record<string, string>)[data.from] || '🌏';
              const toFlag = (COUNTRY_FLAGS as Record<string, string>)[data.to] || '🌏';

              return (
                <div
                  key={corridor}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{fromFlag}</span>
                    <span className="font-semibold text-slate-800">{data.from}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-base">{toFlag}</span>
                    <span className="font-semibold text-slate-800">{data.to}</span>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-slate-600">
                      <strong>{data.count}</strong> deals
                    </span>
                    <span className="font-bold text-slate-900">
                      ${data.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stalled Opportunities Radar + AI Organizer Nudge (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Stalled Opportunities Radar</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono">
                  {stalledOpportunities.length} flagged
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Flagged when inactive &gt;10 days; organizer intervention unblocks outcomes
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {stalledOpportunities.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No stalled deals currently flagged in the pipeline.
              </div>
            ) : (
              stalledOpportunities.map(opp => {
                const isNudged = nudgedOppIds[opp.id];

                return (
                  <div
                    key={opp.id}
                    className="p-3.5 bg-rose-50/40 border border-rose-200 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4
                          onClick={() => onSelectOpportunity(opp)}
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                        >
                          {opp.title}
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          {opp.counterparty} ({opp.sourceCountry} → {opp.targetCountry}) ·{' '}
                          <span className="text-rose-700 font-medium">
                            {opp.daysInactive} days inactive
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleNudge(opp)}
                        disabled={isNudged}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 ${
                          isNudged
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                        }`}
                      >
                        {isNudged ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Nudge Sent</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Send AI Nudge</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-2 bg-white/80 border border-rose-100 rounded text-[11px] text-slate-700 leading-relaxed">
                      <span className="font-semibold text-rose-900">Why Stalled: </span>
                      {opp.stalledReason || 'No update recorded from founder or counterparty in over 10 days.'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Strategic AI Pipeline Insights Box (Gemma 4 High-Reasoning Synthesis) */}
      <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Gemma 4 Strategic Ecosystem Intelligence
              </h3>
              <p className="text-xs text-slate-500">
                Autonomous pipeline synthesis detecting systemic bottlenecks and organizer actions
              </p>
            </div>
          </div>

          <button
            onClick={fetchInsights}
            disabled={isLoadingInsights}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInsights ? 'animate-spin' : ''}`} />
            <span>Re-analyze Pipeline</span>
          </button>
        </div>

        {insights && (
          <div className="space-y-4 pt-2 text-xs">
            
            {/* Executive summary */}
            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                Executive Brief for Ecosystem Leaders
              </span>
              <p className="text-slate-800 leading-relaxed text-[13px]">
                {insights.executiveSummary}
              </p>
            </div>

            {/* Recommended High-Impact Interventions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Targeted Organizer Interventions to Unblock Deals
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {insights.interventions.map((inv, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{inv.title}</span>
                      <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                        {inv.targetMarket}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {inv.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
