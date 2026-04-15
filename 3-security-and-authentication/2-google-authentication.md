# Google Authentication with Firebase

> Let users sign in with their Google account — so your app knows who's who.

---

## What You Will Do

- Enable Google sign-in in your Firebase project
- Add a sign-in / sign-out button to your React app
- Track who is currently logged in and display their name
- Update your Firebase Security Rules so only signed-in users can read and write

---

## Learning Goals

By the end of this tutorial you will be able to:

- Set up Firebase Authentication with Google as a sign-in provider
- Use `signInWithPopup` and `signOut` to manage user sessions in a React app
- Use `onAuthStateChanged` to track login state across page refreshes
- Write a Security Rules configuration that requires authentication

---

## Prerequisites

- You've completed Tutorial Series 1 (Todo App) or Series 2 (Bulletin Board)
- You have a working React + Firestore app with `firebase.js` already configured
- Your Firebase project is set up and running

This tutorial uses the **Bulletin Board app** as its example, but the pattern works the same way in any React + Firebase app.

---

# Part 1 — Why Add Authentication?

Right now, your app lets anyone do anything. Open the URL, and you can read every post, add new ones, delete data — no questions asked. That's fine for early prototyping, but it creates two problems:

1. **You can't tell users apart.** Every post and comment is anonymous. There's no way to show "Posted by Alex" because the app doesn't know who Alex is.

2. **You can't protect your data.** In Tutorial 3-1 (API Keys & Security), you saw that Security Rules are the real protection for your database. But the strongest useful rule — "only allow signed-in users" — requires authentication to be set up first.

Adding Google sign-in solves both problems. After this tutorial, your app will know who each user is, and your database will reject requests from anyone who isn't logged in.

---

# Part 2 — Enable Google Sign-In in Firebase

### Step 1 — Open the Authentication section

1. Go to [Firebase Console](https://console.firebase.google.com) and select your project
2. In the left sidebar, click **Build → Authentication**
3. If this is your first time here, click **Get started**

### Step 2 — Enable Google as a sign-in provider

1. Click the **Sign-in method** tab
2. Click **Google** in the provider list
3. Toggle the **Enable** switch
4. Under **Project public-facing name**, enter your app's name (this shows on the Google sign-in screen — students will see it, so use something recognizable like "ACSS Bulletin Board")
5. Under **Support email**, select your email from the dropdown
6. Click **Save**

That's it on the Firebase side. Google sign-in is now enabled for your project.

---

# Part 3 — Update Your Code

You need three things in your app:

1. A way to **sign in** (a button that opens the Google login popup)
2. A way to **sign out**
3. A way to **know who's currently logged in** (so you can show their name and conditionally render things)

### Step 1 — Update `firebase.js`

You already export `db` from this file. Now you'll also export the auth service and the Google provider.

Open `src/firebase.js` and add the highlighted lines:

```js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';    // ← add this

const firebaseConfig = {
  // your existing config — don't change this
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);                                       // ← add this
const googleProvider = new GoogleAuthProvider();                  // ← add this

export { db, auth, googleProvider };                             // ← update this
```

**What changed:**
- `getAuth` gives you the Firebase Authentication service (like `getFirestore` gives you the database)
- `GoogleAuthProvider` tells Firebase you want to use Google as the login method
- You export both so other files can use them

### Step 2 — Create a sign-in / sign-out component

Create a new file at `src/components/AuthButton.js`.

Before you look at the code, one quick concept: notice that the function takes `{ user }` in its parentheses. This is how React components receive data from a parent component. In your Bulletin Board app, you've already seen this pattern — `PostDetail` receives `post` and `onBack` the same way. The parent decides *what* to pass in, and the child component uses it. In React, these are called **props** (short for properties).

You don't need to fully understand props right now — just know that when `App.js` renders `<AuthButton user={user} />`, the `user` value becomes available inside `AuthButton` through `{ user }`.

```jsx
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

function AuthButton({ user }) {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign-in failed:', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out failed:', error.message);
    }
  };

  if (user) {
    return (
      <div className="auth-bar">
        <span>Signed in as <strong>{user.displayName}</strong></span>
        <button onClick={handleSignOut} className="auth-button">Sign out</button>
      </div>
    );
  }

  return (
    <div className="auth-bar">
      <button onClick={handleSignIn} className="auth-button">Sign in with Google</button>
    </div>
  );
}

export default AuthButton;
```

**How this works:**

- `signInWithPopup` opens a Google login window. The user picks their Google account, and Firebase handles everything else — tokens, sessions, cookies. You don't need to manage any of that.
- `signOut` ends the session.
- If `user` exists (someone is logged in), the component shows their name and a sign-out button. If `user` is `null`, it shows a sign-in button instead.

> 💡 Because our school uses Google accounts, students and teachers can sign in with their school email — no extra setup needed on their end.

### Step 3 — Track the logged-in user in `App.js`

Open `src/App.js`. You need to:

1. Import `auth` and the `onAuthStateChanged` listener
2. Add a `user` state variable
3. Listen for login/logout events
4. Pass `user` down to your components

Here's the pattern — adapt it to your existing `App.js`:

```jsx
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthButton from './components/AuthButton';
// ... your other imports

function App() {
  const [user, setUser] = useState(null);
  // ... your other state variables (posts, selectedPost, etc.)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <AuthButton user={user} />

      {user ? (
        // your existing app content goes here
        // (PostList, PostDetail, etc.)
      ) : (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          Sign in to view and create posts.
        </p>
      )}
    </div>
  );
}

export default App;
```

**What `onAuthStateChanged` does:**

This is a **listener** — the same concept as `onSnapshot` from the Firestore tutorials. Instead of listening for database changes, it listens for authentication changes. Firebase calls your callback whenever:

- The user signs in → `currentUser` is an object with their info
- The user signs out → `currentUser` is `null`
- The page loads and Firebase restores a previous session → `currentUser` is the returning user

The `return () => unsubscribe()` cleanup line is the same pattern you've used before — it tells React to stop listening when the component unmounts.

### Step 4 — Test it

1. Run your app (`npm start`)
2. You should see a "Sign in with Google" button
3. Click it — a Google popup opens
4. Sign in with your school Google account
5. The button should change to show your name and a "Sign out" option
6. Refresh the page — you should still be signed in (Firebase remembers the session)

If the popup doesn't appear, check your browser's popup blocker. If you see a `auth/unauthorized-domain` error, see the Common Errors section at the bottom.

---

# Part 4 — Use the User's Identity

Now that you know who's logged in, you can attach their name to things they create. For example, in the Bulletin Board app, when someone adds a post, you can automatically fill in the author field.

Here's the idea. Wherever you have a form that submits data to Firestore, you can include the user's info:

```js
await addDoc(collection(db, 'posts'), {
  title: title,
  content: content,
  authorName: user.displayName,    // ← from the signed-in user
  authorEmail: user.email,         // ← optional, but useful
  createdAt: serverTimestamp()
});
```

To make this work, pass `user` to any component that creates data (the same way you passed it to `AuthButton`):

```jsx
<PostList user={user} onOpenPost={handleOpenPost} />
```

Then inside `PostList`, use `user.displayName` instead of asking the user to type their name. You can remove the author name input field entirely — the app already knows who they are.

> This is a design choice, not a requirement. Some apps still show a "display name" field so users can choose a nickname. But for a school app where everyone signs in with their real Google account, using `displayName` automatically is simpler and more consistent.

---

# Part 5 — Lock Down Your Security Rules

This is the payoff. Now that users sign in, you can write a Security Rule that means something:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**What this does:** Every request to your database must come from a signed-in user. If someone tries to read or write without being authenticated — whether from your app, a script, or the browser console — Firebase blocks it.

### How to apply

1. Open [Firebase Console](https://console.firebase.google.com) → your project → **Firestore Database** → **Rules** tab
2. Replace your current rules with the block above
3. Click **Publish**
4. Test your app — sign in and verify everything works, then sign out and confirm the app shows the sign-in screen (not permission errors in the console)

### What changed from before

In Tutorial 3-1, you saw the security rules options and the tradeoff: open access (`if true`) lets everyone in, but the only alternative was `if false` which blocks everything. Authentication gives you the middle option — a real gate that lets your users through while keeping everyone else out.

| Rule | Who can access | When to use |
|---|---|---|
| `allow read, write: if true` | Anyone | Early prototyping only |
| `allow read, write: if request.auth != null` | Signed-in users only | ✅ After adding authentication |
| `allow read, write: if false` | Nobody | Locking down a decommissioned project |

---

# Part 6 — What the `user` Object Contains

When someone signs in with Google, Firebase gives you a user object. Here are the fields you're most likely to use:

| Field | Example | Notes |
|---|---|---|
| `user.displayName` | `"Alex Chen"` | Their Google account name |
| `user.email` | `"achen@school.edu"` | Their Google email |
| `user.uid` | `"aBcD1234eFgH5678"` | A unique ID assigned by Firebase — never changes, even if they change their name or email |
| `user.photoURL` | `"https://lh3.google..."` | Their Google profile photo (can be used as an `<img>` src) |

The `uid` is the most important one for database work. If you ever need to query "all posts by this user" or "only let users edit their own posts," you'd match against `uid` — not `displayName` or `email`, which can change.

---

# Common Errors

**"auth/unauthorized-domain" when the popup opens**

Firebase only allows sign-in from domains you've approved. By default, `localhost` is already approved, so this shouldn't happen during development. If it does:

1. Go to Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Confirm `localhost` is in the list
3. If you've deployed your app somewhere, add that domain too

**The popup opens but immediately closes**

This usually means Google sign-in isn't enabled. Go back to Part 2 and make sure the Google provider toggle is on and you clicked Save.

**"signInWithPopup is not a function" or similar import errors**

Make sure your import is from `'firebase/auth'` (the modular SDK), not from `'firebase'` directly:

```js
// ✅ Correct
import { signInWithPopup, signOut } from 'firebase/auth';

// ❌ Wrong — this is the old SDK style
import firebase from 'firebase';
```

**User shows as `null` even after signing in**

Make sure you set up the `onAuthStateChanged` listener inside a `useEffect` in `App.js`. If you're checking `user` before the listener has fired, it will be `null` on the first render. This is normal — the listener fires shortly after the page loads.

**"Can I restrict sign-in to only school Google accounts?"**

Yes, but not through Firebase alone. The simplest approach is to check the user's email domain after they sign in and sign them out if it doesn't match:

```js
onAuthStateChanged(auth, (currentUser) => {
  if (currentUser && !currentUser.email.endsWith('@school.edu')) {
    signOut(auth);
    alert('Please sign in with your school Google account.');
    return;
  }
  setUser(currentUser);
});
```

Replace `@school.edu` with your school's actual email domain. This isn't bulletproof security — it's a client-side check — but for a class project it's a practical way to keep things within your school community.

---

# Summary

| What you did | Why |
|---|---|
| Enabled Google sign-in in Firebase Console | Tells Firebase to accept Google accounts |
| Added `auth` and `googleProvider` exports to `firebase.js` | Makes the auth service available to your app |
| Created `AuthButton.js` | Gives users a way to sign in and out |
| Added `onAuthStateChanged` listener in `App.js` | Tracks who is logged in across page loads and refreshes |
| Updated Security Rules to `request.auth != null` | Blocks all unauthenticated access to your database |

Your app now has a complete authentication flow: users sign in with Google, your app knows who they are, and your database only responds to logged-in users.
