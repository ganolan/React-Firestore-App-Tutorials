import { useState } from "react";
import PostList from "./components/PostList";
import PostDetail from "./components/PostDetail";
import "./App.css";

function App() {
  const [view, setView] = useState("list");
  const [selectedPost, setSelectedPost] = useState(null);

  const openPost = (post) => {
    setSelectedPost(post);
    setView("detail");
  };

  const goBack = () => {
    setSelectedPost(null);
    setView("list");
  };

  return (
    <div className="app">
      {view === "list" && <PostList onOpenPost={openPost} />}
      {view === "detail" && <PostDetail post={selectedPost} onBack={goBack} />}
    </div>
  );
}

export default App;
