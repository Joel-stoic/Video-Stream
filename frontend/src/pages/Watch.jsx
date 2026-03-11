import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import VideoPlayer from "../components/VideoPlayer";


export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/videos/getVideos", {
          credentials: "include", // sends auth cookie
        });
        const data = await res.json();
        if (data.videos) {
          setVideos(data.videos);
          const current = data.videos.find((v) => v._id === id);
          setCurrentVideo(current || data.videos[0]);
        }
      } catch (err) {
        console.error("Failed to fetch videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [id]);

  const handleVideoClick = (video) => {
    navigate(`/watch/${video._id}`);
    setCurrentVideo(video);
  };
  const onClickUpload=()=>{
    navigate('/upload')
  }
  const upNext = videos.filter((v) => v._id !== id);

  return (
    <div className="min-h-screen bg-neutral-950" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">StreamVault</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-white/50 hover:text-white text-sm transition-colors" onClick={onClickUpload} >Upload</button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">U</div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Player Column */}
          <div className="lg:col-span-2 space-y-4">
            {currentVideo ? (
              <>
                <VideoPlayer videoId={currentVideo._id} title={currentVideo.title} />

                {/* Video Info */}
                <div className="space-y-3">
                  <h1 className="text-white text-xl font-bold tracking-tight">{currentVideo.title}</h1>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {currentVideo.title?.[0]?.toUpperCase() || "V"}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">Uploaded Video</p>
                        <p className="text-white/40 text-xs capitalize">{currentVideo.status}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/8 hover:bg-white/15 text-white/70 hover:text-white transition-all border border-white/10">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                        Like
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/8 hover:bg-white/15 text-white/70 hover:text-white transition-all border border-white/10">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {currentVideo.description && (
                    <div className="rounded-xl p-4 text-sm text-white/50 leading-relaxed border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p>{currentVideo.description}</p>
                    </div>
                  )}
                </div>
              </>
            ) : loading ? (
              <div className="aspect-video bg-neutral-900 rounded-2xl flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <div className="aspect-video bg-neutral-900 rounded-2xl flex items-center justify-center">
                <p className="text-white/40">Video not found</p>
              </div>
            )}
          </div>

          {/* Sidebar — Up Next */}
          <div className="space-y-4">
            <h3 className="text-white/50 text-xs uppercase tracking-widest font-semibold">Up Next</h3>

            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-32 h-20 rounded-lg bg-neutral-800 flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-neutral-800 rounded w-full" />
                    <div className="h-3 bg-neutral-800 rounded w-2/3" />
                  </div>
                </div>
              ))
            ) : upNext.length === 0 ? (
              <p className="text-white/20 text-sm">No other videos</p>
            ) : (
              upNext.map((v, i) => (
                <div
                  key={v._id}
                  onClick={() => handleVideoClick(v)}
                  className="flex gap-3 group cursor-pointer"
                >
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-800">
                    <div
                      className="w-full h-full"
                      style={{ background: `linear-gradient(135deg, hsl(${i * 60 + 200},50%,15%), hsl(${i * 60 + 240},50%,8%))` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute top-1 right-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${v.status === "completed" ? "bg-green-500/80 text-white" : "bg-yellow-500/80 text-black"}`}>
                        {v.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium leading-snug group-hover:text-white transition-colors line-clamp-2">
                      {v.title}
                    </p>
                    {v.description && (
                      <p className="text-white/30 text-xs mt-1 line-clamp-1">{v.description}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}