# Tutorial 2 — Connecting Posts

> Set up Firebase, then replace the hardcoded posts with real Firestore reads and writes.

---

## What You Will Do

- Create a Firebase project and enable Firestore
- Install the Firebase package
- Load posts from Firestore using `getDocs`
- Save new posts to Firestore using `addDoc`

---

## Learning Goals

By the end of this tutorial you will be able to:

- Connect a React app to a Firebase project
- Read all documents from a Firestore collection
- Write a new document to a Firestore collection
- Use `useEffect` to load data when a component mounts

---

# Part 1 — Create a Firebase Project

## Step 1 — Open the Firebase Console

Go to: [https://console.firebase.google.com](https://console.firebase.google.com)

Sign in with your Google account.

## Step 2 — Create a project

1. Click **Add project**
2. Name it `bulletin-board`
3. Click **Continue**
4. Analytics is optional — you can disable it
5. Click **Create project**

## Step 3 — Enable Firestore

1. In the left sidebar, click **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (this lets you read and write without authentication for now)
4. Select a region close to you, then click **Enable**

---

# Part 2 — Register a Web App

## Step 1 — Go to Project Settings

Click the **gear icon ⚙️** next to "Project Overview" in the top left, then select **Project settings**.

## Step 2 — Add a web app

1. Scroll down to **Your apps**
2. Click the **`</>`** (web) icon
3. Enter a nickname: `bulletin-board-web`
4. Do **not** enable Firebase Hosting
5. Click **Register app**

## Step 3 — Copy your config

You'll see a code block that looks like this:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "bulletin-board-xxxxx.firebaseapp.com",
  projectId: "bulletin-board-xxxxx",
  storageBucket: "bulletin-board-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

⚠️ Make sure you copy the **npm config object** (the plain JavaScript object), **not** the `<script>` tag version.

Keep this tab open — you'll paste these values in Step 5.

---

# Part 3 — Install Firebase

In VS Code, open the Terminal (Cmd + J) and run:

```bash
npm install firebase
```

This adds the Firebase SDK to your project. You'll see it appear in `package.json` under `dependencies`.

---

# Part 4 — Fill In `firebase.js`

Open `src/firebase.js`. You'll see placeholder values:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  // ...
};
```

Replace each `"YOUR_..."` string with the matching value from your Firebase console. Keep the key names exactly as they are — only replace the values.

✅ When done, save the file. The app won't look different yet, but the connection is ready.


## ⚠️ Important
Keep the import lines at the top of the file and the `export const db` line at the bottom — only replace the values inside the `firebaseConfig` object.

Do not to delete or modify:
- The `import` statements
- The `export const db = initializeFirestore(app);` line
- The opening and closing braces of `firebaseConfig`

Only change the values (like `"YOUR_API_KEY"`)

**Lost your Firebase config?** If you accidentally closed the Firebase Console tab, go back to [https://console.firebase.google.com](https://console.firebase.google.com), click your project, click the **gear icon ⚙️** next to "Project Overview", select **Project settings**, scroll to **Your apps**, and click the web app name to view the config again.

---

# Part 5 — Load Posts from Firestore

Now open `src/components/PostList.js`. You're going to make three changes.

## Step 1 — Add imports

At the top of the file, find the existing import:

```js
import { useState } from "react";
```

Replace it with:

```js
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
```

This gives you:
- `useEffect` — runs code when the component loads
- `collection` — points to a Firestore collection
- `getDocs` — fetches all documents from a collection
- `addDoc` — adds a new document to a collection
- `db` — your Firestore connection from `firebase.js`

## Step 2 — Change the initial state

Find this line near the top of the `PostList` function:

```js
const [posts, setPosts] = useState(HARDCODED_POSTS);
```

Change it to:

```js
const [posts, setPosts] = useState([]);
```

The list starts empty. Firestore will fill it in a moment.

## Step 3 — Add a `fetchPosts` function and `useEffect`

Below the `useState` lines, add:

```js
const fetchPosts = async () => {
  const snapshot = await getDocs(collection(db, "posts"));
  const list = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  setPosts(list);
};

useEffect(() => {
  fetchPosts();
}, []);
```

**What this does:**
- `getDocs(collection(db, "posts"))` — fetches every document in the `posts` collection
- `snapshot.docs.map(...)` — converts each Firestore document into a plain JavaScript object with an `id` field
- `useEffect(() => { ... }, [])` — runs `fetchPosts` once when the component first loads

## Step 4 — Delete the hardcoded data

You no longer need it. Delete the entire `HARDCODED_POSTS` array at the top of the file.

---

# Part 6 — Save New Posts to Firestore

Still in `PostList.js`, find the `handleAddPost` function. Replace the TODO block with an `addDoc` call.

Find this code:

```js
// TODO (Tutorial 2): Replace the lines below with addDoc to save the post to the "posts" collection in Firestore
const newPost = {
  id: Date.now().toString(),
  title,
  content,
  authorName,
  createdAt: new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
};
setPosts([newPost, ...posts]);
// TODO (Tutorial 2): After addDoc, call fetchPosts() instead of updating state directly
```

Replace it with:

```js
await addDoc(collection(db, "posts"), {
  title,
  content,
  authorName,
  createdAt: new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
});
fetchPosts();
```

**What changed:**
- `addDoc` saves a new document to the `posts` collection in Firestore — Firestore generates the `id` automatically, so you don't include it
- After saving, `fetchPosts()` reloads the list so the new post appears

---

# Part 7 — Test It

Save your files. The app should reload automatically.

1. Type a new post in the form and click **Post**
2. The post should appear in the list
3. Refresh the page — the post should **still be there**
4. Check the Firebase Console → Firestore Database → `posts` collection — you should see your document

✅ Posts are now connected to Firestore.

---

## Common Errors

### ❌ `Cannot find module '../firebase'`

Make sure `firebase.js` is inside the `src/` folder, not outside it.

### ❌ `FirebaseError: Missing or insufficient permissions`

Your Firestore rules are blocking reads or writes. Go to Firebase Console → Firestore → **Rules** and confirm the rules say:

```
allow read, write: if true;
```

This is the default when you chose "test mode".

### ❌ Posts load once but new posts don't appear

Check that `fetchPosts()` is being called after `addDoc`. It must not be inside the `if (!title || ...)` guard.

### ❌ The form clears but nothing appears

Open the browser console (Cmd + Option + J). Look for a red error. A config typo in `firebase.js` is the most common cause.

---

## Next Steps

Posts are live. Now let's do the same for comments — with one new twist: filtering by `postId`.

➡️ [Tutorial 3 — Connecting Comments](3-connecting-comments.md)
