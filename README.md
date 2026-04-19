<div align="center">
<img width="1200" height="475" alt="CodeStacker" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CodeStacker

CodeStacker is a developer-focused blog and bookmarking platform built with React, TypeScript, Vite, Tailwind CSS, and Firebase.

It includes content browsing, search, bookmarks, and an admin dashboard for publishing and managing blog posts.

## Features

- Responsive blog listing with categories, tags, and featured images
- Search by title, content, and tags
- Google sign-in via Firebase Authentication
- Bookmark articles for later reading
- Admin dashboard to create, update, and delete blog posts
- Markdown-based blog content with estimated read time and view tracking
- Firebase Firestore backend for blog content and user bookmarks

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Add your Firebase configuration to `firebase-applet-config.json`.
   - This app loads Firebase settings directly from `firebase-applet-config.json`
   - Make sure `projectId`, `apiKey`, `authDomain`, `firestoreDatabaseId`, and other fields are set correctly.
3. Start the development server:
   `npm run dev`

## Notes

- The admin dashboard is protected by Firebase auth and a configured admin email in `src/store/AuthContext.tsx`.
- Bookmarks are stored per user in Firestore under `users/{uid}/bookmarks`.
- If you want to add environment variables, use `.env.local` or `.env` and update `vite.config.ts`.

## Project Structure

- `src/App.tsx` – main router and auth provider
- `src/pages/Home.tsx` – blog list and search page
- `src/pages/BlogDetail.tsx` – detailed blog view with bookmarking
- `src/pages/AdminDashboard.tsx` – create/edit blog posts
- `src/pages/BookmarkList.tsx` – user bookmarks
- `src/services/firebase.ts` – Firebase initialization
- `src/store/AuthContext.tsx` – authentication provider and Google sign-in
