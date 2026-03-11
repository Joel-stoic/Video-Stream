import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function VideoPlayer({ videoId }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    const videoSrc = `http://localhost:5000/streams/${videoId}/master.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls();

      hls.loadSource(videoSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });

      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
    }
  }, [videoId]);

  return (
    <video
      ref={videoRef}
      controls
      style={{ width: "800px" }}
    />
  );
}