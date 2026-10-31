import React, { useState, useEffect } from 'react';
import {
  Opportunity,
  Task,
  OutcomeReport
} from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { OpportunityBoard } from './components/OpportunityBoard.tsx';
import { OpportunityDetailModal } from './components/OpportunityDetailModal.tsx';
import { MyTasksView } from './components/MyTasksView.tsx';
import { OrganizerImpactDashboard } from './components/OrganizerImpactDashboard.tsx';
import { OutcomeVerificationQueue } from './components/OutcomeVerificationQueue.tsx';
import { NewOpportunityModal } from './components/NewOpportunityModal.tsx';
import { ReportOutcomeModal } from './components/ReportOutcomeModal.tsx';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  ChevronRight,
  Layers,
  Award
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<'founder' | 'organizer'>('founder');
  const [activeTab, setActiveTab] = useState<string>('board');

  // Data states
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [outcomeReports, setOutcomeReports] = useState<OutcomeReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Selection
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isNewOppModalOpen, setIsNewOppModalOpen] = useState(false);
  const [reportingOutcomeForOpp, setReportingOutcomeForOpp] = useState<Opportunity | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data
  const loadData = async () => {
    try {
      const [oppsRes, tasksRes, outcomesRes] = await Promise.all([
        fetch('/api/opportunities'),
        fetch('/api/tasks'),
        fetch('/api/outcomes'),
      ]);
      const oppsData = await oppsRes.json();
      const tasksData = await tasksRes.json();
      const outcomesData = await outcomesRes.json();

      setOpportunities(oppsData.opportunities || []);
      setTasks(tasksData.tasks || []);
      setOutcomeReports(outcomesData.outcomes || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Opportunity
  const handleUpdateOpportunity = async (oppId: string, updates: Partial<Opportunity>) => {
    try {
      const res = await fetch(`/api/opportunities/${oppId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.opportunity) {
        setOpportunities(prev =>
          prev.map(o => (o.id === oppId ? data.opportunity : o))
        );
        if (selectedOpportunity && selectedOpportunity.id === oppId) {
          setSelectedOpportunity(data.opportunity);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Advance stage from card or modal
  const handleUpdateStage = (opp: Opportunity, newStage: string) => {
    handleUpdateOpportunity(opp.id, { stage: newStage });
    showToast(`Advanced "${opp.title}" to ${newStage}`);
  };

  // Add Task
  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (data.task) {
        setTasks(prev => [data.task, ...prev]);
        showToast(`Task added: "${data.task.title}"`);
        // Refresh opportunities to get updated next task summary
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? data.task : t))
        );
        if (!currentCompleted) {
          showToast(`Completed task! Associated deal momentum updated.`);
        }
        // Refresh opportunities as health may improve on completion
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Opportunity
  const handleCreateOpportunity = async (oppData: Partial<Opportunity>) => {
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oppData),
      });
      const data = await res.json();
      if (data.opportunity) {
        setOpportunities(prev => [data.opportunity, ...prev]);
        setSelectedOpportunity(data.opportunity);
        showToast(`Created opportunity: "${data.opportunity.title}"`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Outcome Report (by Founder)
  const handleSubmitOutcome = async (reportData: Partial<OutcomeReport>) => {
    try {
      const res = await fetch('/api/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      const data = await res.json();
      if (data.outcome) {
        setOutcomeReports(prev => [data.outcome, ...prev]);
        showToast(`Outcome claim submitted! Pending ASEAN Secretariat verification.`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Verify Outcome (by Organizer)
  const handleVerifyOutcome = async (
    reportId: string,
    status: 'verified' | 'rejected' | 'info_requested',
    note: string
  ) => {
    try {
      const res = await fetch(`/api/outcomes/${reportId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewerNote: note,
          reviewerName: 'Siti Rahma (ASEAN Secretariat)',
        }),
      });
      const data = await res.json();
      if (data.outcome) {
        setOutcomeReports(prev =>
          prev.map(r => (r.id === reportId ? data.outcome : r))
        );
        if (status === 'verified') {
          showToast(`Outcome officially verified! Updated Impact Dashboard live.`);
        } else {
          showToast(`Outcome marked as ${status}.`);
        }
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Organizer Nudge to Stalled Opportunity
  const handleSendOrganizerNudge = (opp: Opportunity) => {
    handleUpdateOpportunity(opp.id, {
      notes: [
        {
          id: `n-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: 'Startup ASEAN Secretariat',
          content: `Organizer Intervention: Reached out to ${opp.counterparty} innovation liaison to assist in scheduling trial demonstration and clarifying regulatory sandbox queries.`,
          type: 'milestone',
        },
        ...opp.notes,
      ],
    });
    showToast(`AI Organizer Nudge dispatched to ${opp.counterparty} liaison!`);
  };

  // Reset Data to Default
  const handleResetData = async () => {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
      await loadData();
      showToast('Reset pipeline to default realistic ASEAN dataset (18 opportunities).');
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCount = outcomeReports.filter(r => r.status === 'pending').length;
  const stalledCount = opportunities.filter(o => o.health === 'stalled').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">

      {/* Top Navbar */}
      <Navbar
        role={role}
        onRoleChange={setRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewOpportunity={() => setIsNewOppModalOpen(true)}
        onResetData={handleResetData}
        pendingVerificationsCount={pendingCount}
        stalledOpportunitiesCount={stalledCount}
      />



      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">
              Loading ASEAN deal-flow intelligence...
            </p>
          </div>
        ) : (
          <>
            {/* FOUNDER ROLE VIEWS */}
            {role === 'founder' && activeTab === 'board' && (
              <OpportunityBoard
                opportunities={opportunities}
                onSelectOpportunity={setSelectedOpportunity}
                onUpdateStage={handleUpdateStage}
                onOpenNewOpportunity={() => setIsNewOppModalOpen(true)}
              />
            )}

            {role === 'founder' && activeTab === 'tasks' && (
              <MyTasksView
                tasks={tasks}
                opportunities={opportunities}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onSelectOpportunity={setSelectedOpportunity}
                onOpenReportOutcome={setReportingOutcomeForOpp}
              />
            )}

            {/* ORGANIZER ROLE VIEWS */}
            {role === 'organizer' && activeTab === 'dashboard' && (
              <OrganizerImpactDashboard
                opportunities={opportunities}
                outcomeReports={outcomeReports}
                onSelectOpportunity={setSelectedOpportunity}
                onNavigateToVerification={() => setActiveTab('verification')}
                onSendOrganizerNudge={handleSendOrganizerNudge}
              />
            )}

            {role === 'organizer' && activeTab === 'verification' && (
              <OutcomeVerificationQueue
                outcomeReports={outcomeReports}
                onVerifyOutcome={handleVerifyOutcome}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">BridgeFlow</span>
            <span>·</span>
            <span>Deal-flow & Outcome Tracking Layer for Startup ASEAN</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Role: <strong className="text-slate-800 capitalize">{role}</strong></span>
            <span>·</span>
            <span>Singapore · Indonesia · Vietnam · Malaysia · Thailand · Philippines</span>
          </div>
        </div>
      </footer>

      {/* Modal 1: Opportunity Details & AI Copilot */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          onUpdateOpportunity={(updates) =>
            handleUpdateOpportunity(selectedOpportunity.id, updates)
          }
          onAddTask={handleAddTask}
          onOpenReportOutcome={(opp) => setReportingOutcomeForOpp(opp)}
        />
      )}

      {/* Modal 2: New Opportunity with AI Smart Paste */}
      {isNewOppModalOpen && (
        <NewOpportunityModal
          onClose={() => setIsNewOppModalOpen(false)}
          onCreateOpportunity={handleCreateOpportunity}
        />
      )}

      {/* Modal 3: Report Outcome Claim */}
      {reportingOutcomeForOpp && (
        <ReportOutcomeModal
          opportunity={reportingOutcomeForOpp}
          onClose={() => setReportingOutcomeForOpp(null)}
          onSubmitOutcome={handleSubmitOutcome}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
