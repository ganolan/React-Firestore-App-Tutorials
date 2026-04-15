# API Keys & Firebase Security

> Why your `firebase.js` key is safe to commit — and what you actually need to do to protect your database.

---

## What You Will Do

- Understand why a Google Cloud warning email might appear (and why it's a false alarm for your firebase.js)
- Learn what API keys are and why Firebase's work differently
- **Check and update your Firebase Security Rules right now** — this is the real protection for your data
- Learn the one credential that is genuinely dangerous and must never be committed
- Walk away with a clear mental model of what to commit, what to keep secret, and why

---

## Learning Goals

By the end of this tutorial you will be able to:

- Explain why the `firebaseConfig` object in `firebase.js` is safe to commit to a public repository
- Locate your Firebase Security Rules and identify whether your database is currently open or locked
- Write a basic Security Rules configuration appropriate for a prototype app
- Describe what a Firebase Admin SDK service account key is and why it must never be committed

---

# Part 1 — Two Warnings You May Have Seen (They Are Not the Same Thing)

Students working on these tutorials may encounter two different types of warnings. They come from different systems, mean different things, and require different responses. It helps to know which one you're looking at.

---

## Warning 1 — The API Key Exposure Email

**What it looks like:**

> *"Action recommended: We have detected a publicly accessible Google API key in your GitHub repository..."*

**Where it comes from:** Google Cloud Console or GitHub, via automated scanner.

**What triggered it:** You committed `firebase.js` to a public GitHub repository. Automated scanners watch all public commits for strings that match the pattern of an API key. When they find one, they send a warning.

The scanner is **deliberately conservative** — it flags anything that looks like an API key, regardless of whether that key is actually dangerous. It cannot tell the difference between:
- A Firebase client configuration key (harmless — keep reading)
- A secret API key for a paid service (genuinely dangerous)

So it flags both. In your case, it found your Firebase `apiKey` inside `firebase.js`.

**What you should do:** Nothing — for this specific warning. You'll understand exactly why in Part 3.

---

## Warning 2 — The Test Mode Expiry Warning

**What it looks like:**

> *"Your Cloud Firestore security rules are configured to allow access from all users and devices. This is fine for getting started, but your rules are expiring soon..."*

Or a red banner in the Firebase Console saying your database rules are about to expire.

**Where it comes from:** Firebase Console, sometimes also by email.

**What triggered it:** When you created your Firestore database, Firebase likely set it up in **test mode** — a temporary configuration that allows anyone to read and write for 30 days. Firebase sends this warning as the 30-day window approaches its end.

**What you should do:** This one requires action. When the rules expire, **your app will stop working** — all reads and writes will be blocked with permission errors. You need to update your Security Rules before that happens.

**This is covered in Part 4.** If you only have one warning to deal with, skip straight there now.

---

## Summary

| Warning | Source | Is it a security problem? | Action needed? |
|---|---|---|---|
| API key exposure (firebase.js in GitHub) | Google Cloud / GitHub scanner | ❌ No — false alarm for firebase.js | None |
| Test mode expiry | Firebase Console / email | ⚠️ Yes — your app will break and data is exposed | ✅ Update your rules (Part 4) |

---

# Part 2 — What API Keys Are

In most systems, an API key is how a third-party service knows:

1. **Who you are** (which account or project is making the request)
2. **What you're allowed to do** (authorization — which actions are permitted)

Because a single key handles both of these, losing it is serious. Anyone who gets your key can impersonate you and access your account.

That's why most developers are taught: **never commit an API key to a public repository**. It's good advice — for most API keys.

Firebase is different.

| | Traditional API key | Firebase `apiKey` (in firebaseConfig) |
|---|---|---|
| **What it does** | Identifies you AND authorizes access | Identifies your project only |
| **What grants access?** | The key itself | Firebase Security Rules |
| **Safe to commit?** | ❌ No | ✅ Yes — it's designed to be public |
| **If someone gets it?** | They can use your account | They can try to contact your database — but your Security Rules decide what they can do |

---

# Part 3 — The Firebase Difference: Your `firebaseConfig` Is Public by Design

The `apiKey` in your `firebaseConfig` does not grant access to your database. It only **identifies which Firebase project** the app should connect to. Firebase then evaluates your **Security Rules** to decide whether to allow each read or write.

This is confirmed directly in the Firebase documentation:

> "API keys for Firebase services only *identify* your Firebase project and app to those services. *Authorization* is handled through Google Cloud IAM permissions, Firebase Security Rules, and Firebase App Check."
>
> — [Firebase: API Keys Documentation](https://firebase.google.com/docs/projects/api-keys)

And from the Firebase Security Checklist:

> "Firebase API keys are not secret and identify your Firebase project and app to those services."
>
> — [Firebase: Security Checklist](https://firebase.google.com/support/guides/security-checklist)

### What this means for you

✅ You do **not** need to add `firebase.js` to `.gitignore`.

✅ You do **not** need to move your config into environment variables.

✅ This is **not** a security hole. It is how Firebase is designed to work.

### But here's the thing

The fact that your `apiKey` is public does **not** mean your database is automatically protected. It means the *key* doesn't grant access — your **Security Rules** do. If your rules are wide open, anyone who knows your project ID can read and write your data freely.

That's what Part 4 is about.

---

# Part 4 — How Your Database Is Actually Secured: Firebase Security Rules

Firebase Security Rules are **server-side rules** evaluated by Firebase before any read or write is allowed. They are the real protection for your data — not the API key.

## Step 1 — Find your current rules

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. In the left sidebar, click **Firestore Database**
4. Click the **Rules** tab at the top

You'll see a rules configuration panel.

## Step 2 — Identify what state your rules are in

Here are the three common situations and what each one means:

---

### 🔴 Situation A — Test mode (time-limited open access)

> ⚠️ **This is the source of the "test mode expiry" warning.** If you received a warning from Firebase about your rules expiring, your database is in this state.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 5, 15);
    }
  }
}
```

The date in your rules will be different — it's set to 30 days after you created the database.

**What this means:** Anyone can read and write anything in your database — until the expiry date. After that date, your app will stop working entirely (you'll get permission errors).

**Action required:** Yes. See Step 3.

---

### 🟡 Situation B — Open access (no time limit)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**What this means:** Anyone can read and write anything in your database, indefinitely. This is the same as test mode but without the expiry. At least your app won't break — but your data is not protected.

**Action required:** For a prototype app, this is acceptable in the short term, but you should understand what it means. Anyone who discovers your Firebase project ID could add or delete data. Proceed to Step 3 to discuss your options.

---

### 🟢 Situation C — Locked down

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Or anything more specific (e.g. checking `request.auth`). This means you've already set intentional rules. Your database is protected. Skip to Part 5.

---

## Step 3 — Update your rules for your prototype

Your rules depend on what your prototype app actually does. Pick the option that fits.

### Option A — Your app only displays data (no user submissions)

Use this if users only read from the database and all writes happen in the Firebase Console (you add data manually):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

✅ Anyone can view data. ✅ Nobody can add, edit, or delete data from the app.

---

### Option B — Your app has user submissions (forms, posts, comments)

If your app lets users submit data — like the bulletin board — you need writes to work. Without Firebase Authentication (login/accounts), you can't verify *who* is writing. The practical choice for a class prototype is:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **This is open.** Anyone who finds your project ID can write to your database. For a classroom prototype where the data isn't private or sensitive, this is acceptable. For a real product with real users, you would add Firebase Authentication and lock this down.

---

### Option C — Your app has Firebase Authentication set up

If you've added user login to your app:

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

✅ Only logged-in users can read or write. Unauthenticated requests are blocked.

---

## Step 4 — Apply the rules

After editing the rules in the Firebase Console:

1. Click **Publish**
2. Wait a few seconds for the rules to deploy
3. Test your app — make sure it still works as expected

> 📌 **Key takeaway:** This is the step that actually protects your database. Security Rules are your real security layer, not the API key.

---

# Part 5 — The One Real Exception: Service Account Keys

There is one Firebase credential that is genuinely secret and must never be committed: the **Firebase Admin SDK service account key**.

## What it is

The Admin SDK is used in server-side code (e.g. a Node.js backend, a Cloud Function). It gives that server **full administrative access** to your Firebase project — it bypasses all Security Rules entirely.

When you set up the Admin SDK, Firebase gives you a JSON file that looks like this (with real values instead of these placeholders):

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com",
  ...
}
```

This file is typically named `serviceAccountKey.json` or similar.

## Why it's dangerous

Anyone who gets this file can:
- Read, write, or delete any data in your database
- Bypass all Security Rules
- Access Firebase Auth user records
- Take full control of your Firebase project

## What you must do

If you ever download a service account key:

1. Add it to `.gitignore` **immediately — before** you commit anything else:

```
# .gitignore
serviceAccountKey.json
*-firebase-adminsdk-*.json
```

2. Never share this file. Never email it. Never put it in a shared folder.

3. If you accidentally commit it, [revoke it immediately in the Firebase Console](https://console.firebase.google.com) under **Project Settings → Service Accounts** and generate a new one.

## Reassurance

If you've only done Tutorial 1 (Todo App) or Tutorial 2 (Bulletin Board), you have **not** downloaded a service account key. Those tutorials only used the client SDK. This section is here so you know what to watch for as you grow as a developer.

---

# Part 6 — Credentials Checklist

| File / Credential | Safe to commit? | Action |
|---|---|---|
| `src/firebase.js` (with `firebaseConfig`) | ✅ Yes — public by design | No action needed |
| `serviceAccountKey.json` | ❌ Never | Add to `.gitignore` if you ever download one |
| `.env` files containing admin secrets | ❌ Never | Add `.env` to `.gitignore` |
| Firebase Security Rules (in Console) | — | **Review now** — see Part 4 |

---

# Common Questions

**"My app suddenly stopped working and I'm getting permission errors — what happened?"**

Your Firestore test mode rules have expired. Go to Firebase Console → Firestore → Rules and update them using the templates in Part 4. This is not related to your API key.

**"Should I rotate (replace) my Firebase API key since it was exposed?"**

No. Your Firebase `apiKey` is not a secret — rotating it won't improve security and will break your app until you update the config. Leave it as-is.

**"Is my data leaking right now?"**

Only if your Security Rules are wide open (Situation A or B from Part 4). Go check your Rules tab. If they're locked down, your data is protected regardless of the `apiKey` being public.

**"Should I delete my Firebase project and start over?"**

No. There is nothing wrong with your Firebase project. The only scenario where you'd need to take urgent action is if a service account key was committed — and that hasn't happened from the tutorial work.

**"My friend said I should use environment variables for firebase.js. Are they wrong?"**

Environment variables are a way to store configuration values outside your code — and yes, some developers use them for Firebase config. But in a client-side React app, this **doesn't actually hide anything**. The values still end up in the final JavaScript that gets sent to the browser, so anyone can see them. It's not wrong to use environment variables, but it's not a security measure here. The Firebase docs are clear that these config values are safe to include directly in your code.

If you're curious about environment variables in general, [this guide from Create React App](https://create-react-app.dev/docs/adding-custom-environment-variables/) explains how they work — but for Firebase config, it's completely fine to leave the values right in `firebase.js`.

---

# Going Further

### 🔒 Firebase App Check

[Firebase App Check](https://firebase.google.com/docs/app-check) adds an additional verification layer: it checks that requests to your Firebase backend are coming from your actual app, not from a script that someone wrote after copying your `firebaseConfig`. For web apps, it uses Google reCAPTCHA v3.

App Check is not required for class prototypes, but it's worth knowing it exists. It's a good next step if you deploy a real product with real users.

### 📋 Firebase Security Rules Simulator

The Firebase Console includes a **Rules Playground** (next to the Rules editor) where you can simulate read/write requests to test your rules before publishing them. Use it to verify that your rules allow what your app needs and block what it shouldn't.
