# Navbar QA Audit & Fix Plan for All Role Dashboards

Perform a comprehensive QA test and software developer fix for the navigation system (Header, Sidebar, Role Switcher Bar, and Role Dashboards) across all 5 user roles: **Director**, **Producer**, **Actor**, **Music Director**, and **Admin**.

## User Review Required

> [!IMPORTANT]
> - **Sidebar Link Matching & Active Tab Sync**: All sidebar items use hash-based routing (e.g., `/director#casting`, `/actor#scenes`, `/music-director#themes`, `/admin#users`). We will implement hash-to-tab sync in all 5 role dashboards so that clicking any sidebar item immediately activates the correct dashboard tab and updates the active highlight state cleanly.
> - **Role Switcher Integration**: Integrate `RoleSwitcherBar` directly into the top layout/header or sub-header so testers and users can switch role personas effortlessly from anywhere in the application.

## Key Defect Findings from QA Audit

1. **Hash Fragment Disconnect**: Dashboards (`DirectorDashboard`, `ActorDashboard`, `MusicDirectorDashboard`, `AdminDashboard`) did not listen to `location.hash`. Clicking sidebar sub-items (e.g., "Casting Dispatch", "Script Study", "Character Leitmotifs") changed the URL but failed to switch the dashboard view.
2. **Sidebar `NavLink` Highlight Bug**: In React Router, `NavLink` matched `/director#scenes` and `/director#casting` as active simultaneously because `pathname` `/director` matched all items.
3. **Missing Click-Outside Handlers in Header**: Dropdowns for Cinema Production Selector, Notifications, and Profile Menu remained open when clicking elsewhere on the page.
4. **Admin Dashboard Lack of Tab/Section Navigation**: `AdminDashboard` had sidebar hash links (`#movies`, `#users`) but no corresponding tabs or scroll section anchors.
5. **Mobile Drawer UX Issue**: Navigating between hash links on the same page failed to trigger mobile drawer closure.

## Proposed Changes

---

### Layout & Navigation Components

#### [MODIFY] [`Sidebar.jsx`](file:///c:/Users/devpr/Downloads/movieOS%20Agent/frontend/src/components/common/Sidebar.jsx)
- Replace standard `NavLink` `isActive` with custom pathname + hash active state detection so only the exact active tab/hash item is highlighted.
- Ensure `onCloseMobile` is called whenever any link or hash link is clicked.
- Align all role item paths with exact tab keys in all dashboards:
  - **Director**: `/director#breakdown`, `/director#scenes`, `/director#casting`, `/director#music`, `/director#upload`, `/settings`
  - **Producer**: `/producer#overview`, `/producer#schedules`, `/producer#finances`, `/producer#departments`, `/producer#weather`, `/settings`
  - **Actor**: `/actor#inbox`, `/actor#scenes`, `/actor#coach`, `/actor#profile`, `/settings`
  - **Music Director**: `/music-director#tracks`, `/music-director#themes`, `/music-director#ai`, `/settings`
  - **Admin**: `/admin#overview`, `/admin#movies`, `/admin#users`, `/settings`

#### [MODIFY] [`Header.jsx`](file:///c:/Users/devpr/Downloads/movieOS%20Agent/frontend/src/components/common/Header.jsx)
- Add click-outside backdrop/ref handlers for Movie Dropdown, Notification Dropdown, and User Profile Dropdown.
- Safely handle null/undefined `role` string replacements (`role?.replace('_', ' ')`).
- Embed quick role-switcher options in profile dropdown for fast persona testing.

#### [MODIFY] [`DashboardLayout.jsx`](file:///c:/Users/devpr/Downloads/movieOS%20Agent/frontend/src/layouts/DashboardLayout.jsx)
- Retain clean dashboard stage layout with Header, Sidebar, and content view.

---

### Role Dashboards (Hash & Active Tab Synchronization)

#### [MODIFY] [`DirectorDashboard.jsx`](file:///c:/Users/devpr/Downloads/movieOS%20Agent/frontend/src/features/director/DirectorDashboard.jsx)
- Add `useLocation` hook and `useEffect` to synchronize `location.hash` with `activeTab` (`'breakdown'`, `'scenes'`, `'casting'`, `'music'`, `'upload'`).
- Update tab change handlers to update `window.location.hash`.

#### [MODIFY] [`ProducerDashboard.jsx`](file:///c:/Users/devpr/Downloads/movieOS%20Agent/frontend/src/features/producer/ProducerDashboard.jsx)
- Enhance existing `useEffect` for `location.hash` sync to support all hash values (`#overview`, `#schedules`, `#finances`, `#budget`, `#departments`, `#weather`).
- Ensure tab changes update `window.location.hash`.

#### [MODIFY] [`ActorDashboard.jsx`](file:///c:/Users/devpr/Downloads/movieOS%20Agent/frontend/src/features/actor/ActorDashboard.jsx)
- Add `useLocation` hook and `useEffect` to synchronize `location.hash` with `activeTab` (`'inbox'`, `'casting'`, `'scenes'`, `'coach'`, `'profile'`, `'filmography'`).
- Update tab state transitions to set `window.location.hash`.

#### [MODIFY] [`MusicDirectorDashboard.jsx`](file:///c:/Users/devpr/Downloads/movieOS%20Agent/frontend/src/features/music/MusicDirectorDashboard.jsx)
- Add `useLocation` hook and `useEffect` to synchronize `location.hash` with `activeTab` (`'tracks'`, `'themes'`, `'ai'`).
- Update tab state transitions to set `window.location.hash`.

#### [MODIFY] [`AdminDashboard.jsx`](file:///c:/Users/devpr/Downloads/movieOS%20Agent/frontend/src/features/admin/AdminDashboard.jsx)
- Add tab/section state (`'overview'`, `'movies'`, `'users'`) and `location.hash` sync.
- Add active tab buttons and section anchors so clicking `#movies` or `#users` filters/scrolls directly to Movies or User Directory.

---

## Verification Plan

### Automated Build Verification
- Run `npm run build` in `frontend` directory to ensure zero syntax or React compilation errors.

### Manual QA Checklist Across All Roles
1. **Director Role Testing**:
   - Navigate to `/director`. Click "Casting Dispatch" (`/director#casting`), verify tab switches to Casting. Click "Score & Music Reviews" (`/director#music`), verify tab switches to Music. Verify only clicked sidebar link is highlighted.
2. **Producer Role Testing**:
   - Navigate to `/producer`. Test sidebar links: "Shooting Schedules" (`/producer#schedules`), "Budget & Financials" (`/producer#finances`), "Departments & Crew" (`/producer#departments`), "Weather Logistics" (`/producer#weather`). Verify tab and sidebar highlight update in sync.
3. **Actor Role Testing**:
   - Navigate to `/actor`. Test links: "Casting Offers Inbox", "Script & Scene Study", "AI Acting Coach", "Verified Filmography". Verify smooth tab switching.
4. **Music Director Role Testing**:
   - Navigate to `/music-director`. Test links: "Audio Cues & Tracks", "Character Leitmotifs", "AI Music Copilot".
5. **Admin Role Testing**:
   - Switch role to ADMIN. Test sidebar links: "Studio Management", "All Productions", "Talent Directory". Verify section/tab filtering works.
6. **Mobile Navbar Testing**:
   - Toggle mobile sidebar menu on smaller screen sizes. Click a link, verify drawer closes smoothly.
