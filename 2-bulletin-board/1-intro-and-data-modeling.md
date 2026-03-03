# Tutorial 1 — Intro & Data Modeling

> Run the starter app, explore the screens, and design the Firestore model before writing a single line of database code.

---

## What You Will Do

- Get the starter app running
- Explore the two screens and understand what the app does
- Read the hardcoded data inside the code
- Identify the **entities** the app needs to store
- Design a Firestore structure on paper

---

## Learning Goals

By the end of this tutorial you will be able to:

- Describe what a Firestore **collection** and **document** are
- Identify entities and their fields from a working UI
- Explain why comments need to be a **separate collection** from posts
- Sketch a Firestore data model before writing any code

---

# Part 1 — Run the Starter App

## Step 1 — Download the starter app

1. Go to the course GitHub repository
2. Find the file `2-bulletin-board/bulletin-board-starter-app.zip`
3. Click the **Download raw file** button (the download icon on the right side of the toolbar)
4. Once downloaded, find `bulletin-board-starter-app.zip` in your Downloads folder and double-click it to unzip
5. Move the `bulletin-board-starter-app` folder somewhere sensible, such as your class project folder

## Step 2 — Open the starter app in VS Code

1. In Finder, navigate to the `bulletin-board-starter-app` folder
2. Right-click → **Services → New Terminal at Folder**
3. Open VS Code from the terminal:

```bash
code .
```

If `code .` gives a "command not found" error, open VS Code manually, then open the Command Palette (**Cmd + Shift + P**), type **shell**, and select **Shell Command: Install 'code' command in PATH**. Then try again.

## Step 3 — Open the integrated terminal in VS Code

All remaining commands in this tutorial series should be run from inside VS Code, not the Mac Terminal app.

Open the integrated terminal with **Cmd + J**, or go to **Terminal → New Terminal** in the menu bar. You should see a terminal panel appear at the bottom of the window.

## Step 4 — Install dependencies

In the VS Code terminal, run:

```bash
npm install
```

This downloads the React dependencies. It may take a minute.

## Step 5 — Start the app

```bash
npm start
```

Open: 👉 [http://localhost:3000](http://localhost:3000)

You should see the **Class Bulletin Board** with several posts already showing.

---

# Part 2 — Explore the App

Take a few minutes to click around. Notice:

### Screen 1 — Post List

- A list of posts, each showing a title, author name, date, and a preview of the content
- A form at the top to write a new post

Try adding a post using the form. It works! But if you refresh the page, your post disappears. That's because the data is only stored in memory — there's no database connected yet.

### Screen 2 — Post Detail

Click on any post. You'll see:

- The full post content
- A list of comments
- A form to add a comment

Again, add a comment. Again, it disappears on refresh.

> **This is the problem we will solve.** By the end of Tutorial 3, every post and comment will be saved permanently in Firestore.

---

# Part 3 — Find the Hardcoded Data

The fake data that makes the app look realistic lives inside two files. Let's read it.

## Step 1 — Open `src/components/PostList.js`

Near the top of the file, find the `HARDCODED_POSTS` array:

```js
const HARDCODED_POSTS = [
  {
    id: "1",
    title: "Welcome to the Class Bulletin Board!",
    authorName: "Mr. Nolan",
    content: "Use this board to share project updates...",
    createdAt: "March 1, 2026",
  },
  // ... more posts
];
```

Each post is a JavaScript object. Look at the **fields** each one has:

| Field | Example value | What it stores |
|---|---|---|
| `id` | `"1"` | A unique identifier |
| `title` | `"Welcome..."` | The post heading |
| `authorName` | `"Mr. Nolan"` | Who wrote it |
| `content` | `"Use this board..."` | The full post text |
| `createdAt` | `"March 1, 2026"` | When it was written |

## Step 2 — Open `src/components/PostDetail.js`

Find the `HARDCODED_COMMENTS` object:

```js
const HARDCODED_COMMENTS = {
  "1": [
    { id: "c1", text: "This is so cool, thanks Mr. Nolan!", authorName: "Sam", createdAt: "March 1, 2026" },
    { id: "c2", text: "Will this replace Google Classroom? 😂", authorName: "Riley", createdAt: "March 1, 2026" },
  ],
  "2": [
    { id: "c4", text: "Maybe add a hero banner at the top?", authorName: "Jordan", createdAt: "March 2, 2026" },
  ],
  // ...
};
```

This is a dictionary keyed by `postId` — it maps each post to its list of comments.

Each comment has these fields:

| Field | Example value | What it stores |
|---|---|---|
| `id` | `"c1"` | A unique identifier |
| `text` | `"This is so cool!"` | The comment text |
| `authorName` | `"Sam"` | Who wrote it |
| `createdAt` | `"March 1, 2026"` | When it was written |

> Notice that comments know which post they belong to only because of how they are grouped in the dictionary. In Firestore, we'll handle this differently — read on.

---

# Part 4 — Identify Your Entities

An **entity** is a "thing" your app needs to store. Look at what you've just read and ask: what are the two types of things this app tracks?

- **Posts** — the main messages on the board
- **Comments** — replies attached to a specific post

Each entity will become its own **Firestore collection**.

---

# Part 5 — Design the Firestore Model

Before writing any code, sketch this on paper (or in your notes):

## The `posts` collection

Each document in `posts` represents one post:

```
posts (collection)
└── abc123 (document — Firestore generates this ID automatically)
      ├── title:       "Feedback wanted: my app's home screen"
      ├── authorName:  "Alex"
      ├── content:     "I showed my client the home screen..."
      └── createdAt:   "March 2, 2026"
```

## The `comments` collection

Each document in `comments` represents one comment:

```
comments (collection)
└── xyz789 (document — Firestore generates this ID automatically)
      ├── postId:      "abc123"   ← links this comment to a post
      ├── text:        "Maybe add a hero banner at the top?"
      ├── authorName:  "Jordan"
      └── createdAt:   "March 2, 2026"
```

The key field is **`postId`**. Every comment stores the ID of the post it belongs to. This is how Firestore connects two separate collections.

---

# Part 6 — Why Are Comments a Separate Collection?

You might wonder: why not just put the comments *inside* the post document, like this?

```
posts (collection)
└── abc123 (document)
      ├── title: "Feedback wanted..."
      ├── content: "..."
      └── comments: [          ← ❌ don't do this
            { text: "Great post!", authorName: "Sam" },
            { text: "I agree!", authorName: "Riley" },
            ...
          ]
```

There are two problems with this:

**1. Firestore documents have a 1 MB size limit.**
If a popular post gets hundreds of comments, the document could get too large.

**2. You can't query inside arrays efficiently.**
Firestore is very fast at fetching whole documents and filtering collections. It can't easily search inside an array within a document.

By keeping comments in their own collection and using `postId` to link them, you can fetch just the comments for one post with a simple query — no matter how many comments exist across the whole app.

> This tradeoff — keeping related data in separate collections and linking them with IDs — is one of the most important patterns in Firestore.

---

# Summary

| | Posts | Comments |
|---|---|---|
| **Collection name** | `posts` | `comments` |
| **Key fields** | title, authorName, content, createdAt | text, authorName, createdAt, **postId** |
| **How they connect** | — | `postId` stores the ID of the parent post |

---

## Next Steps

You've run the app, read the data, and designed the model. In the next tutorial you'll connect the posts to Firestore.

➡️ [Tutorial 2 — Connecting Posts](2-connecting-posts.md)
