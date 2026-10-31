# BridgeFlow

**Turn startup connections into tracked opportunities and verified outcomes.**

BridgeFlow is a prototype deal-flow and outcome-tracking application for the ASEAN startup ecosystem. It helps founders manage investment, partnership, expansion, and proof-of-concept opportunities, while organizers review outcome claims and monitor ecosystem impact.

[Live demo](https://bridgeflow-vavh.onrender.com/) · [Report an issue](https://github.com/syafiqhsnl/hacktoberfest/issues)

## The problem

Introductions and events are only the beginning of a startup relationship. Founders need clear next steps, and ecosystem organizers need evidence that connections lead to investments, partnerships, or cross-border pilots.

BridgeFlow brings opportunity tracking, follow-up tasks, AI assistance, and outcome review into one workflow.

## Features

- **Opportunity board:** Track investment, partnership, expansion, and proof-of-concept opportunities through their respective stages.
- **Task management:** Create follow-up tasks, mark work complete, and see the next action associated with an opportunity.
- **AI assistance:** Parse pasted messages into opportunities, analyze compatibility, generate action plans and MOU proposals, and draft multilingual follow-ups.
- **Outcome reporting:** Submit outcome claims and supporting evidence for organizer review.
- **Verification queue:** Verify or reject claims, or request more information.
- **Impact dashboard:** Explore verified outcomes, conversion funnels, cross-border corridors, and stalled opportunities.
- **Demo roles and data:** Switch between founder and organizer views and reset the seeded dataset.

## Demo walkthrough

1. Open the app in the founder view and explore an opportunity.
2. Review its stage, notes, and next steps; add a follow-up task.
3. Try the AI tools with a sample business message.
4. Submit an outcome claim with supporting evidence.
5. Switch to the organizer view to review the claim and explore the impact dashboard.

The role switcher demonstrates both workflows; it does not sign users into separate accounts.

## Tech stack

| Layer | Technology |
| --- | --- |
| Interface | React 19, TypeScript, Tailwind CSS 4 |
| Build tooling | Vite 8 |
| Server | Express, executed with tsx |
| AI integration | Google Gen AI SDK with server-side API calls |
| UI utilities | Lucide React, Motion |
| Storage | In-memory arrays initialized from seed data |
| Deployment configuration | Render |

## Run locally

### Prerequisites

- Git
- Node.js 22.14 or later in the Node.js 22 release line, with npm
- A Google AI Studio API key with access to the model configured in `front/server.ts`

### Install

```bash
git clone https://github.com/syafiqhsnl/hacktoberfest.git
cd hacktoberfest/front
npm install
```

### Configure environment variables

Copy `.env.example` to `.env` inside `front/`.

**macOS / Linux:**

```bash
cp .env.example .env
```

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

Set your API key in `.env`:

```dotenv
GEMINI_API_KEY=your_google_ai_studio_api_key
PORT=3000
```

Keep the API key on the server and do not commit `.env`. The example also contains `APP_URL`; the current server does not read that variable.

### Start the application

Run from `front/`:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Express serves the API and mounts Vite for development when no `dist/` build exists.

## Available commands

Run these commands from `front/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the application; uses Vite middleware when no build exists |
| `npm run lint` | Run TypeScript checking with `tsc --noEmit` |
| `npm run build` | Build the frontend into `dist/` |
| `npm start` | Start the Express server; serves `dist/` when present |
| `npm run preview` | Preview the Vite frontend build only; does not start the Express API |

For a local production build:

```bash
npm run build
npm start
```

The root `package.json` also forwards `dev`, `build`, `start`, and `lint` to `front/`. Running directly from `front/` keeps environment-file and build paths explicit.

## Project structure

```text
hacktoberfest/
├── README.md
├── package.json                 # Workspace and forwarding scripts
└── front/
    ├── .env.example             # Environment template
    ├── package.json             # App dependencies and scripts
    ├── server.ts                # Express API, AI calls, and app serving
    ├── render.yaml              # Render deployment configuration
    ├── vite.config.ts
    └── src/
        ├── App.tsx              # Views, state, and API integration
        ├── components/          # Boards, dashboards, and dialogs
        ├── data/seedData.ts     # Initial demonstration dataset
        └── types.ts            # Shared data types
```

## Deploy on Render

Create a Node web service connected to this repository with these settings:

| Setting | Value |
| --- | --- |
| Root directory | `front` |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Node version | `22.14.0` or a compatible newer Node.js 22 version |
| Environment | `NODE_ENV=production`, `GEMINI_API_KEY=<your key>` |

The server reads `PORT` from the environment and listens on `0.0.0.0`.

**Configuration correction:** The existing `front/render.yaml` contains `startCommand: node run start`. Change that to `startCommand: npm start` before using the blueprint. Ensure the service runs from `front/`.

## Current limitations

- **Temporary storage:** Opportunities, tasks, and outcome reports live in server memory. Restarting the server restores the seed data; the reset action also restores it.
- **Demo access model:** The current API has no authentication or server-side role authorization. Founder and organizer views share the same server data.
- **AI behavior:** Outputs depend on the configured model and API access. Several AI endpoints return demonstration fallback responses when generation fails, so a response alone does not confirm a successful live AI call.
- **Prototype verification:** Outcome review is an application workflow, not independent certification or proof of official affiliation.
- **Validation:** There is a TypeScript checking command, but no automated test script is currently defined.

## Contributing

To propose a change:

1. Open an issue describing the bug or improvement.
2. Fork the repository and create a branch for your change.
3. Make a focused change and run `npm run lint` and `npm run build` from `front/`.
4. Manually check the affected workflow.
5. Open a pull request explaining the change and how you checked it. Include screenshots for interface changes.

## License

No `LICENSE` file is currently included in the repository. The existing `front/README.md` mentions Apache-2.0; the maintainer should confirm the intended license and add the corresponding `LICENSE` file before this section declares one.
