# 📚 LST — Learn · Skill · Track

> A full-stack **Student Progress Monitoring Dashboard** built with **React + Firebase**.  
> Students can set daily study goals, track progress per subject, log weekly analytics, and access curated learning resources — all synced in real-time to the cloud.

---

## 🖼️ Pages Overview

| Page | Description |
|---|---|
| `/login` | Sign in with email and password |
| `/register` | Create account with full validation |
| `/dashboard` | Stats, charts, goal planner, calendar |
| `/subjects` | Manage subjects and learning links |
| `/tasks` | Daily study tracker per subject |
| `/progress` | Detailed per-subject progress view |
| `/profile` | View and edit personal information |
| `/contact` | Send a message form |

---

## ✨ Features

### 🔐 Authentication
- Firebase Authentication (email and password)
- Persistent login using `onAuthStateChanged` — no re-login needed after page refresh
- **Protected Routes** — unauthenticated users redirect to `/login`
- **Public Routes** — authenticated users redirect to `/dashboard`
- `authLoading` state prevents route flicker on first load

### 📝 Registration — Full Validation
- **First / Last Name** — minimum 2 characters
- **Email** — must contain `@` and end with `.com`, `.in`, `.net`, `.org`, `.edu`, `.co.in`, `.ac.in`
- **Password** — 8 to 14 characters, must include all of:
  - Uppercase letter (A–Z)
  - Lowercase letter (a–z)
  - Number (0–9)
  - Special character (`!@#$%^&*` etc.)
- **Live password strength bar** — Weak / Fair / Strong / Very Strong
- **Requirements checklist** — each rule ticks green as it is met
- **Eye toggle** — show or hide password
- **Mobile number** — exactly 10 digits, blocks non-digits and blocks typing past 10
- **Gender** and **Education Type** — radio buttons, both required
- **Date of Birth** — required
- Red border on invalid fields, green border on valid fields (triggered on blur)
- Passwords are **never stored** in Firestore — Firebase Auth handles all credentials

### 📊 Dashboard
- Personalised greeting by time of day (Good Morning / Afternoon / Evening)
- Live clock and formatted date, updates every second
- **4 Stat Cards** — Total Subjects, Completed Tasks, Minutes Studied, Daily Goal
- **Donut Chart** (Recharts) — daily completion percentage with center label
- **Weekly Bar Chart** — study minutes per day for the current Mon–Sun week
- **Daily Goal Progress Bar** — overall minutes studied vs total goal
- **Calendar View** — current month grid with today highlighted
- Data reloads from Firestore every 30 seconds

### 📚 Subjects
- Default subjects **automatically seeded** to Firestore on first login based on education type
- Add **custom subject** with:
  - Subject name (required)
  - Daily goal in minutes (required, must be > 0)
  - Learning resource URL (optional, validated)
- Delete custom subjects
- Domain preview shown below each subject card
- **Learn button** on every card — opens external URL in a new tab
- Learn button is disabled (greyed out) if no URL is set

### ✅ Tasks — Daily Study Tracker
- Per-subject task cards loaded from Firestore subjects
- Input field to add minutes studied
- Progress bar with live percentage
- **Done / In Progress** status badge
- **Reset** — clears studied minutes for that subject
- **Learn button** — opens learning resource in a new tab
- All progress saved to Firestore under `dailyProgress/{YYYY-MM-DD}`
- Weekly totals automatically updated in `weeklyHistory/{YYYY-MM-DD}`

### 📈 Progress
- **Overall progress bar** — total studied vs total daily goal
- **Summary cards** — Completed count, Remaining count, Total minutes
- Per-subject progress cards with:
  - Minutes studied / goal
  - Progress bar (purple → in progress, green → done)
  - Percentage and minutes remaining
  - "Goal reached 🎉" when complete

### 👤 Profile
- Avatar circle with auto-generated initials
- Header banner showing name, email, education type badge
- Edit mode — update first name, last name, email, mobile
- Gender, Education Type, Date of Birth are view-only (set at registration)
- Save / Cancel with Firestore sync via `updateProfile`

### 📬 Contact
- Contact form — name, email, subject, message
- Required field validation
- Simulated success message on submit

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Routing | React Router v6 |
| Styling | Plain CSS — custom, no UI library |
| Charts | Recharts |
| Real-time Database | Firebase Firestore |
| Authentication | Firebase Authentication |
| Build Tool | Vite |
| Hosting | Firebase Hosting (recommended) |

---

## 🗂️ Project Structure

```
├── .env                           ← Firebase keys (never commit)
├── .gitignore
├── index.html
├── vite.config.js
└── src/
    ├── App.jsx                    ← Routes + AuthProvider + StudentProvider
    ├── App.css
    ├── firebase.js                ← Firebase init using import.meta.env
    │
    ├── context/
    │   ├── AuthContext.jsx        ← onAuthStateChanged, login, logout, register
    │   └── StudentContext.jsx     ← Firestore: profile, subjects, tasks, logs
    │
    ├── components/
    │   ├── ProtectedRoute.jsx     ← Shows Loader during authLoading
    │   ├── PublicRoute.jsx        ← Redirects to /dashboard if logged in
    │   ├── ui/
    │   │   ├── Button.jsx
    │   │   └── Loader.jsx
    │   └── form/
    │       ├── InputField.jsx     ← Supports onBlur + className for validation
    │       ├── RadioGroup.jsx
    │       └── FormGroup.jsx
    │
    ├── layout/
    │   ├── DashboardLayout.jsx    ← Wraps protected pages with Navbar
    │   └── Navbar.jsx             ← Sticky, active links, mobile hamburger
    │
    ├── pages/
    │   ├── auth/
    │   │   ├── Login.jsx          ← Firebase signIn, email + password validation
    │   │   └── Register.jsx       ← Firebase createUser, full validation, strength bar
    │   ├── Dashboard.jsx
    │   ├── Subjects.jsx
    │   ├── Tasks.jsx
    │   ├── Progress.jsx
    │   ├── Profile.jsx
    │   └── Contact.jsx
    │
    ├── data/
    │   └── defaultSubjects.js     ← School + College subjects with learnUrl
    │
    └── style/
        ├── login.css      ├── register.css   ├── navbar.css
        ├── dashboard.css  ├── subject.css    ├── tasks.css
        ├── progress.css   ├── profile.css    ├── contact.css
        ├── form.css       ├── button.css     └── loader.css
```

---

## 🔥 Firestore Data Structure

```
users/
  {uid}/
    data/
      profile              firstName, lastName, email, gender,
                           educationType, dob, mobile, createdAt

    subjects/
      {subjectId}          id, name, dailyGoalMinutes, learnUrl,
                           isCustom, isUserModified

    dailyProgress/
      {YYYY-MM-DD}         date,
                           subjects: {
                             [subjectId]: { studied, goal }
                           }

    weeklyHistory/
      {YYYY-MM-DD}         totalMinutes

    studyLogs/
      {logId}              subjectId, minutes, date
```

---

## 🔒 Firestore Security Rules

Copy and paste into **Firebase Console → Firestore Database → Rules → Publish**:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Each user can only read and write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    // Block all other paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18 or higher
- A Firebase project (free Spark plan is sufficient)

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Learn-Skill-Track-DB.git
cd Learn-Skill-Track-DB
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use an existing one)
3. Enable **Authentication** → Sign-in method → **Email/Password** → Enable
4. Enable **Firestore Database** → Create database → **Start in production mode**
5. Apply the security rules from the section above
6. Go to **Project Settings** → **Your apps** → click **Add app** → Web
7. Register the app and copy the `firebaseConfig` object

### Step 4 — Create your .env file

Create a file named `.env` in the project root (same folder as `package.json`):

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> ⚠️ `.env` is already listed in `.gitignore`. Never commit it to GitHub.

### Step 5 — Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting (run once)
firebase init hosting
# Prompts:
#   Which Firebase project?     → select your project
#   Public directory?           → dist
#   Single-page app?            → Yes
#   Overwrite dist/index.html?  → No

# Build the app
npm run build

# Deploy
firebase deploy --only hosting
```

Your app will be live at `https://your-project-id.web.app`

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local Vite development server |
| `npm run build` | Build optimised production bundle to `/dist` |
| `npm run preview` | Preview the production build locally |

---

## 🔄 Default Learning Resources

### School

| Subject | Learning Resource |
|---|---|
| Mathematics | Khan Academy — Math |
| Physics | Khan Academy — Physics |
| Chemistry | Khan Academy — Chemistry |
| Biology | Khan Academy — Biology |
| English | BBC Learning English |
| Social Science | Khan Academy — Humanities |

### College

| Subject | Learning Resource |
|---|---|
| Data Structures & Algorithms | GeeksForGeeks — DSA |
| Web Development | MDN Web Docs — Learn |
| App Development | Android Developer Courses |
| Python | Python Official Tutorial |
| Java | dev.java Learn |
| AI / Machine Learning | Coursera — Machine Learning |
| Software Engineering | GeeksForGeeks — SE |

---

## 🛡️ Security Checklist

- [x] Firebase API keys stored in `.env` — not hardcoded in source code
- [x] `.env` listed in `.gitignore`
- [x] Firestore rules enforce per-user data isolation
- [x] Passwords handled by Firebase Auth only — never written to Firestore
- [x] `serviceAccountKey.json` listed in `.gitignore`
- [x] Migration scripts listed in `.gitignore`
- [x] External links use `noopener,noreferrer`

---

## 📁 Files That Must Never Be Committed

| File | Why |
|---|---|
| `.env` | Contains your Firebase API keys |
| `serviceAccountKey.json` | Firebase Admin SDK — full database access |
| `migrateLearnUrls.mjs` | Contains admin-level Firestore operations |

All three are already covered in `.gitignore`.

---

## 🔄 One-Time Migration (Existing Users)

If users registered before `learnUrl` was added to subjects, run this once:

```bash
# Install Admin SDK
npm install firebase-admin

# Download key: Firebase Console → Project Settings
#   → Service Accounts → Generate new private key
#   → Save as serviceAccountKey.json in project root

# Run
node migrateLearnUrls.mjs

# After success — delete both files immediately
```

The script safely skips subjects that already have a `learnUrl`.

---

## 👨‍💻 Author

Built with ❤️ as a student productivity and daily learning tracker.

---

## 📄 License

This project is created for educational purposes.
