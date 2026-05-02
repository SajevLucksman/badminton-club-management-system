# Badminton Club Management System

A web-based badminton court booking and cost management system for clubs. Tracks court bookings, player payments, shuttle usage, and expenses with automatic per-person cost splitting and month-to-month credit carry-forward.

🔗 **Live Demo:** [https://badminton-cost-manager.web.app/](https://badminton-cost-manager.web.app/)

## About the Project

Built to manage shared badminton court costs for a group of players. The system splits monthly expenses across main and standby players, tracks who has paid, carries credits/debits forward to the next month, and provides a complete financial overview.

### Key Features

- **Court Booking Calendar** — Monthly calendar view (Monday-first) to mark booked days with visual booked/available indicators
- **Automatic Cost Splitting** — Calculates per-person charges based on court rate, shuttle costs, and number of active players
- **Payment Tracking** — Record payments per member with date, view outstanding balances and overpayment credits
- **Credit Carry-Forward** — Overpayments automatically carry as credit to the next month; unpaid balances carry as debit
- **Standby Player Support** — Global standby players and per-month standby toggle for main players; standby contributions are deducted before splitting
- **Shuttle Tracker** — Track shuttle tin purchases, daily usage with a mini calendar, remaining count with progress bar
- **Expense Tracking** — Record court booking and shuttle purchase expenses separately with shop names and dates
- **Collections vs Expenses** — Balance card showing surplus/deficit between collected payments and actual expenses
- **Player Payment History** — Click any player to view their complete payment history across all months with pagination
- **Light/Dark Theme** — Toggle between light and dark modes, persisted in localStorage
- **Real-Time Sync** — All data syncs in real-time via Cloud Firestore; changes by admin are instantly visible to members
- **Member & Admin Views** — Read-only member view at `/`, admin panel with full editing at `/admin`
- **Admin Authentication** — Login required for admin access, credentials stored in Firestore

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.x | UI framework |
| React DOM | 19.2.x | DOM rendering |
| React Router DOM | 7.6.x | Client-side routing (`/` and `/admin`) |
| Vite | 8.0.x | Build tool & dev server |
| Firebase | 10.12.2 | Backend platform |
| Cloud Firestore | via Firebase | Real-time NoSQL database |
| Firebase Hosting | via Firebase | Production deployment |
| ESLint | 10.2.x | Code linting |
| Node.js | 22.x+ | Runtime |

## Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── Login.jsx                  # Admin login page
│   │   ├── AdminDashboard.jsx         # Admin layout (composes below)
│   │   ├── AdminChargesTable.jsx      # Editable charges, payments, history
│   │   ├── AdminExpenses.jsx          # Add/remove expenses
│   │   └── AdminShuttleTracker.jsx    # Editable shuttle tracking
│   ├── member/
│   │   ├── MemberView.jsx             # Read-only member dashboard
│   │   ├── ChargesTable.jsx           # Charges summary & payment table
│   │   ├── Expenses.jsx               # Expenses table & balance card
│   │   └── ShuttleTracker.jsx         # Shuttle usage tracking
│   └── shared/
│       ├── Calendar.jsx               # Reusable monthly calendar grid
│       ├── MonthNav.jsx               # Month/year navigation controls
│       ├── PlayerHistory.jsx          # Payment history modal
│       └── PlayersModal.jsx           # Add/remove players modal
├── services/
│   ├── authService.js                 # Admin login verification
│   └── badmintonService.js            # Firestore data subscribe & save
├── hooks/
│   ├── useBadmintonData.js            # App state + real-time sync
│   └── useTheme.js                    # Light/dark theme toggle
├── data/
│   └── firebase.js                    # Firebase initialization (env vars)
├── utils/
│   └── helpers.js                     # Business logic & calculations
├── styles/
│   └── index.css                      # Global styles with light/dark theme
├── App.jsx                            # Router: / (member) + /admin
└── main.jsx
```

## Prerequisites

- [Node.js](https://nodejs.org/) v22 or later
- A Firebase project with Firestore enabled

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd badminton-club-management-system

# Install dependencies
npm install

# Copy env template and add your Firebase config
cp .env.example .env.local
# Edit .env.local with your Firebase project credentials
```

### Environment Variables

Create a `.env.local` file with your Firebase config:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Development

```bash
npm run dev
# Opens at http://localhost:5173
# Member view: http://localhost:5173/
# Admin view:  http://localhost:5173/admin
```

## Build & Deploy

```bash
# Production build
npm run build

# Preview locally
npm run preview
```

### Deploy to Firebase Hosting

Ensure `firebase.json` exists in the project root:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

The `rewrites` rule ensures React Router client-side routing works (e.g., `/admin` won't 404).

```bash
# Login to Firebase (first time only)
firebase login

# Deploy
npm run build && firebase deploy --only hosting
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## License

MIT
