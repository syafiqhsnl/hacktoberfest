export type OutcomeType = 'Investment' | 'Partnership' | 'Expansion' | 'POC';

export type HealthStatus = 'on_track' | 'at_risk' | 'stalled';

export type ASEANCountry = 'SG' | 'ID' | 'VN' | 'MY' | 'TH' | 'PH';

export const COUNTRY_NAMES: Record<ASEANCountry, string> = {
  SG: 'Singapore',
  ID: 'Indonesia',
  VN: 'Vietnam',
  MY: 'Malaysia',
  TH: 'Thailand',
  PH: 'Philippines',
};

export const COUNTRY_FLAGS: Record<ASEANCountry, string> = {
  SG: '🇸🇬',
  ID: '🇮🇩',
  VN: '🇻🇳',
  MY: '🇲🇾',
  TH: '🇹🇭',
  PH: '🇵🇭',
};

export const STAGES_BY_TYPE: Record<OutcomeType, string[]> = {
  Investment: ['Intro', 'Meeting', 'Data room', 'Term sheet', 'Closed'],
  Partnership: ['Intro', 'Discovery', 'Follow-up', 'Pilot', 'Contract'],
  Expansion: ['Interest', 'Local partner', 'Launch'],
  POC: ['Brief', 'Scoped', 'Running', 'Evaluated'],
};

export interface Task {
  id: string;
  opportunityId: string;
  opportunityTitle?: string;
  counterparty?: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string; // ISO string or YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  stageTarget?: string;
}

export interface ActivityNote {
  id: string;
  date: string;
  author: string;
  content: string;
  type: 'meeting' | 'email' | 'whatsapp' | 'call' | 'status_change' | 'milestone';
}

export interface AttachedEvidence {
  id: string;
  name: string;
  type: 'mou' | 'email_thread' | 'wire_receipt' | 'deck' | 'proposal';
  url?: string;
  uploadedAt: string;
  verificationClaim?: string;
}

export interface TechnicalGap {
  id: string;
  category: 'technical' | 'regulatory' | 'commercial';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  remediationStep: string;
}

export interface CompatibilityAnalysis {
  overallScore: number; // 0 to 100
  alignmentScore: number;
  technicalFeasibilityScore: number;
  regulatoryReadinessScore: number;
  strengths: string[];
  technicalGaps: TechnicalGap[];
  verdictSummary: string;
  recommendedAction: string;
  analyzedAt: string;
}

export interface SuccessMetric {
  metric: string;
  target: string;
  measurementMethod: string;
  baseline?: string;
}

export interface TimelineMilestone {
  phase: string;
  duration: string;
  milestone: string;
  keyDeliverable: string;
}

export interface GeneratedProposalMOU {
  id: string;
  title: string;
  agreementType: 'Commercial Pilot Agreement' | 'Bilateral Partnership MOU' | 'Investment Term Sheet Draft' | 'POC Evaluation Charter';
  effectiveDate: string;
  durationWeeks: number;
  parties: {
    startupName: string;
    startupCountry: string;
    partnerName: string;
    partnerCountry: string;
  };
  executiveSummary: string;
  objectives: string[];
  deliverables: string[];
  assignedResponsibilities: {
    startup: string[];
    partner: string[];
  };
  successMetrics: SuccessMetric[];
  timelineMilestones: TimelineMilestone[];
  governanceAndIp: string;
  estimatedValueUSD: number;
  generatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  counterparty: string;
  contactPerson: string;
  contactEmail?: string;
  contactRole?: string;
  sourceCountry: ASEANCountry;
  targetCountry: ASEANCountry;
  type: OutcomeType;
  stage: string;
  health: HealthStatus;
  daysInactive: number;
  lastUpdated: string;
  estimatedValueUSD: number;
  summary: string;
  nextTaskSummary: string;
  notes: ActivityNote[];
  evidence: AttachedEvidence[];
  stalledReason?: string;
  founderName: string;
  startupName: string;
  compatibilityAnalysis?: CompatibilityAnalysis;
  generatedProposal?: GeneratedProposalMOU;
}

export interface OutcomeReport {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  startupName: string;
  counterparty: string;
  type: OutcomeType;
  sourceCountry: ASEANCountry;
  targetCountry: ASEANCountry;
  reportedStage: string;
  claimTitle: string;
  valueUSD: number;
  reportedDate: string;
  evidenceSummary: string;
  evidenceAttachmentName?: string;
  status: 'pending' | 'verified' | 'rejected' | 'info_requested';
  reviewerNote?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface EcosystemInsights {
  corridorTrends: {
    corridor: string;
    dealCount: number;
    velocityScore: string;
    topType: string;
    insight: string;
  }[];
  bottlenecks: {
    stage: string;
    type: OutcomeType;
    affectedCount: number;
    rootCause: string;
    organizerAction: string;
  }[];
  interventions: {
    title: string;
    targetMarket: ASEANCountry;
    rationale: string;
    urgency: 'high' | 'medium';
  }[];
  executiveSummary: string;
  generatedAt: string;
}
