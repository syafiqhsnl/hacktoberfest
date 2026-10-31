# BridgeFlow - Startup ASEAN Deal-Flow & Outcome Tracking

> **"BridgeFlow turns ASEAN's startup connections into verified investments, partnerships and cross-border pilots, and tells founders exactly what to do next."**

Built for the **Startup ASEAN** initiative to solve the critical ecosystem challenge: transitioning from vanity metrics (intros made, events attended) to verified economic outcomes.

---

## Key Features

1. **Role Switcher**: Instant toggle between **Founder View** (*VoltEdge Singapore*) and **ASEAN Organizer View** (*Secretariat*).
2. **Outcome-Calibrated Funnel Stages**:
   - **Investment**: `Intro` → `Meeting` → `Data room` → `Term sheet` → `Closed`
   - **Partnership**: `Intro` → `Discovery` → `Follow-up` → `Pilot` → `Contract`
   - **Expansion**: `Interest` → `Local partner` → `Launch`
   - **POC**: `Brief` → `Scoped` → `Running` → `Evaluated`
3. **AI Copilot (Gemma 4)**:
   - **Smart Paste**: Parses raw distributor emails, WhatsApp messages, or notes into structured deals.
   - **Action Plan & Blocker Diagnostics**: Identifies why deals stall and provides 1-click suggested tasks.
   - **Multilingual Follow-Up Drafter**: Generates localized messages in Bahasa Indonesia 🇮🇩, Vietnamese 🇻🇳, Thai 🇹🇭, Bahasa Melayu 🇲🇾, and English 🌏 side-by-side with etiquette tips.
4. **Two-Sided Outcome Verification**: Founders submit proof (signed MOUs, wire receipts); Organizers audit and verify. Only verified outcomes count toward official ecosystem metrics.
5. **Ecosystem Impact Dashboard**: Real-time conversion funnels, bilateral corridor analytics, stalled deal radar, and strategic organizer recommendations.

---

## Deploy to Render from GitHub

This repository includes a `render.yaml` blueprint for automatic deployment on [Render](https://render.com).

### Quick Steps:
1. Push this repository to your **GitHub** account.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint** (or **Web Service**).
4. Connect your GitHub repository.
5. Set your environment variable:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
6. Click **Apply / Deploy**.

### Manual Render Settings (if not using Blueprint):
- **Environment**: `Node`
- **Node Version**: `22.14.0`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server.ts`

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Add your GEMINI_API_KEY in .env

# 3. Start development server (Port 3000)
npm run dev

# 4. Build for production
npm run build

# 5. Run production server
npm start
```

---

## License
Apache-2.0
