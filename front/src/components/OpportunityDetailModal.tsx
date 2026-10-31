import React, { useState } from 'react';
import { 
  Opportunity, 
  Task, 
  COUNTRY_FLAGS, 
  COUNTRY_NAMES, 
  STAGES_BY_TYPE,
  CompatibilityAnalysis,
  GeneratedProposalMOU
} from '../types.ts';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  FileText, 
  Plus, 
  Sparkles, 
  Copy, 
  Check, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Languages, 
  Send, 
  Award,
  Globe2,
  Paperclip,
  CheckCircle2,
  Scale,
  Target,
  FileCheck2,
  Layers,
  Printer,
  ChevronRight
} from 'lucide-react';

interface OpportunityDetailModalProps {
  opportunity: Opportunity;
  onClose: () => void;
  onUpdateOpportunity: (updated: Partial<Opportunity>) => void;
  onAddTask: (task: Partial<Task>) => void;
  onOpenReportOutcome: (opp: Opportunity) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  onUpdateOpportunity,
  onAddTask,
  onOpenReportOutcome,
}) => {
  const [activeAiTab, setActiveAiTab] = useState<'action_plan' | 'match_score' | 'proposal_mou' | 'draft_followup'>('match_score');
  
  // 1. Action plan states
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [actionPlanData, setActionPlanData] = useState<any | null>(null);
  const [addedTaskIndices, setAddedTaskIndices] = useState<Record<number, boolean>>({});

  // 2. Match Score Analysis states
  const [isAnalyzingScore, setIsAnalyzingScore] = useState(false);
  const [compatibilityData, setCompatibilityData] = useState<CompatibilityAnalysis | null>(
    opportunity.compatibilityAnalysis || null
  );
  const [partnerCriteriaInput, setPartnerCriteriaInput] = useState('');

  // 3. Proposal / MOU Generator states
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [proposalData, setProposalData] = useState<GeneratedProposalMOU | null>(
    opportunity.generatedProposal || null
  );
  const [customObjectivesInput, setCustomObjectivesInput] = useState('');
  const [proposalCopied, setProposalCopied] = useState(false);
  const [convertedMilestones, setConvertedMilestones] = useState(false);

  // 4. Follow-up draft states
  const [draftLanguage, setDraftLanguage] = useState<string>(
    opportunity.targetCountry === 'ID' ? 'id' : 
    opportunity.targetCountry === 'VN' ? 'vn' : 
    opportunity.targetCountry === 'TH' ? 'th' : 
    opportunity.targetCountry === 'MY' ? 'ms' : 'en'
  );
  const [draftTone, setDraftTone] = useState<string>('professional_warm');
  const [founderCustomNote, setFounderCustomNote] = useState<string>('');
  const [isDraftingFollowup, setIsDraftingFollowup] = useState(false);
  const [followupData, setFollowupData] = useState<any | null>(null);
  const [copiedDraft, setCopiedDraft] = useState<'local' | 'english' | 'whatsapp' | null>(null);

  // New note state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<'meeting' | 'email' | 'whatsapp' | 'call'>('whatsapp');

  const stages = STAGES_BY_TYPE[opportunity.type] || ['Intro', 'Discovery', 'Pilot', 'Contract'];
  const currentStageIndex = stages.indexOf(opportunity.stage);

  // Handler: Generate Action Plan
  const handleGenerateActionPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/ai/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity }),
      });
      const data = await res.json();
      setActionPlanData(data.actionPlan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Handler: Run Match Score & Gap Analysis
  const handleRunCompatibilityAnalysis = async () => {
    setIsAnalyzingScore(true);
    try {
      const res = await fetch('/api/ai/compatibility-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity,
          partnerRequirements: partnerCriteriaInput,
        }),
      });
      const data = await res.json();
      setCompatibilityData(data.analysis);
      onUpdateOpportunity({ compatibilityAnalysis: data.analysis });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingScore(false);
    }
  };

  // Handler: Generate Proposal / MOU
  const handleGenerateProposal = async () => {
    setIsGeneratingProposal(true);
    try {
      const res = await fetch('/api/ai/generate-mou-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity,
          customObjectives: customObjectivesInput,
          durationWeeks: 12,
        }),
      });
      const data = await res.json();
      setProposalData(data.proposal);
      onUpdateOpportunity({ generatedProposal: data.proposal });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  // 1-Click Convert Milestones to Tasks
  const handleConvertMilestonesToTasks = () => {
    if (!proposalData) return;
    proposalData.timelineMilestones.forEach((m, idx) => {
      onAddTask({
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title,
        counterparty: opportunity.counterparty,
        title: `${m.phase}: ${m.milestone}`,
        description: `Deliverable: ${m.keyDeliverable} (${m.duration})`,
        priority: idx === 0 ? 'high' : 'medium',
        stageTarget: opportunity.stage,
        dueDate: new Date(Date.now() + (idx + 1) * 7 * 86400000).toISOString().split('T')[0],
        completed: false,
      });
    });
    setConvertedMilestones(true);
  };

  // Handler: Draft Follow-up
  const handleDraftFollowup = async () => {
    setIsDraftingFollowup(true);
    try {
      const res = await fetch('/api/ai/draft-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity,
          language: draftLanguage,
          tone: draftTone,
          contextNote: founderCustomNote,
        }),
      });
      const data = await res.json();
      setFollowupData(data.followup);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDraftingFollowup(false);
    }
  };

  const copyToClipboard = (text: string, type: 'local' | 'english' | 'whatsapp') => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(type);
    setTimeout(() => setCopiedDraft(null), 2000);
  };

  const copyProposalToClipboard = () => {
    if (!proposalData) return;
    const text = `# ${proposalData.title}
Agreement Type: ${proposalData.agreementType}
Effective Date: ${proposalData.effectiveDate} (Duration: ${proposalData.durationWeeks} Weeks)
Parties: ${proposalData.parties.startupName} (${proposalData.parties.startupCountry}) & ${proposalData.parties.partnerName} (${proposalData.parties.partnerCountry})

## 1. Executive Summary
${proposalData.executiveSummary}

## 2. Core Objectives
${proposalData.objectives.map(o => `- ${o}`).join('\n')}

## 3. Deliverables
${proposalData.deliverables.map(d => `- ${d}`).join('\n')}

## 4. Assigned Responsibilities Matrix
### ${proposalData.parties.startupName} Responsibilities:
${proposalData.assignedResponsibilities.startup.map(r => `- ${r}`).join('\n')}

### ${proposalData.parties.partnerName} Responsibilities:
${proposalData.assignedResponsibilities.partner.map(r => `- ${r}`).join('\n')}

## 5. Explicit Success Metrics
${proposalData.successMetrics.map(s => `- ${s.metric}: ${s.target} (Method: ${s.measurementMethod})`).join('\n')}

## 6. Phased Timeline Milestones
${proposalData.timelineMilestones.map(m => `- ${m.phase} (${m.duration}): ${m.milestone} | Key Deliverable: ${m.keyDeliverable}`).join('\n')}

## 7. Governance, Data Privacy & IP
${proposalData.governanceAndIp}
`;
    navigator.clipboard.writeText(text);
    setProposalCopied(true);
    setTimeout(() => setProposalCopied(false), 2500);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const newNote = {
      id: `n-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author: opportunity.founderName,
      content: newNoteContent.trim(),
      type: newNoteType,
    };

    onUpdateOpportunity({
      notes: [newNote, ...opportunity.notes],
      daysInactive: 0,
      health: 'on_track',
      stalledReason: undefined,
    });

    setNewNoteContent('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="text-base">{COUNTRY_FLAGS[opportunity.sourceCountry]}</span>
              <span>{COUNTRY_NAMES[opportunity.sourceCountry]}</span>
              <span className="text-slate-300">→</span>
              <span className="text-base">{COUNTRY_FLAGS[opportunity.targetCountry]}</span>
              <span>{COUNTRY_NAMES[opportunity.targetCountry]}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              {opportunity.type}
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              ${opportunity.estimatedValueUSD.toLocaleString()} USD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenReportOutcome(opportunity)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Report Outcome</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split 2-Column Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* LEFT COLUMN: Deal Context, Timeline, Notes, Evidence (5 cols) */}
          <div className="lg:col-span-5 p-6 space-y-5 overflow-y-auto bg-slate-50/40">
            
            {/* Title & Organization */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {opportunity.title}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-medium">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{opportunity.counterparty}</span>
              </div>
            </div>

            {/* Stage Progression Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Funnel Stage Progression</span>
                <span className="font-mono text-slate-600">
                  {currentStageIndex + 1} of {stages.length} ({opportunity.stage})
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {stages.map((stg, idx) => {
                  const isCurrent = idx === currentStageIndex;
                  const isPast = idx < currentStageIndex;
                  return (
                    <button
                      key={stg}
                      onClick={() => onUpdateOpportunity({ stage: stg })}
                      className={`text-center py-1.5 px-0.5 rounded text-[10px] font-medium transition-all ${
                        isCurrent
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : isPast
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {stg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Health & Stalled Diagnostics Alert */}
            {opportunity.health === 'stalled' && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-rose-800 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Flagged as Stalled ({opportunity.daysInactive} days inactive)</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {opportunity.stalledReason || 'No activity recorded recently. Unconfirmed schedule with counterparty.'}
                </p>
              </div>
            )}

            {/* Contact Person Details */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <h4 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
                Primary Contact
              </h4>
              <div className="space-y-1 text-slate-700">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">{opportunity.contactPerson}</span>
                  {opportunity.contactRole && (
                    <span className="text-slate-500">({opportunity.contactRole})</span>
                  )}
                </div>
                {opportunity.contactEmail && (
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opportunity.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Context Summary */}
            <div className="space-y-1">
              <h4 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
                Deal Context
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-200 p-3 rounded-xl">
                {opportunity.summary}
              </p>
            </div>

            {/* Attached Verification Files */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
                  Attached Evidence ({opportunity.evidence.length})
                </h4>
                <button
                  onClick={() => {
                    const mockFile = {
                      id: `ev-${Date.now()}`,
                      name: `Executed_MOU_${opportunity.counterparty.split(' ')[0]}.pdf`,
                      type: 'mou' as const,
                      uploadedAt: new Date().toISOString().split('T')[0],
                    };
                    onUpdateOpportunity({
                      evidence: [...opportunity.evidence, mockFile],
                    });
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                >
                  <Paperclip className="w-3 h-3" />
                  <span>Attach Document</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {opportunity.evidence.map(ev => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{ev.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{ev.uploadedAt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity History & Add Note */}
            <div className="space-y-2 pt-1">
              <h4 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
                Log Meeting / Interaction
              </h4>
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record call summary or minutes..."
                  rows={2}
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex items-center justify-between">
                  <select
                    value={newNoteType}
                    onChange={(e: any) => setNewNoteType(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-700"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="meeting">Meeting</option>
                    <option value="call">Virtual Call</option>
                    <option value="email">Email</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800"
                  >
                    Log Activity
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* RIGHT COLUMN: AI Copilot Suite (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-4 flex flex-col overflow-y-auto">
            
            {/* AI Tab Selector: 4 Powerful Engines */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Gemma 4 Deal Engine
                </span>
              </div>

              <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs overflow-x-auto">
                <button
                  onClick={() => setActiveAiTab('match_score')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeAiTab === 'match_score'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Match Score & Gaps</span>
                </button>

                <button
                  onClick={() => setActiveAiTab('proposal_mou')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeAiTab === 'proposal_mou'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Proposal / MOU Generator</span>
                </button>

                <button
                  onClick={() => setActiveAiTab('action_plan')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeAiTab === 'action_plan'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  <span>Action Plan</span>
                </button>

                <button
                  onClick={() => setActiveAiTab('draft_followup')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeAiTab === 'draft_followup'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bilingual Draft</span>
                </button>
              </div>
            </div>

            {/* TAB 1: MATCH SCORE & TECHNICAL GAP ANALYSIS */}
            {activeAiTab === 'match_score' && (
              <div className="space-y-4">
                
                {/* Control card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Commercial Compatibility & Capability Audit
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Evaluates startup capabilities against partner's requirements and detects technical gaps
                      </p>
                    </div>

                    <button
                      onClick={handleRunCompatibilityAnalysis}
                      disabled={isAnalyzingScore}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAnalyzingScore ? 'Auditing Capabilities...' : 'Run Match Score Analysis'}</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      value={partnerCriteriaInput}
                      onChange={(e) => setPartnerCriteriaInput(e.target.value)}
                      placeholder="Optional partner criteria (e.g. requires ISO 27001, local cloud cluster, 500 trial user capacity)..."
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Compatibility Results Display */}
                {compatibilityData && (
                  <div className="space-y-4">
                    
                    {/* Scores Dashboard */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      
                      {/* Overall Compatibility Score */}
                      <div className="sm:col-span-1 bg-white border border-slate-200 rounded-xl p-4 text-center space-y-1 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Match Score
                        </span>
                        <div className="text-3xl font-extrabold font-mono text-indigo-600">
                          {compatibilityData.overallScore}%
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">Commercial Viability</p>
                      </div>

                      {/* Sub-Score: Alignment */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Strategic Alignment</span>
                        <div className="text-xl font-bold font-mono text-slate-900">
                          {compatibilityData.alignmentScore}%
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${compatibilityData.alignmentScore}%` }} />
                        </div>
                      </div>

                      {/* Sub-Score: Technical Feasibility */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Technical Feasibility</span>
                        <div className="text-xl font-bold font-mono text-slate-900">
                          {compatibilityData.technicalFeasibilityScore}%
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${compatibilityData.technicalFeasibilityScore}%` }} />
                        </div>
                      </div>

                      {/* Sub-Score: Regulatory & Cross-Border */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Regulatory Readiness</span>
                        <div className="text-xl font-bold font-mono text-slate-900">
                          {compatibilityData.regulatoryReadinessScore}%
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${compatibilityData.regulatoryReadinessScore}%` }} />
                        </div>
                      </div>

                    </div>

                    {/* Verdict Summary */}
                    <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-indigo-900 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span>Executive Verdict & Recommendation</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed text-[12px]">
                        {compatibilityData.verdictSummary}
                      </p>
                      <p className="text-indigo-950 font-medium pt-1">
                        <strong>Immediate Action:</strong> {compatibilityData.recommendedAction}
                      </p>
                    </div>

                    {/* Technical Gaps to Resolve (Critical Feature Requirement) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Explicit Technical & Operational Gaps to Resolve ({compatibilityData.technicalGaps.length})</span>
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {compatibilityData.technicalGaps.map(gap => (
                          <div
                            key={gap.id}
                            className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{gap.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {gap.category}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                                    gap.severity === 'high'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                                  }`}
                                >
                                  {gap.severity} severity
                                </span>
                              </div>
                            </div>

                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              {gap.description}
                            </p>

                            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-700 flex items-start gap-2">
                              <span className="font-semibold text-indigo-700 shrink-0">Remediation:</span>
                              <span>{gap.remediationStep}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strengths matched to needs */}
                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1.5 text-xs">
                      <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">
                        Validated Synergy Points
                      </span>
                      <ul className="space-y-1">
                        {compatibilityData.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                )}

                {!compatibilityData && !isAnalyzingScore && (
                  <div className="py-12 text-center text-xs text-slate-400 space-y-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <Scale className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>Click "Run Match Score Analysis" to evaluate capability fit and detect technical gaps.</p>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: PROPOSAL / BILATERAL MOU GENERATOR */}
            {activeAiTab === 'proposal_mou' && (
              <div className="space-y-4">
                
                {/* Generation Controller */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Bilateral Pilot Proposal & MOU Drafting Engine
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Generates explicit deliverables, assigned responsibilities matrix, and quantifiable metrics
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateProposal}
                      disabled={isGeneratingProposal}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGeneratingProposal ? 'Drafting MOU...' : 'Generate Bilateral Proposal'}</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={customObjectivesInput}
                    onChange={(e) => setCustomObjectivesInput(e.target.value)}
                    placeholder="Custom trial goals (e.g. 15% latency reduction, 200 EV bikes in South Jakarta, 90-day evaluation)..."
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Proposal Document View */}
                {proposalData && (
                  <div className="space-y-4 border border-slate-200 rounded-xl bg-white p-5 shadow-2xs text-xs">
                    
                    {/* Document Header & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                          {proposalData.agreementType}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          {proposalData.title}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Parties: <strong>{proposalData.parties.startupName}</strong> ({proposalData.parties.startupCountry}) & <strong>{proposalData.parties.partnerName}</strong> ({proposalData.parties.partnerCountry})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={copyProposalToClipboard}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          {proposalCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{proposalCopied ? 'Copied Full MOU' : 'Copy MOU Text'}</span>
                        </button>

                        <button
                          onClick={handleConvertMilestonesToTasks}
                          disabled={convertedMilestones}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors ${
                            convertedMilestones
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {convertedMilestones ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{convertedMilestones ? 'Milestones Added to Tasks' : 'Convert Milestones to Tasks'}</span>
                        </button>
                      </div>
                    </div>

                    {/* 1. Executive Summary */}
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                        1. Executive Summary & Purpose
                      </h4>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {proposalData.executiveSummary}
                      </p>
                    </div>

                    {/* 2. Objectives & Deliverables */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
                        <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                          2. Clear Objectives
                        </h4>
                        <ul className="space-y-1 text-slate-700">
                          {proposalData.objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-indigo-600 font-bold">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
                        <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                          3. Deliverables
                        </h4>
                        <ul className="space-y-1 text-slate-700">
                          {proposalData.deliverables.map((del, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold">•</span>
                              <span>{del}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* 3. ASSIGNED RESPONSIBILITIES MATRIX (Startup vs Corporate/Partner) */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                        4. Assigned Responsibilities Matrix (Two-Sided)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Startup Responsibilities */}
                        <div className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-2">
                          <span className="text-xs font-bold text-indigo-900 block">
                            {proposalData.parties.startupName} Responsibilities
                          </span>
                          <ul className="space-y-1.5 text-slate-700 text-[11px]">
                            {proposalData.assignedResponsibilities.startup.map((r, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-indigo-600 font-semibold">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Partner Responsibilities */}
                        <div className="p-3.5 bg-slate-100/60 border border-slate-200 rounded-xl space-y-2">
                          <span className="text-xs font-bold text-slate-900 block">
                            {proposalData.parties.partnerName} Responsibilities
                          </span>
                          <ul className="space-y-1.5 text-slate-700 text-[11px]">
                            {proposalData.assignedResponsibilities.partner.map((r, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-slate-600 font-semibold">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    </div>

                    {/* 4. EXPLICIT SUCCESS METRICS (Quantifiable KPIs) */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-indigo-600" />
                        <span>5. Explicit Success Metrics & Threshold Targets</span>
                      </h4>
                      <div className="space-y-2">
                        {proposalData.successMetrics.map((sm, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-900 text-xs">{sm.metric}</span>
                              <p className="text-[11px] text-slate-500">Method: {sm.measurementMethod}</p>
                            </div>
                            <div className="text-right sm:text-right shrink-0">
                              <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono text-[11px] rounded-md">
                                {sm.target}
                              </span>
                              {sm.baseline && (
                                <p className="text-[10px] text-slate-400 mt-0.5">Baseline: {sm.baseline}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 5. Phased Timeline Milestones */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                        6. Phased Timeline & Milestones
                      </h4>
                      <div className="space-y-1.5">
                        {proposalData.timelineMilestones.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-[11px]"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900">{m.phase}</span>
                              <p className="text-slate-600">{m.milestone} — <span className="text-slate-500">{m.keyDeliverable}</span></p>
                            </div>
                            <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                              {m.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 6. Governance & IP */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800">7. Governance, Cross-Border IP & Data Sovereignty:</span>
                      <p>{proposalData.governanceAndIp}</p>
                    </div>

                  </div>
                )}

                {!proposalData && !isGeneratingProposal && (
                  <div className="py-12 text-center text-xs text-slate-400 space-y-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>Click "Generate Bilateral Proposal" to create a structured MOU with clear responsibilities and success metrics.</p>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: AI ACTION PLAN & BLOCKER DIAGNOSTICS */}
            {activeAiTab === 'action_plan' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Deal Velocity & Blocker Removal
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Diagnoses momentum hurdles and generates staged next steps
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateActionPlan}
                      disabled={isGeneratingPlan}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGeneratingPlan ? 'Analyzing...' : 'Generate Plan'}</span>
                    </button>
                  </div>

                  {actionPlanData && (
                    <div className="space-y-3 pt-2 text-xs border-t border-slate-200">
                      <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-1">
                        <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                          Pipeline Diagnostic
                        </span>
                        <p className="text-slate-700 leading-relaxed text-[12px]">
                          {actionPlanData.diagnosticAnalysis}
                        </p>
                      </div>

                      {actionPlanData.blockerResolutionStrategy && (
                        <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-100 space-y-1">
                          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                            Blocker Resolution
                          </span>
                          <p className="text-slate-700 leading-relaxed text-[12px]">
                            {actionPlanData.blockerResolutionStrategy}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                          Suggested Next Tasks (1-Click Add)
                        </span>
                        <div className="space-y-1.5">
                          {actionPlanData.suggestedTasks?.map((tsk: any, idx: number) => {
                            const isAdded = addedTaskIndices[idx];
                            return (
                              <div
                                key={idx}
                                className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-start justify-between gap-2"
                              >
                                <div>
                                  <p className="font-semibold text-slate-900 text-xs">
                                    {tsk.title}
                                  </p>
                                  {tsk.description && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      {tsk.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                                    <span className="capitalize">{tsk.priority} Priority</span>
                                    <span>·</span>
                                    <span>In {tsk.dueDateDaysFromNow} days</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    onAddTask({
                                      opportunityId: opportunity.id,
                                      opportunityTitle: opportunity.title,
                                      counterparty: opportunity.counterparty,
                                      title: tsk.title,
                                      description: tsk.description || '',
                                      priority: tsk.priority || 'medium',
                                      stageTarget: tsk.stageTarget || opportunity.stage,
                                      dueDate: new Date(Date.now() + (tsk.dueDateDaysFromNow || 2) * 86400000).toISOString().split('T')[0],
                                      completed: false,
                                    });
                                    setAddedTaskIndices(prev => ({ ...prev, [idx]: true }));
                                  }}
                                  disabled={isAdded}
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
                                    isAdded
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      <span>Add Task</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                  {!actionPlanData && !isGeneratingPlan && (
                    <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                      <Target className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>Click "Generate Plan" to diagnose momentum and produce actionable tasks.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: BILINGUAL FOLLOW-UP DRAFT */}
            {activeAiTab === 'draft_followup' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-700 flex items-center gap-1">
                        <Languages className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Counterparty Language</span>
                      </label>
                      <select
                        value={draftLanguage}
                        onChange={(e) => setDraftLanguage(e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                      >
                        <option value="id">Bahasa Indonesia 🇮🇩</option>
                        <option value="vn">Tiếng Việt (Vietnamese) 🇻🇳</option>
                        <option value="th">ภาษาไทย (Thai) 🇹🇭</option>
                        <option value="ms">Bahasa Melayu 🇲🇾</option>
                        <option value="en">ASEAN Business English 🌏</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-700">Tone</label>
                      <select
                        value={draftTone}
                        onChange={(e) => setDraftTone(e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                      >
                        <option value="professional_warm">Professional & Warm</option>
                        <option value="direct_urgent">Direct & Action-Oriented</option>
                        <option value="executive_brief">Executive C-Level Brief</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      value={founderCustomNote}
                      onChange={(e) => setFounderCustomNote(e.target.value)}
                      placeholder="Specific note (e.g. attach proposal draft, propose Tuesday call)..."
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <button
                      onClick={handleDraftFollowup}
                      disabled={isDraftingFollowup}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isDraftingFollowup ? 'Drafting with Gemma...' : 'Draft Bilingual Follow-up'}</span>
                    </button>
                  </div>

                  {followupData && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 text-xs">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Subject:</span>
                        <p className="font-medium text-slate-800 text-xs mt-0.5">
                          {followupData.subjectLine}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                            <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Target Language Version</span>
                          </span>
                          <button
                            onClick={() => copyToClipboard(followupData.localLanguageDraft, 'local')}
                            className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1"
                          >
                            {copiedDraft === 'local' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedDraft === 'local' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="p-3 bg-white border border-slate-200 rounded-lg whitespace-pre-wrap leading-relaxed text-slate-800 text-[12px]">
                          {followupData.localLanguageDraft}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            English Translation (Side-by-Side)
                          </span>
                          <button
                            onClick={() => copyToClipboard(followupData.englishTranslation, 'english')}
                            className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1"
                          >
                            {copiedDraft === 'english' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedDraft === 'english' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="p-3 bg-white border border-slate-200 rounded-lg whitespace-pre-wrap leading-relaxed text-slate-600 text-[12px]">
                          {followupData.englishTranslation}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
