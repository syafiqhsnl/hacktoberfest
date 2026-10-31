import React, { useState } from 'react';
import { Opportunity, OutcomeReport, STAGES_BY_TYPE, COUNTRY_FLAGS } from '../types.ts';
import { X, Award, ShieldCheck, FileText, Check, Upload } from 'lucide-react';

interface ReportOutcomeModalProps {
  opportunity: Opportunity;
  onClose: () => void;
  onSubmitOutcome: (report: Partial<OutcomeReport>) => void;
}

export const ReportOutcomeModal: React.FC<ReportOutcomeModalProps> = ({
  opportunity,
  onClose,
  onSubmitOutcome,
}) => {
  const availableStages = STAGES_BY_TYPE[opportunity.type] || ['Pilot', 'Contract', 'Closed'];

  const [reportedStage, setReportedStage] = useState(
    opportunity.stage !== availableStages[0] ? opportunity.stage : availableStages[availableStages.length - 1]
  );
  const [claimTitle, setClaimTitle] = useState(
    `${reportedStage} Executed with ${opportunity.counterparty}`
  );
  const [valueUSD, setValueUSD] = useState(opportunity.estimatedValueUSD || 50000);
  const [evidenceSummary, setEvidenceSummary] = useState(
    `Signed bilateral ${opportunity.type.toLowerCase()} agreement executed by ${opportunity.contactPerson} on behalf of ${opportunity.counterparty}. Scope covers initial commercial rollout.`
  );
  const [evidenceAttachmentName, setEvidenceAttachmentName] = useState(
    `${opportunity.counterparty.split(' ')[0]}_Signed_${reportedStage}_Evidence.pdf`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimTitle.trim() || !evidenceSummary.trim()) return;

    onSubmitOutcome({
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      startupName: opportunity.startupName,
      counterparty: opportunity.counterparty,
      type: opportunity.type,
      sourceCountry: opportunity.sourceCountry,
      targetCountry: opportunity.targetCountry,
      reportedStage,
      claimTitle,
      valueUSD: Number(valueUSD) || 0,
      evidenceSummary,
      evidenceAttachmentName,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Report Ecosystem Outcome Claim
              </h3>
              <p className="text-xs text-slate-500">
                Submit evidence to the Startup ASEAN Secretariat for official verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification banner rule */}
        <div className="p-3.5 bg-indigo-50 border-b border-indigo-100 flex items-start gap-2 text-xs text-indigo-900">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Two-Sided Integrity:</strong> Your claim will be placed in the Secretariat review queue. Once counterparty proof is confirmed, this outcome will officially update the ASEAN Impact Dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Associated Opportunity</label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">{opportunity.title}</p>
                <p className="text-slate-500 text-[11px]">{opportunity.counterparty}</p>
              </div>
              <span className="text-xs font-mono font-medium text-slate-600">
                {COUNTRY_FLAGS[opportunity.sourceCountry]} {opportunity.sourceCountry} →{' '}
                {COUNTRY_FLAGS[opportunity.targetCountry]} {opportunity.targetCountry}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Achieved Outcome Stage
              </label>
              <select
                value={reportedStage}
                onChange={(e) => {
                  setReportedStage(e.target.value);
                  setClaimTitle(`${e.target.value} Executed with ${opportunity.counterparty}`);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {availableStages.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Verified Value ($ USD)
              </label>
              <input
                type="number"
                required
                value={valueUSD}
                onChange={(e) => setValueUSD(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Outcome Claim Title
            </label>
            <input
              type="text"
              required
              value={claimTitle}
              onChange={(e) => setClaimTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Proof & Evidence Description *
            </label>
            <textarea
              required
              value={evidenceSummary}
              onChange={(e) => setEvidenceSummary(e.target.value)}
              rows={3}
              placeholder="Detail the executed MOU, signed pilot charter, or bank wire confirmation..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg leading-relaxed focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Attached Proof Document
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={evidenceAttachmentName}
                onChange={(e) => setEvidenceAttachmentName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
              />
              <span className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 flex items-center gap-1 shrink-0">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>PDF</span>
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Submit for Verification</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
