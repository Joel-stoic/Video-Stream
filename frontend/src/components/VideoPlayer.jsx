import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";

export default function VideoPlayer({ videoId, title = "Untitled Video" }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);
  const hideControlsTimer = useRef(null);

  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const videoSrc = `http://localhost:5000/streams/${videoId}/master.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(videoSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(data.levels.map((level, index) => ({
          index, label: `${level.height}p`, bitrate: level.bitrate,
        })));
        setIsLoading(false);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => setCurrentLevel(data.level));
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    const video = videoRef.current;
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0 && video.duration)
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
    };
    const onDurationChange = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => { setVolume(video.volume); setIsMuted(video.muted); };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
    };
  }, []);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleQualityChange = (levelIndex) => {
    if (hlsRef.current) { hlsRef.current.currentLevel = levelIndex; setCurrentLevel(levelIndex); }
    setShowQualityMenu(false);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (v.paused) v.play(); else v.pause();
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    videoRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const handleProgressHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHoverTime(ratio * duration);
    setHoverX(e.clientX - rect.left);
  };

  const toggleMute = () => { videoRef.current.muted = !videoRef.current.muted; };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    videoRef.current.volume = v;
    videoRef.current.muted = v === 0;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = (secs) => {
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + secs));
  };

  const formatTime = (s) => {
    if (isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const currentQualityLabel = currentLevel === -1 ? "Auto" : levels[currentLevel]?.label ?? "Auto";

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => setShowControls(false)}
      onClick={() => setShowQualityMenu(false)}
      className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl"
      style={{ cursor: showControls ? "default" : "none", aspectRatio: "16/9" }}
    >
      {/* Video */}
      <video ref={videoRef} onClick={togglePlay} className="w-full h-full object-contain" />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Top gradient + title */}
      <div
        className={`absolute top-0 left-0 right-0 px-5 pt-4 pb-12 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
      >
        <p className="text-white/90 text-sm font-medium tracking-wide truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {title}
        </p>
      </div>

      {/* Center play/pause flash */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          key={isPlaying ? "play" : "pause"}
          className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center opacity-0"
          style={{ animation: "flashIcon 0.4s ease-out forwards" }}
        >
          {isPlaying ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-4 pb-4 pt-16 transition-opacity duration-300 ${showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)" }}
      >
        {/* Progress Bar */}
        <div
          onClick={handleSeek}
          onMouseMove={handleProgressHover}
          onMouseLeave={() => setHoverTime(null)}
          className="relative h-1 rounded-full cursor-pointer mb-4 group"
          style={{ background: "rgba(255,255,255,0.2)" }}
        >
          {/* Buffered */}
          <div className="absolute left-0 top-0 h-full rounded-full transition-all" style={{ width: `${buffered}%`, background: "rgba(255,255,255,0.3)" }} />
          {/* Played */}
          <div className="absolute left-0 top-0 h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, background: "linear-gradient(to right, #f97316, #ef4444)" }}>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg scale-0 group-hover:scale-100 transition-transform" style={{ boxShadow: "0 0 8px rgba(249,115,22,0.8)" }} />
          </div>
          {/* Hover time tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-8 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none -translate-x-1/2"
              style={{ left: hoverX, fontFamily: "monospace" }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
          {/* Taller hit area */}
          <div className="absolute -top-2 -bottom-2 left-0 right-0" />
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform p-1.5 rounded-lg hover:bg-white/10">
            {isPlaying ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1.5" /><rect x="14" y="4" width="4" height="16" rx="1.5" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          {/* Skip back */}
          <button onClick={() => skip(-10)} className="text-white/80 hover:text-white hover:scale-110 transition-all p-1.5 rounded-lg hover:bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 17l-5-5 5-5" /><path d="M19 17l-5-5 5-5" />
            </svg>
          </button>

          {/* Skip forward */}
          <button onClick={() => skip(10)} className="text-white/80 hover:text-white hover:scale-110 transition-all p-1.5 rounded-lg hover:bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 17l5-5-5-5" /><path d="M5 17l5-5-5-5" />
            </svg>
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 group/vol">
            <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
              {isMuted || volume === 0 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" opacity="0.5" />
                  <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" />
                  <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : volume < 0.5 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              )}
            </button>
            <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
              <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="w-20 h-1 accent-orange-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Time */}
          <span className="text-white/70 text-xs ml-1" style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
            <span className="text-white">{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Quality Selector */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowQualityMenu(v => !v); }}
              className="flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 hover:border-orange-400/60 hover:bg-orange-400/10 transition-all"
              style={{ fontFamily: "monospace" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
              {currentQualityLabel}
            </button>

            {showQualityMenu && (
              <div
                onClick={e => e.stopPropagation()}
                className="absolute bottom-12 right-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 min-w-40"
                style={{ background: "rgba(10,10,15,0.97)", backdropFilter: "blur(20px)" }}
              >
                <div className="px-4 py-2.5 border-b border-white/10">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Quality</p>
                </div>
                {[{ index: -1, label: "Auto", sub: "Adaptive" }, ...levels.slice().reverse().map(l => ({ ...l, sub: `${Math.round(l.bitrate / 1000)}kbps` }))].map((level) => {
                  const active = currentLevel === level.index;
                  return (
                    <button key={level.index} onClick={() => handleQualityChange(level.index)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all ${active ? "bg-orange-500/20 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                    >
                      <div className="flex flex-col items-start">
                        <span className={`font-bold ${active ? "text-orange-400" : ""}`}>{level.label}</span>
                        <span className="text-xs text-white/30">{level.sub}</span>
                      </div>
                      {active && (
                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="text-white/80 hover:text-white hover:scale-110 transition-all p-1.5 rounded-lg hover:bg-white/10">
            {isFullscreen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes flashIcon {
          0% { opacity: 0.8; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}