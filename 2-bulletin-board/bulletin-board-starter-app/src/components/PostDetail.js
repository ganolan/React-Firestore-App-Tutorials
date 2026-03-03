import { useState } from "react";

// Hardcoded comments — will be replaced with Firestore data in Tutorial 3
const HARDCODED_COMMENTS = {
  "1": [
    {
      id: "c1",
      text: "This is so cool, thanks Mr. Nolan!",
      authorName: "Sam",
      createdAt: "March 1, 2026",
    },
    {
      id: "c2",
      text: "Will this replace Google Classroom? 😂",
      authorName: "Riley",
      createdAt: "March 1, 2026",
    },
    {
      id: "c3",
      text: "Can we post memes here?",
      authorName: "Casey",
      createdAt: "March 1, 2026",
    },
  ],
  "2": [
    {
      id: "c4",
      text: "Maybe add a hero banner at the top with your app name?",
      authorName: "Jordan",
      createdAt: "March 2, 2026",
    },
    {
      id: "c5",
      text: "I had the same feedback! I added some icons and it helped a lot.",
      authorName: "Taylor",
      createdAt: "March 2, 2026",
    },
  ],
  "3": [
    {
      id: "c6",
      text: "Grid looks better but yeah, list is easier. Go list first and upgrade later.",
      authorName: "Alex",
      createdAt: "March 3, 2026",
    },
  ],
  "4": [],
};

function PostDetail({ post, onBack }) {
  // TODO (Tutorial 3): Change the initial state to [] and load comments from Firestore inside a useEffect
  // The query should filter for comments where postId == post.id
  const [comments, setComments] = useState(HARDCODED_COMMENTS[post.id] || []);

  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!text || !authorName) return;

    // TODO (Tutorial 3): Replace the lines below with addDoc to save the comment to the "comments" collection in Firestore
    // Important: the document must include postId: post.id so we can find this comment later
    const newComment = {
      id: Date.now().toString(),
      text,
      authorName,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };
    setComments([...comments, newComment]);
    // TODO (Tutorial 3): After addDoc, call fetchComments() instead of updating state directly

    setText("");
    setAuthorName("");
  };

  return (
    <section className="container">
      <button className="btn btn-back" onClick={onBack}>
        ← Back
      </button>

      <div className="card">
        <h1 className="post-title">{post.title}</h1>
        <p className="post-meta">
          {post.authorName} · {post.createdAt}
        </p>
        <p className="post-content">{post.content}</p>
      </div>

      <div className="comments-section">
        <h2>Comments ({comments.length})</h2>

        {comments.length === 0 && (
          <p className="empty-state">No comments yet. Be the first!</p>
        )}

        {comments.map((c) => (
          <div key={c.id} className="card">
            <p className="comment-text">{c.text}</p>
            <p className="post-meta">
              {c.authorName} · {c.createdAt}
            </p>
          </div>
        ))}

        <div className="card">
          <h3>Add a Comment</h3>
          <form onSubmit={handleAddComment} className="form">
            <input
              type="text"
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
            <textarea
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
            />
            <button type="submit" className="btn">
              Comment
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default PostDetail;
