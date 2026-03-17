import mongoose from "mongoose";

const watchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  currentTime: { type: Number, default: 0 },
}, { timestamps: true });

watchSchema.index({ userId: 1, videoId: 1 }, { unique: true });

export default mongoose.model("WatchHistory", watchSchema);







