import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("http://localhost/api/videos/getVideos", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.videos) setVideos(data.videos);
      } catch (err) {
        console.error("Failed to fetch videos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  const gradients = [
    "linear-gradient(135deg,#1a1a2e,#16213e)",
    "linear-gradient(135deg,#1a0a00,#2d1500)",
    "linear-gradient(135deg,#0a1a0a,#0d2b0d)",
    "linear-gradient(135deg,#1a001a,#2b002b)",
    "linear-gradient(135deg,#001a1a,#002b2b)",
    "linear-gradient(135deg,#1a1a00,#2b2b00)",
  ];

  return (
    <div
      className="min-h-screen bg-neutral-950"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      {/* Navbar */}
      <nav
        className="sticky top-0 z-20 flex items-center gap-4 px-6 py-3 border-b border-white/5"
        style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(16px)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          onClick={() => navigate("/")}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
          <span className="text-white font-bold text-base tracking-tight">StreamVault</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Upload
          </button>
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            title="Logout"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Section heading */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-lg">
              {search ? `Results for "${search}"` : "All Videos"}
            </h2>
            <span className="text-white/30 text-sm">{filtered.length} video{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-xl h-44 bg-neutral-800 mb-3" />
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 bg-neutral-800 rounded w-full" />
                    <div className="h-3 bg-neutral-800 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="4" />
                <polygon points="10,8 16,12 10,16" fill="rgba(255,255,255,0.15)" stroke="none" />
              </svg>
            </div>
            <p className="text-white/40 font-semibold">
              {search ? "No videos found" : "No videos yet"}
            </p>
            <p className="text-white/20 text-sm mt-1">
              {search ? "Try a different search term" : "Be the first to upload!"}
            </p>
            {!search && (
              <button
                onClick={() => navigate("/upload")}
                className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
              >
                Upload Video
              </button>
            )}
          </div>
        )}

        {/* Video Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((video, i) => {
              const isReady = video.status === "completed";
              return (
                <div
                  key={video._id}
                  onClick={() => isReady && navigate(`/watch/${video._id}`)}
                  className={`group transition-all duration-200 ${isReady ? "cursor-pointer" : "cursor-default opacity-60"}`}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative rounded-xl overflow-hidden mb-3"
                    style={{
                      aspectRatio: "16/9",
                      background: gradients[i % gradients.length],
                    }}
                  >
                    {/* Play overlay */}
                    {isReady && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(0,0,0,0.3)" }}>
                        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Processing indicator */}
                    {!isReady && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full border-t-white border-white/20 animate-spin"
                          style={{ borderWidth: "2.5px" }}
                        />
                        <span className="text-white/40 text-xs">Processing</span>
                      </div>
                    )}

                    {/* Duration placeholder */}
                    {isReady && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                        HLS
                      </div>
                    )}
                  </div>

                  {/* Video info — YouTube style */}
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: `hsl(${(i * 47) % 360}, 60%, 35%)` }}
                    >
                      {video.title?.[0]?.toUpperCase() || "V"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 group-hover:text-white/80 transition-colors">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-white/35 text-xs mt-0.5 line-clamp-1">{video.description}</p>
                      )}
                      <p className="text-white/25 text-xs mt-1">
                        {new Date(video.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}