import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [description, setDescription] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ["video/mp4", "video/mkv", "video/webm", "video/quicktime"];
    if (!allowed.includes(f.type)) {
      setError("Only MP4, MKV, WebM, or MOV files allowed.");
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      setError("File must be under 500MB.");
      return;
    }
    setError("");
    setFile(f);
    setVideoName(f.name.replace(/\.[^/.]+$/, ""));
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleSubmit = async () => {
    if (!file) return setError("Please select a video file.");
    if (!videoName.trim()) return setError("Please enter a video name.");

    setUploading(true);
    setProgress(0);
    setError("");

    const formData = new FormData();
    formData.append("video", file);
    formData.append("videoName", videoName);
    formData.append("description", description);

    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 201) {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
            setSuccess(true);
            setTimeout(() => navigate(`/watch/${data.videoId}`), 1500);
          } else {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.message || "Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));

        xhr.open("POST", "http://localhost/api/videos/upload");
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-neutral-950" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">StreamVault</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">U</div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-white text-3xl font-bold tracking-tight mb-1">Upload Video</h1>
          <p className="text-white/40 text-sm">Your video will be automatically transcoded to 360p, 480p, and 720p.</p>
        </div>

        <div className="space-y-6">
          {/* Drop Zone */}
          {!file ? (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current.click()}
              className={`relative border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                dragging
                  ? "border-orange-400 bg-orange-400/5 scale-[1.01]"
                  : "border-white/10 hover:border-white/25 hover:bg-white/2"
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${dragging ? "bg-orange-400/20" : "bg-white/5"}`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragging ? "#f97316" : "rgba(255,255,255,0.4)"} strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className={`text-base font-semibold mb-1 transition-colors ${dragging ? "text-orange-400" : "text-white/70"}`}>
                {dragging ? "Drop it here!" : "Drag & drop your video"}
              </p>
              <p className="text-white/30 text-sm">or click to browse</p>
              <p className="text-white/20 text-xs mt-3">MP4, MKV, WebM, MOV · Max 500MB</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/mkv,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            /* File Preview Card */
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
              {preview && (
                <div className="relative h-48 bg-black">
                  <video src={preview} className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button
                    onClick={() => { setFile(null); setPreview(null); setVideoName(""); }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 hover:bg-red-500/80 flex items-center justify-center text-white transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="px-4 py-3 flex items-center gap-3 border-t border-white/5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f97316">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  <p className="text-white/30 text-xs">{formatSize(file.size)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-widest font-semibold mb-2">
                Video Title *
              </label>
              <input
                type="text"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
                placeholder="Enter a title for your video"
                disabled={uploading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-400/50 focus:bg-white/8 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-widest font-semibold mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your video (optional)"
                rows={3}
                disabled={uploading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-400/50 focus:bg-white/8 transition-all resize-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-xs">
                  {success ? "Processing in background..." : "Uploading..."}
                </span>
                <span className="text-orange-400 text-xs font-bold font-mono">{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(to right, #f97316, #ef4444)",
                  }}
                />
              </div>
              {success && (
                <p className="text-green-400 text-xs flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Upload complete! Redirecting to player...
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          {!uploading && (
            <button
              onClick={handleSubmit}
              disabled={!file || !videoName.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: file && videoName.trim()
                  ? "linear-gradient(135deg, #f97316, #ef4444)"
                  : "rgba(255,255,255,0.1)",
                color: "white",
              }}
            >
              Upload & Transcode Video
            </button>
          )}
        </div>
      </div>
    </div>
  );
}