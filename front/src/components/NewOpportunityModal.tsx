import React, { useState } from 'react';
import { Opportunity, OutcomeType, ASEANCountry, STAGES_BY_TYPE, COUNTRY_NAMES, COUNTRY_FLAGS } from '../types.ts';
import { 
  X, 
  Sparkles, 
  Wand2, 
  FileText, 
  ArrowRight, 
  Upload, 
  MessageSquare, 
  Mic, 
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';

interface NewOpportunityModalProps {
  onClose: () => void;
  onCreateOpportunity: (opp: Partial<Opportunity>) => void;
}

const SAMPLE_NOTES = [
  {
    label: '🎙️ Voice Memo: Jakarta Telkomsel Meet',
    type: 'voice',
    text: `Voice Memo Transcript (Jakarta Marriott): "Marcus here. Just sat with Bambang Kusuma, VP Enterprise IoT at Telkomsel. Huge interest in our battery telematics. They want a commercial pilot on 200 EV courier bikes across South Jakarta. Target budget roughly $85,000 USD. Need to confirm demo date next Tuesday and send our Indonesian pilot specification with localized data residency notes."`,
  },
  {
    label: '💬 WhatsApp Chat: Vinamilk Supply Chain',
    type: 'chat',
    text: `[10/28/26, 14:15] Tran Bao Chau (Vinamilk): Hi Marcus, thanks for the pitch deck at ASEAN AgriTech summit.
[10/28/26, 14:18] Marcus Tan (VoltEdge): Glad to connect Chau! Would love to scope the Ho Chi Minh cold-chain trial.
[10/28/26, 14:22] Tran Bao Chau: We are approving a 60-day POC across 50 refrigerated trucks between Da Nang and Saigon. Value roughly $45,000 USD. Can your hardware clear Tan Son Nhat airport customs by next month?
[10/28/26, 14:25] Marcus Tan: Yes, we have standard CE and ASEAN telecom clearance. We will send the bilateral draft scope tomorrow.`,
  },
  {
    label: '📊 Pitch Deck: Wavemaker Series A Slide',
    type: 'deck',
    text: `Slide 14 - Cross-Border Financing & Expansion:
Startup: FinVina (Hanoi, Vietnam)
Round: $750,000 USD Seed Extension Lead
Investor: Wavemaker Partners Singapore (Lead: Biren Mehta)
Target Market: Singapore & Vietnam bilateral trade invoice factoring
Current Status: Term sheet drafting stage, 1x non-participating liquidation preference requested, data room access active.`,
  },
];

export const NewOpportunityModal: React.FC<NewOpportunityModalProps> = ({
  onClose,
  onCreateOpportunity,
}) => {
  const [mode, setMode] = useState<'smart_paste' | 'manual'>('smart_paste');
  const [subTab, setSubTab] = useState<'text_transcript' | 'file_upload'>('text_transcript');
  
  // Input fields for intake
  const [rawInput, setRawInput] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Form fields for review/manual
  const [title, setTitle] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [sourceCountry, setSourceCountry] = useState<ASEANCountry>('SG');
  const [targetCountry, setTargetCountry] = useState<ASEANCountry>('ID');
  const [type, setType] = useState<OutcomeType>('Partnership');
  const [stage, setStage] = useState('Intro');
  const [estimatedValueUSD, setEstimatedValueUSD] = useState(50000);
  const [summary, setSummary] = useState('');
  const [nextTaskSummary, setNextTaskSummary] = useState('');

  // Handle File Upload (Screenshot, Slide, PDF)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setFileMimeType(file.type || 'image/png');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL header (e.g. "data:image/png;base64,")
      const base64Data = result.split(',')[1] || result;
      setFileBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const availableStages = STAGES_BY_TYPE[type] || ['Intro'];

  const handleParseSmartInput = async () => {
    if (!rawInput.trim() && !fileBase64) return;
    setIsParsing(true);
    try {
      const payload: any = {
        rawInput: rawInput.trim(),
        inputType: subTab === 'file_upload' ? 'pitch_deck_file' : 'voice_transcript_chat',
      };

      if (fileBase64 && fileMimeType) {
        payload.fileData = {
          base64: fileBase64,
          mimeType: fileMimeType,
          fileName: selectedFileName,
        };
      }

      const res = await fetch('/api/ai/parse-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const p = data.parsed;

      if (p) {
        setTitle(p.title || '');
        setCounterparty(p.counterparty || '');
        setContactPerson(p.contactPerson || '');
        setContactRole(p.contactRole || '');
        if (p.sourceCountry) setSourceCountry(p.sourceCountry as ASEANCountry);
        if (p.targetCountry) setTargetCountry(p.targetCountry as ASEANCountry);
        if (p.type) setType(p.type as OutcomeType);
        if (p.stage) setStage(p.stage);
        if (p.estimatedValueUSD) setEstimatedValueUSD(p.estimatedValueUSD);
        setSummary(p.summary || '');
        setNextTaskSummary(p.suggestedNextStep || '');
        setMode('manual'); // Switch to review/confirm view
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !counterparty) return;

    onCreateOpportunity({
      title,
      counterparty,
      contactPerson: contactPerson || 'Decision Maker',
      contactEmail,
      contactRole,
      sourceCountry,
      targetCountry,
      type,
      stage: stage || availableStages[0],
      estimatedValueUSD: Number(estimatedValueUSD) || 0,
      summary: summary || `${type} connection with ${counterparty} in ${COUNTRY_NAMES[targetCountry]}.`,
      nextTaskSummary: nextTaskSummary || 'Schedule discovery follow-up',
      founderName: 'Marcus Tan',
      startupName: 'VoltEdge Singapore',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Log New ASEAN Ecosystem Opportunity
              </h3>
              <p className="text-xs text-slate-500">
                Gemma 4 transforms informal chats, voice memos & deck screenshots into pipeline assets
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

        {/* Mode Switcher */}
        <div className="px-6 pt-4">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setMode('smart_paste')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'smart_paste'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Ingestion (Voice, WhatsApp, Deck)</span>
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'manual'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Structured Form</span>
            </button>
          </div>
        </div>

        {/* Content based on Mode */}
        {mode === 'smart_paste' ? (
          <div className="p-6 space-y-4">
            
            {/* Sub-Tabs: Text/Voice vs File Upload */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs">
              <button
                onClick={() => setSubTab('text_transcript')}
                className={`flex items-center gap-1.5 pb-1 font-medium border-b-2 transition-colors ${
                  subTab === 'text_transcript'
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Text / Voice Memo / WhatsApp</span>
              </button>
              <button
                onClick={() => setSubTab('file_upload')}
                className={`flex items-center gap-1.5 pb-1 font-medium border-b-2 transition-colors ${
                  subTab === 'file_upload'
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Pitch Deck / Screenshot</span>
              </button>
            </div>

            {subTab === 'text_transcript' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Paste meeting notes, voice transcription, or WhatsApp export</span>
                  <span className="text-[11px] font-normal text-slate-400">Trained on 140+ languages</span>
                </label>
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Example: Just finished WhatsApp call with Bambang Kusuma from Telkomsel Indonesia. They want a 60-day commercial pilot on 200 EV bikes in Jakarta. Target budget $85k USD. Need to confirm demo date next week..."
                  rows={5}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed focus:bg-white"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Upload Pitch Deck Slide, Term Sheet Screenshot, or PDF document
                </label>
                
                <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl p-6 text-center bg-indigo-50/20 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    {selectedFileName ? (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-900">{selectedFileName}</p>
                        <p className="text-[11px] text-emerald-600 font-medium">Ready for Gemma Multimodal extraction</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-800">
                          Click to browse or drop deck screenshot / PDF
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Supports PNG, JPG, or PDF slides up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Optional notes or context for the uploaded slide:
                  </label>
                  <input
                    type="text"
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="e.g. Focus on partnership slide with SCG Thailand"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Quick Sample Paste Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">
                Or try a realistic ASEAN sample:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_NOTES.map(sample => (
                  <button
                    key={sample.label}
                    onClick={() => {
                      setSubTab('text_transcript');
                      setRawInput(sample.text);
                    }}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200 text-left flex items-center gap-1"
                  >
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleParseSmartInput}
                disabled={(!rawInput.trim() && !fileBase64) || isParsing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isParsing ? 'Extracting with Gemma 4...' : 'Parse Opportunity & Fill Fields'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Smart Fleet Telematics Pilot"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Counterparty Organization *
                </label>
                <input
                  type="text"
                  required
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  placeholder="e.g. Telkomsel Enterprise / SCG"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Person & Role
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Name"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    placeholder="Job Title"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Outcome Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as OutcomeType;
                    setType(newType);
                    setStage(STAGES_BY_TYPE[newType][0]);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Partnership">Commercial Partnership</option>
                  <option value="Investment">Investment Round</option>
                  <option value="POC">Corporate POC</option>
                  <option value="Expansion">Market Expansion</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Initial Funnel Stage (calibrated for {type}) *
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {availableStages.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cross-Border Corridor (Source → Target)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={sourceCountry}
                    onChange={(e: any) => setSourceCountry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {(['SG', 'ID', 'VN', 'MY', 'TH', 'PH'] as const).map(c => (
                      <option key={c} value={c}>{COUNTRY_FLAGS[c]} {c}</option>
                    ))}
                  </select>
                  <select
                    value={targetCountry}
                    onChange={(e: any) => setTargetCountry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {(['ID', 'VN', 'SG', 'MY', 'TH', 'PH'] as const).map(c => (
                      <option key={c} value={c}>{COUNTRY_FLAGS[c]} {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimated Value ($ USD)
                </label>
                <input
                  type="number"
                  value={estimatedValueUSD}
                  onChange={(e) => setEstimatedValueUSD(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Summary / Context
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg leading-relaxed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Next Action Task
                </label>
                <input
                  type="text"
                  value={nextTaskSummary}
                  onChange={(e) => setNextTaskSummary(e.target.value)}
                  placeholder="e.g. Confirm demo date with Jakarta tech team"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('smart_paste')}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                ← Back to Ingestion
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                Create Opportunity
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
