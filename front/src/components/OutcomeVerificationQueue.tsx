import React, { useState } from 'react';
import { 
  OutcomeReport, 
  COUNTRY_FLAGS, 
  COUNTRY_NAMES,
  OutcomeType 
} from '../types.ts';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  FileText, 
  Building2, 
  DollarSign, 
  Calendar, 
  User, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface OutcomeVerificationQueueProps {
  outcomeReports: OutcomeReport[];
  onVerifyOutcome: (reportId: string, status: 'verified' | 'rejected' | 'info_requested', note: string) => void;
}

export const OutcomeVerificationQueue: React.FC<OutcomeVerificationQueueProps> = ({
  outcomeReports,
  onVerifyOutcome,
}) => {
  const [filterStatus, setFilterStatus] = useState<'pending' | 'verified' | 'all'>('pending');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  const filteredReports = outcomeReports.filter(rep => {
    if (filterStatus === 'all') return true;
    return rep.status === filterStatus;
  });

  const pendingCount = outcomeReports.filter(r => r.status === 'pending').length;
  const verifiedCount = outcomeReports.filter(r => r.status === 'verified').length;

  const handleAction = (reportId: string, status: 'verified' | 'rejected' | 'info_requested') => {
    const note = reviewNotes[reportId] || (
      status === 'verified'
        ? 'Verified against submitted contractual and corporate evidence.'
        : status === 'info_requested'
        ? 'Please submit secondary corporate counterparty confirmation or signed MOU annex.'
        : 'Claim rejected due to insufficient or unverified milestone proof.'
    );
    onVerifyOutcome(reportId, status, note);
    setActiveReviewId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner Explaining Two-Sided Verification */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Two-Sided Outcome Verification Queue
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Every reported outcome requires verifiable evidence (executed MOUs, pilot charters, bank receipts, or counterparty verification) before counting toward official Startup ASEAN ecosystem metrics.
            </p>
          </div>

          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterStatus === 'pending'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Review ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('verified')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterStatus === 'verified'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Submissions ({outcomeReports.length})
            </button>
          </div>
        </div>
      </div>

      {/* Review Queue Items */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-800">
              Queue is all caught up!
            </h4>
            <p className="text-xs text-slate-500">
              No outcome claims currently pending verification in this view.
            </p>
          </div>
        ) : (
          filteredReports.map(report => {
            const isPending = report.status === 'pending';
            const isVerified = report.status === 'verified';
            const isInfoRequested = report.status === 'info_requested';
            const isRejected = report.status === 'rejected';

            return (
              <div
                key={report.id}
                className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition-all ${
                  isPending
                    ? 'border-indigo-200 ring-1 ring-indigo-100'
                    : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {report.type}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-600">
                        Target Stage: <strong>{report.reportedStage}</strong>
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <span>{COUNTRY_FLAGS[report.sourceCountry]}</span>
                        <span>{report.sourceCountry}</span>
                        <span className="text-slate-300">→</span>
                        <span>{COUNTRY_FLAGS[report.targetCountry]}</span>
                        <span>{report.targetCountry}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {report.claimTitle}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified & Impact Counted</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Awaiting Verification</span>
                      </span>
                    )}
                    {isInfoRequested && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Info Requested</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Claim Rejected</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Submitter & Counterparty Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Reporting Startup
                    </span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {report.startupName}
                    </p>
                    <p className="text-slate-500 text-[11px]">{report.opportunityTitle}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Counterparty Organization
                    </span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {report.counterparty}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {COUNTRY_NAMES[report.targetCountry]}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Claimed Economic Value
                    </span>
                    <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      ${report.valueUSD.toLocaleString()} USD
                    </p>
                    <p className="text-slate-400 text-[11px]">Reported: {report.reportedDate}</p>
                  </div>
                </div>

                {/* Submitted Evidence Box */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Submitted Proof & Bilateral Evidence</span>
                    </span>
                    {report.evidenceAttachmentName && (
                      <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {report.evidenceAttachmentName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {report.evidenceSummary}
                  </p>
                </div>

                {/* Reviewer Note if available */}
                {report.reviewerNote && (
                  <div className="p-3 bg-slate-100 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        Secretariat Verification Audit:
                      </span>
                      {report.verifiedBy && (
                        <span>
                          {report.verifiedBy} ({report.verifiedAt})
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 italic">{report.reviewerNote}</p>
                  </div>
                )}

                {/* Organizer Verification Action Controls */}
                {isPending && (
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    {activeReviewId === report.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={reviewNotes[report.id] || ''}
                          onChange={(e) =>
                            setReviewNotes(prev => ({ ...prev, [report.id]: e.target.value }))
                          }
                          placeholder="Optional audit notes for verification record..."
                          rows={2}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveReviewId(null)}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAction(report.id, 'info_requested')}
                            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                          >
                            Request More Info
                          </button>
                          <button
                            onClick={() => handleAction(report.id, 'rejected')}
                            className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAction(report.id, 'verified')}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm & Count on Dashboard</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Verify validity of signed document & corporate counterparty
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveReviewId(report.id)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                          >
                            Audit / Notes
                          </button>
                          <button
                            onClick={() => handleAction(report.id, 'verified')}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify & Count on Dashboard</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
