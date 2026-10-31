import React from 'react';
import { Opportunity, COUNTRY_FLAGS } from '../types.ts';
import { AlertCircle, Clock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect: (opp: Opportunity) => void;
  onMoveStage?: (opp: Opportunity, newStage: string) => void;
  availableStages: string[];
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onMoveStage,
  availableStages,
}) => {
  const currentStageIndex = availableStages.indexOf(opportunity.stage);

  return (
    <div
      onClick={() => onSelect(opportunity)}
      className="group relative bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left"
    >
      {/* Top row: Counterparty, Country corridor & Health badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>{COUNTRY_FLAGS[opportunity.sourceCountry]}</span>
            <span>{opportunity.sourceCountry}</span>
            <span className="text-slate-300">→</span>
            <span>{COUNTRY_FLAGS[opportunity.targetCountry]}</span>
            <span>{opportunity.targetCountry}</span>
          </div>

          {/* Health indicator badge */}
          {opportunity.health === 'stalled' && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
              <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
              <span>Stalled ({opportunity.daysInactive}d)</span>
            </div>
          )}
          {opportunity.health === 'at_risk' && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
              <span>At risk ({opportunity.daysInactive}d)</span>
            </div>
          )}
          {opportunity.health === 'on_track' && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>On track</span>
            </div>
          )}
        </div>

        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {opportunity.title}
        </h4>
        <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">
          {opportunity.counterparty}
        </p>
      </div>

      {/* Middle row: Deal Type, Value, and Summary */}
      <div className="text-xs text-slate-500">
        <div className="flex items-center justify-between text-xs font-mono tabular-nums mb-1">
          <span className="text-slate-600 font-medium">{opportunity.type}</span>
          <span className="font-semibold text-slate-800">
            ${opportunity.estimatedValueUSD.toLocaleString()}
          </span>
        </div>
        <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
          {opportunity.summary}
        </p>
      </div>

      {/* Bottom: Next Task & Stage Mover */}
      <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
          <span className="text-slate-400 font-medium shrink-0">Next:</span>
          <span className="line-clamp-1 font-medium text-slate-700">
            {opportunity.nextTaskSummary || 'No upcoming task scheduled'}
          </span>
        </div>

        {/* Stage quick step if available */}
        {onMoveStage && availableStages.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between gap-1 text-[11px] text-slate-500 pt-1"
          >
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              Stage: {opportunity.stage}
            </span>
            <div className="flex items-center gap-1">
              {currentStageIndex < availableStages.length - 1 && (
                <button
                  onClick={() => onMoveStage(opportunity, availableStages[currentStageIndex + 1])}
                  className="px-2 py-0.5 text-[10px] font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors flex items-center gap-0.5"
                >
                  <span>Advance</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
