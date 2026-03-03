# 🚀 Tutorial 1 — React Todo App with Firebase Firestore

> A beginner-friendly full‑stack web app using **React + Firebase Firestore**

---

## ✅ What You Will Build

A working Todo web app that:

* Saves data to a cloud database
* Loads data automatically
* Uses real React components and state

---

## 🎯 Learning Goals

By completing this tutorial you will:

* Create a React application
* Connect a web app to Firebase
* Store and retrieve data using Firestore
* Understand React **state** and **effects**

---

## 🧰 Requirements

Before starting, make sure you have:

* ✅ VS Code installed
* ✅ Node.js installed
* ✅ Google account (for Firebase)

Check Node installation by opening the Terminal app and running:

```bash
node -v
npm -v
```
If you get an error that says `command not found`, install Node from [https://nodejs.org](https://nodejs.org) and choose the macOS installer.

---

# Part 1 — Create Your React App (Mac Instructions)

## Step 1 — Open a Terminal in your class folder

1. Open **Finder**
2. Navigate to your class project folder
3. Right click → **Services → New Terminal at Folder**

*(Alternative: open Terminal and use `cd`.)*

---

## Step 2 — Create the React app

```bash
npx create-react-app todo-app
```

📌 `todo-app` becomes your project folder name.

---

## Step 3 — Open in VS Code

```bash
cd todo-app
code .
```

If `code .` fails:

1. Open Visual Studio Code
2. Command Palette (Cmd+Shift+P) → type **shell**
3. Select **Install 'code' command in PATH**

---

## Step 4 — Start the development server

Inside VS Code find the **Panel** button in the top right corner and click it to open the Terminal (Command + J).

Then run:

```bash
npm run start
```

Open:

👉 [http://localhost:3000](http://localhost:3000)

✅ Seeing the React starter page means everything works.

---

# Part 2 — Set Up Firebase

## Step 1 — Open Firebase Console

[https://console.firebase.google.com](https://console.firebase.google.com)

---

## Step 2 — Create a Project

1. Click **Add project**
2. Name it `todo-app`
3. Continue
4. Analytics optional

---

## Step 3 — Enable Firestore

1. **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode**
4. Select region → Enable

📘 Docs: [https://firebase.google.com/docs/firestore/quickstart](https://firebase.google.com/docs/firestore/quickstart)

---

# Part 3 — Register a Web App (IMPORTANT)

1. ⚙️ **Project Settings**
2. Scroll to **Your apps**
3. Click **</> Web App**
4. Nickname: `todo-web`
5. ❌ Do NOT enable hosting
6. Register app

⚠️ Use the **npm installation config**, NOT the `<script>` version.

---

# Part 4 — Install Firebase

Go back to VS Code, open a second terminal window (**Terminal → New Terminal**) and run:

```bash
npm install firebase
```

This installs Firebase and adds it to your `package.json` dependencies.

📘 Docs: [https://firebase.google.com/docs/web/setup](https://firebase.google.com/docs/web/setup)

---

# Part 5 — Create `firebase.js`

## Step 1 — Create the file

Inside `src/` create:

```text
firebase.js
```

## Step 2 — Copy your Firebase config from the Firebase Console and paste it

1. Go to **Firebase Console → Project settings (gear icon)**
2. Scroll to **Your apps** and select your web app (`todo-web`)
3. In **SDK setup and configuration**, choose the **Config** view (the object that starts with `const firebaseConfig = { ... }`)
4. Copy the values from your Firebase project
5. Paste those values into your `firebaseConfig` object in `src/firebase.js`

✅ Keep the same key names (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) and only replace the strings.

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from console
const firebaseConfig = {
  apiKey: "YOUR KEY HERE",
  authDomain: "YOUR KEY HERE",
  projectId: "YOUR KEY HERE",
  storageBucket: "YOUR KEY HERE",
  messagingSenderId: "YOUR KEY HERE",
  appId: "YOUR KEY HERE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore database connection
export const db = getFirestore(app);
```

---

# Part 6 — Create the Todo Component

Create folder:

```text
src/components
```

Create file:

```text
Todo.js
```

```jsx
import React, { useState, useEffect } from "react";
import "../App.css";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function Todo() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);

  const addTodo = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "todos"), { todo });
    fetchTodos();
  };

  const fetchTodos = async () => {
    const snapshot = await getDocs(collection(db, "todos"));

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTodos(list);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <section className="todo-container">
      <div className="todo">
        <h1 className="header">Todo App</h1>

        <input
          type="text"
          placeholder="What do you want to do?"
          onChange={(e) => setTodo(e.target.value)}
        />

        <button className="btn" onClick={addTodo}>
          Add
        </button>

        <div className="todo-content">
          {todos.map((t) => (
            <p key={t.id}>{t.todo}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Todo;
```

---

# Part 7 — Add Styling

Open `App.css`:

```css
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.todo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.todo {
  width: 70%;
  margin: 3rem auto;
}

.header {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

input {
  padding: 10px 3px;
  width: 100%;
}

.btn {
  padding: 10px 1rem;
  background: #334;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1rem;
}

.todo-content {
  margin-top: 2rem;
}
```

---

# Part 8 — Load Component in `App.js`

Open `src/App.js` and replace everything with:

```jsx
import Todo from "./components/Todo";

function App() {
  return <Todo />;
}

export default App;
```

---

# Part 9 — Run the App

```bash
npm run start
```

Open:

👉 [http://localhost:3000](http://localhost:3000)

You should see:

✅ Todo interface  
✅ Input field  
✅ Add button  
✅ Todos saved in Firestore

---

## 🛠️ Common Errors

### ❌ Firebase config errors

Make sure you copied the **npm config**, not the `<script>` tag.

### ❌ Nothing appears after adding todos

Check Firestore database → collection `todos` exists.

### ❌ `code .` not working

Install VS Code shell command from Command Palette.

---

## 📚 Continue the Series

1. [Tutorial 2 — Delete Todos](2-delete-todos.md)
2. [Tutorial 3 — Mark Todos Complete](3-mark-todos-complete.md)
3. [Tutorial 4 — Add Timestamps](4-add-timestamps.md)
4. [Tutorial 5 — Realtime Listeners](5-realtime-listeners.md)

---

🎯 You completed Tutorial 1 of the React + Firebase Todo series.
