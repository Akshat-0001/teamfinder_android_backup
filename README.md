# TeamFinder: Team Collaboration & Project Hub

## Overview & Purpose

**TeamFinder** is a modern, full-featured team collaboration platform designed to help students, professionals, and enthusiasts find, create, and manage project teams. Whether for hackathons, research, startups, or study groups, TeamFinder streamlines the process of team formation, communication, and project management, all in one place.

---

## Key Features & User Flows

- **User Authentication**: Secure sign-up/sign-in (email/password & Google OAuth) with profile onboarding.
- **Profile Management**: Rich user profiles with skills, interests, university, social/coding links, and avatars.
- **Team Discovery & Search**: Browse, search, and filter teams by category, skills, and more.
- **Team Creation & Management**: Create teams, set requirements, manage members, and handle applications.
- **Application Workflow**: Apply to teams, review/join/leave teams, and manage applications (accept/reject).
- **Team Chat**: Real-time group chat for each team, with message search and member tagging.
- **Notifications**: In-app notifications for invites, application status, team events, and more.
- **Bug Reporting & Suggestions**: Built-in forms for users to report bugs and suggest features.
- **Settings & Customization**: Theme switching (light/dark/custom), password/email change, and more.
- **Mobile-Ready & PWA**: Responsive UI, installable as a PWA, and deployable as a native Android app via Capacitor.

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, shadcn-ui, Tailwind CSS
- **State/Data**: React Query, custom hooks
- **Backend/DB**: [Supabase](https://supabase.com/) (Postgres, Auth, Realtime, Storage)
- **Mobile/Native**: Capacitor (Android integration)
- **Other**: ESLint, PostCSS, Zod, Lucide Icons, date-fns, and more

---

## Folder Structure & Code Organization

```
teamfind-connect-hub/
├── android/                # Native Android project (Capacitor)
├── public/                 # Static assets (favicons, avatars, etc.)
├── src/
│   ├── components/         # Reusable UI components & dialogs
│   │   └── ui/             # Low-level UI primitives (buttons, cards, etc.)
│   ├── hooks/              # Custom React hooks (auth, teams, chat, etc.)
│   ├── integrations/       # Supabase client & types
│   ├── lib/                # Utility functions
│   ├── pages/              # Main app pages (Home, Teams, Chat, etc.)
│   ├── types/              # TypeScript types & constants
│   ├── utils/              # Notification utilities, helpers
│   └── App.tsx, main.tsx   # App entry points
├── supabase/               # Supabase config, edge functions, migrations
├── package.json            # Project metadata & scripts
├── tailwind.config.ts      # Tailwind CSS config
├── vite.config.ts          # Vite build config
└── ...                     # Other config/build files
```

---

## Setup & Installation (Linux/Ubuntu)

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **Git**
- **[Supabase](https://supabase.com/)** project (for backend)
- **Android Studio** (for native build, optional)

### 2. Clone the Repository
```sh
git clone <YOUR_GIT_URL>
cd teamfind-connect-hub
```

### 3. Install Dependencies
```sh
npm install
```

### 4. Environment Setup
- Configure your Supabase credentials in `src/integrations/supabase/client.ts` (see Supabase docs for details).
- (Optional) Set up environment variables if needed (e.g., `.env` for API keys).

### 5. Run the App (Web)
```sh
npm run dev
```
- Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage & Deployment

### Web Deployment
- **Build for production:**
  ```sh
  npm run build
  ```
- **Preview production build:**
  ```sh
  npm run preview
  ```
- **Deploy** to your preferred static host (Vercel, Netlify, etc.) or use [Lovable](https://lovable.dev/) for instant deployment.

### Android (Capacitor) Integration & Deployment

#### 1. Add Android Platform
```sh
npx cap add android
```

#### 2. Sync Web Assets to Android
```sh
npm run build
npx cap sync android
```

#### 3. Open in Android Studio
```sh
npx cap open android
```
- Build, run, and test the app on an emulator or device.

#### 4. Common Capacitor Commands
- **Sync after changes:**
  ```sh
  npx cap sync
  ```
- **Copy assets only:**
  ```sh
  npx cap copy
  ```
- **Update plugins:**
  ```sh
  npx cap update
  ```

#### 5. Android Build Notes
- Ensure Android Studio is installed and configured.
- You may need to update package names, icons, and splash screens in `android/app/src/main/res/`.
- For push notifications, deep linking, or other native features, refer to [Capacitor docs](https://capacitorjs.com/docs).

---

## Supabase Integration
- All authentication, database, and real-time features are powered by Supabase.
- Database schema is defined in `supabase/migrations/`.
- Edge functions (e.g., notifications) are in `supabase/functions/`.
- Update Supabase credentials in `src/integrations/supabase/client.ts`.

---

## Developer Notes & Contribution

- **Code Style**: Uses ESLint, Prettier, and TypeScript strict mode.
- **UI**: Built with shadcn-ui and Tailwind CSS for rapid, accessible design.
- **Testing**: (Add your preferred testing setup here if any)
- **Contributions**: PRs and issues are welcome! Please open an issue for major changes first.
- **Extending**: Add new pages in `src/pages/`, new hooks in `src/hooks/`, and new UI in `src/components/`.

---

## FAQ & Troubleshooting

- **Q: How do I reset my password?**
  - Use the "Forgot Password" link on the login page. Check your email for a reset link.
- **Q: How do I deploy to a custom domain?**
  - If using Lovable, see [custom domain guide](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide).
- **Q: How do I add more native features?**
  - Use Capacitor plugins and follow [Capacitor documentation](https://capacitorjs.com/docs).

---

## License

This project is open source. See [LICENSE](./LICENSE) for details.

---

## Credits
- Built with ❤️ by the TeamFinder contributors.
- Powered by [Supabase](https://supabase.com/), [React](https://react.dev/), [Vite](https://vitejs.dev/), and [Capacitor](https://capacitorjs.com/).
