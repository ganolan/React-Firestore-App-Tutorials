import { useState } from "react";

// Hardcoded posts — will be replaced with Firestore data in Tutorial 2
const HARDCODED_POSTS = [
  {
    id: "1",
    title: "Welcome to the Class Bulletin Board!",
    authorName: "Mr. Nolan",
    content:
      "Use this board to share project updates, ask questions, and give each other feedback. Torch is proud of you all. 🐉",
    createdAt: "March 1, 2026",
  },
  {
    id: "2",
    title: "Feedback wanted: my app's home screen",
    authorName: "Alex",
    content:
      "I showed my client the home screen mockup and they said it felt 'too empty'. Not sure what to add — any ideas?",
    createdAt: "March 2, 2026",
  },
  {
    id: "3",
    title: "List view or grid view — which should I use?",
    authorName: "Jordan",
    content:
      "My client's mockup shows a grid but I think a list would be way easier to build. Has anyone done a grid layout before?",
    createdAt: "March 3, 2026",
  },
  {
    id: "4",
    title: "How do I store a profile picture for each user?",
    authorName: "Sam",
    content:
      "My app lets users create a profile. The client wants a profile photo. Do I store the image in Firestore or somewhere else?",
    createdAt: "March 4, 2026",
  },
];

function PostList({ onOpenPost }) {
  // TODO (Tutorial 2): Change HARDCODED_POSTS to [] and load posts from Firestore inside a useEffect
  const [posts, setPosts] = useState(HARDCODED_POSTS);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!title || !content || !authorName) return;

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

    setTitle("");
    setContent("");
    setAuthorName("");
  };

  return (
    <section className="container">
      <h1 className="app-title">🐉 Class Bulletin Board</h1>

      <div className="card">
        <h2>New Post</h2>
        <form onSubmit={handleAddPost} className="form">
          <input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <button type="submit" className="btn">
            Post
          </button>
        </form>
      </div>

      <div className="post-list">
        {posts.map((post) => (
          <div
            key={post.id}
            className="card post-card"
            onClick={() => onOpenPost(post)}
          >
            <h2 className="post-title">{post.title}</h2>
            <p className="post-meta">
              {post.authorName} · {post.createdAt}
            </p>
            <p className="post-preview">{post.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PostList;
