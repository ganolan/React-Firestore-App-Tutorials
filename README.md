# React + Firestore Tutorial Series

Tutorials for **Advanced CS Studio** at Hong Kong International School.

Each series builds on the previous one. Work through them in order.

---

## Series

### 1 — Todo App
> Build a cloud-connected todo list from scratch.

Introduces React and Firestore from the ground up. No prior experience required.

| Tutorial | Topic |
|---|---|
| 1 | Create the app, connect to Firestore, save and load todos |
| 2 | Delete todos |
| 3 | Mark todos as complete |
| 4 | Add timestamps |
| 5 | Switch to realtime listeners |

📁 [`1-todo-app/`](1-todo-app/)

---

### 2 — Bulletin Board
> Design a data model and connect a multi-screen app to Firestore.

Students are given a working React frontend with hardcoded data. The tutorials guide them through replacing that data with real Firestore reads and writes — introducing multiple collections and cross-collection queries.

| Tutorial | Topic |
|---|---|
| 1 | Run the starter app, identify entities, design the Firestore model |
| 2 | Connect posts — load from and save to Firestore |
| 3 | Connect comments — filtered queries with `where()` |

📁 [`2-bulletin-board/`](2-bulletin-board/)

---

### 3 — Security & Authentication
> Understand what protects your data — and add user sign-in to your app.

Covers API key misconceptions, Firebase Security Rules, and adding Google Authentication so your app knows who each user is.

| Tutorial | Topic |
|---|---|
| 1 | API keys, Security Rules, and the one credential that's actually secret |
| 2 | Add Google sign-in with Firebase Authentication |

📁 [`3-security-and-authentication/`](3-security-and-authentication/)

---

## Prerequisites

- VS Code
- Node.js — check with `node -v` in a terminal. Install from [nodejs.org](https://nodejs.org) if needed.
- A Google account (for Firebase)
