import VideoPlayer from "../components/VideoPlayer";

export default function Watch() {

  const videoId = "69af12e3fc93c77332f967c2"; // replace with your real videoId

  return (
    <div>
      <h2>Watch Video</h2>

      <VideoPlayer videoId={videoId} />

    </div>
  );
}