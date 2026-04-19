# ⚔️ Level Up — *The System*

> A gamified life-management dashboard inspired by the RPG mechanics of *Solo Leveling*. Turn your daily habits, deep work sessions, and savings goals into XP, Gold, and stat gains — and watch your real life level up.

---

## 🧠 Problem Statement

### Who is the user?
Students, self-improvers, and productivity enthusiasts who struggle with long-term motivation when working toward personal or financial goals.

### What problem does it solve?
Traditional habit trackers and budgeting tools are bland and transactional. They track *what* you did, but give you no emotional reward for doing it. People fall off their routines because there's no dopamine feedback loop — no sense of growth, no stakes, no story.

**Level Up** bridges this gap by turning real-life tasks into RPG mechanics:
- Completing daily tasks earns **Gold** and **XP stats** (STR, INT, VIT, PER)
- Missing tasks deals **HP damage** and can trigger a **Burnout Debuff** (all rewards halved)
- Saving money is modelled as depositing into a **Guild Vault** with progress goals
- Purchasing things enforces a **savings-match rule** — spend on yourself, save equally
- Deep work sessions in the **Dungeon** grant +INT and Gold
- All data is persisted in real-time to the cloud per user

### Why does it matter?
Real behaviour change requires consistent feedback. By wrapping disciplined habits in an RPG skin, the system creates intrinsic motivation through visible progress, risk of loss (HP), and the satisfaction of levelling up — turning self-discipline into an addictive game.

---

## ✨ Features

### 📊 Dashboard
- Live player stats: **STR, INT, VIT, PER** with animated progress bars
- Infinite levelling system with quadratic XP thresholds (Level 1 → ∞)
- HP bar with visual states: Optimal → Recovering → Critical → Burnout
- **Perfect Day** bonus: earn +15 HP if all daily missions were completed yesterday
- Editable player name

### ⚔️ Daily Quests
- Flexible recurrence types: **Once, Daily, Weekly (days), Weekly (quota), Monthly, Yearly, Continuous**
- Complete or fail tasks to earn/lose HP and Gold
- Burnout Debuff halves all rewards when HP falls below 50
- Undo last action per task
- Calendar-based date picker to review any past or future day
- **Manual Penalty** system: deduct Gold and route it directly to the Vault

### 📖 Skill Books
- Add books you're reading/studying; consume them to gain +20 INT permanently
- Mark consumed/not consumed

### 🏴 Dungeon (Deep Work)
- Log focused work sessions (in minutes)
- Earn Gold and INT proportional to session length

### 💎 Shop (Savings Engine)
- Create items as spending targets
- **Standard items**: full cost is routed to the Vault (forced savings)
- **Luxury items**: 100% match rule — spend equal in Gold AND save equal in Vault
- **Healing Potions**: spend Gold to instantly recover HP
- Purchase confirmation modal with clear cost breakdown

### 🏆 Milestones
- Long-term real-life boss raids (career goals, fitness targets, etc.)
- Clearing a milestone grants +500G and massive stat rewards
- Animated full-screen "BOSS DEFEATED" celebration overlay

### 🏦 Guild Vault (Savings Goals)
- Create savings goals with custom targets and priorities
- Voluntary deposits or automatic routing from Quest penalties and Shop purchases
- Auto-distributes to highest-priority unachieved goal
- Progress bars per goal with overall completion tracking

### 📜 History & Logs
- Chronological ledger of all Gold events: income, expenses, vault deposits, penalties, and overrides
- Undo manual expenses
- Edit manual expense amounts and descriptions

### ⚙️ Settings Modal
- Set manual Gold balance override
- Configure Gold Cap (daily quota)
- Adjust the custom Day-End Time (Circadian Override — shift the daily reset to any hour)
- Protocol Zero: full account reset

---

## 🔍 How It Works

### 💰 How Spent Gold is Routed to the Vault

Every time Gold leaves your balance, the system automatically routes it to your Guild Vault. There are three pathways:

#### 1. Shop Purchases
| Item Type | Gold Deducted | Vaulted |
|---|---|---|
| **Standard** | `baseCost` | `baseCost` → highest-priority goal |
| **Luxury (100% match)** | `baseCost × 2` | `baseCost` → highest-priority goal |
| **Healing Potion** | `baseCost` | ❌ Nothing — consumed by the merchant |

> For example: buying a ₹500 luxury item costs 1000G total — 500G is the sunk cost, and 500G is force-saved into the Vault.

#### 2. Quest Penalties
Triggering a **Manual Penalty** (or marking a task failed) deducts gold and calls `routeTaxToVault()`, which funnels the amount straight into the Vault.

#### 3. Voluntary Deposits
On the **Vault page**, you can manually deposit any amount into a specific goal using the **DEPOSIT** button.

#### How `autoDistribute()` Works
When gold is routed automatically, the system:
1. Fetches all **unachieved** goals sorted by priority (lowest number = highest priority)
2. Fills the top-priority goal first
3. If a goal **overflows** (reaches its target), the **excess cascades** to the next goal automatically

---

### ✏️ How to Change Your Player Name

**In the app:**
1. Go to the **Dashboard**
2. Click directly on your **name** (the large glowing blue title at the top)
3. It becomes an inline editable text input
4. Press **Enter** to save, or **Escape** to cancel

The name is saved instantly to Firebase under your user profile.

---

### ⚙️ How to Access the Override / Settings Panel

**In the app:**
1. Look at the **Sidebar** (left panel)
2. Click the **level badge button** shown below your name (e.g. `Level 1`)
3. This opens the **SYSTEM OVERRIDE** modal

The modal contains the following controls:

| Feature | Description |
|---|---|
| **Manual Gold Injection** | Directly set your Gold balance to any value. Logged as an override transaction in History. |
| **System Quota Injection** | Set your Gold Cap — represents your **real bank balance**. See below. |
| **Circadian Override** | Shift the daily quest reset time away from midnight. Useful for late-night operators. |
| **Protocol Zero** | **Full data wipe.** Permanently deletes all quests, stats, gold, vault goals, and history. Requires typing `ERASE SYSTEM` to confirm. |
| **Sign Out** | Logs you out of your Firebase account. |

> ⚠️ Protocol Zero is irreversible. There is no undo.

---

### 🏧 What is the Gold Cap / System Quota?

The **Gold Cap** (set via *System Quota Injection* in the Override menu) is designed to mirror your **actual real-world bank balance**.

**How to use it:**
1. Open the **SYSTEM OVERRIDE** modal (click the level badge in the Sidebar)
2. Enter your current real bank balance into the **System Quota Injection** field
3. Hit **UPDATE QUOTA**

**What happens then:**
- Your in-game Gold can never exceed this cap — just like you can't spend money you don't have
- Every time you **spend Gold** (Shop purchase, penalty, vault deposit), the cap shrinks by the same amount — keeping it in sync with your real spending
- Every time you **earn Gold** (completing quests, dungeon runs), it is added up to but never beyond the cap
- The cap is displayed alongside your balance as `[current] / [cap]G` on the Dashboard and Sidebar

> **Example:** Your bank account has ₹12,500. You set the quota to `12500`. You buy something for 800G in the Shop — your balance drops to 11,700G and your cap drops to 11,700 too, reflecting that you actually spent ₹800 in real life.

This mechanic enforces **real financial discipline**: every in-game purchase is a commitment to a real-world equivalent purchase or saving action.

---


## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Routing** | React Router DOM v7 |
| **Animation** | Framer Motion |
| **Backend / Auth** | Firebase v12 (Auth + Firestore) |
| **Styling** | Vanilla CSS + Tailwind CSS v4 |
| **Date Utilities** | date-fns |
| **Calendar Component** | react-calendar |
| **Deployment** | Vercel |

### React Concepts Demonstrated

| Concept | Where |
|---|---|
| `useState` | All pages — forms, modals, local UI state |
| `useEffect` | Firebase listeners, HP flash, Perfect Day eval, resize handler |
| `useRef` | Tracks previous HP value to detect damage flash |
| `useCallback` | All GameContext action functions (memoised Firebase ops) |
| `useMemo` | AnimatedCounter, derived stat calculations |
| Context API | `GameContext` — global state for all player data and actions |
| React Router | 8 routes with `AnimatePresence` page transitions |
| Controlled Components | All input fields across forms |
| Conditional Rendering | Burnout warning, Perfect Day banner, Bankruptcy overlay |
| Lifting State Up | Modal open/close state lifted from child into parent pages |

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18 or higher
- A **Firebase** project with Firestore and Authentication enabled

### 1. Clone the Repository
```bash
git clone https://github.com/SujalGop/level-Up.git
cd level-Up
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase
Create a `.env` file in the project root with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Firebase Setup
In your Firebase Console:
1. Enable **Email/Password Authentication** under *Authentication → Sign-in method*
2. Create a **Firestore Database** in production mode
3. Set Firestore security rules to require authentication:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Run the Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 6. Build for Production
```bash
npm run build
```

### 7. Deploy to Vercel (Optional)
```bash
npm install -g vercel
vercel --prod
```

Ensure your environment variables are added in your Vercel project settings.

---

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Sidebar.jsx
│   ├── StatBar.jsx
│   ├── Modal.jsx
│   ├── AnimatedCounter.jsx
│   ├── BossCountdown.jsx
│   ├── CelebrationOverlay.jsx
│   ├── QuickReview.jsx
│   ├── PageTransition.jsx
│   ├── SettingsModal.jsx
│   └── Login.jsx
├── pages/              # Route-level page components
│   ├── Dashboard.jsx
│   ├── Quests.jsx
│   ├── Skills.jsx
│   ├── Dungeon.jsx
│   ├── Shop.jsx
│   ├── Milestones.jsx
│   ├── Vault.jsx
│   └── History.jsx
├── context/
│   └── GameContext.jsx # Global state + all Firebase operations
├── utils/
│   ├── leveling.js     # Infinite level calculation (quadratic formula)
│   └── schedule.js     # Recurrence & date logic
├── firebase.js         # Firebase initialisation
└── App.jsx             # Root app, routing, layout
```

---

## 👤 Author

**Sujal Gopinwar** — Batch 2029, Building Web Applications with React

---

*"Arise."*
