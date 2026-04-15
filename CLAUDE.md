# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is an educational tutorial series for **Advanced CS Studio (ACSS)** students learning React + Firestore. It is not a deployable product — it is a set of markdown tutorials and a partially-built starter app that students complete as they work through the lessons.

## Repository Structure

Three tutorial series, each in its own folder:

| Folder | Topic | Format |
|--------|-------|--------|
| `1-todo-app/` | React + Firestore basics (CRUD, timestamps, real-time listeners) | Markdown tutorials only — no app code |
| `2-bulletin-board/` | Multi-collection Firestore (cross-collection queries, `where()`) | Markdown tutorials + `bulletin-board-starter-app/` |
| `3-api-keys-and-security/` | Firebase security rules, API key exposure misconceptions | Markdown tutorial only |

## Bulletin Board Starter App

The only runnable code in this repo lives at `2-bulletin-board/bulletin-board-starter-app/`.

```bash
cd "2-bulletin-board/bulletin-board-starter-app"
npm install
npm start    # runs dev server at localhost:3000
npm run build
```

**No test or lint scripts are configured** (Create React App defaults only).

### Firebase Setup (required before running)

Students must replace placeholder values in [src/firebase.js](2-bulletin-board/bulletin-board-starter-app/src/firebase.js) with their own Firebase project config:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  // ...
};
```

## Code Architecture

**Stack:** React 18 (functional components + hooks) · Firebase SDK v9+ (modular) · Create React App · vanilla CSS

### Data Flow

```
firebase.js (db export)
    └── App.js (state: posts, selectedPost)
        ├── PostList.js  — renders post cards, fires onSelectPost
        └── PostDetail.js — renders selected post + comments, fires onAddComment
```

App.js holds all state; child components receive data and callbacks via props.

### Intentional Incompleteness

The starter app ships with hardcoded data (`HARDCODED_POSTS` arrays, `setTimeout` stubs). Tutorial series 2 walks students through replacing each stub with real Firestore calls (`getDocs`, `addDoc`, `query`, `where()`). **Do not "fix" these stubs** — they are pedagogical scaffolding.

Key places students fill in:
- `useEffect` hooks to load Firestore collections
- `addDoc` calls in form submit handlers
- `where()` filters for comment-by-post queries

### Firebase SDK Pattern

All Firestore operations use v9 modular imports:

```js
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
```

## Working With Tutorial Markdown

Tutorials are sequential within each series (numbered `1-`, `2-`, etc.). When editing:
- Code blocks in tutorials should match the starter app's actual file structure
- Firebase SDK calls must use v9 modular syntax (not the legacy `firebase.firestore()` style)
- Student-facing TODO comments in the starter app should align with the tutorial instructions
