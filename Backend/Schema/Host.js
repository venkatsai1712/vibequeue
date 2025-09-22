import mongoose from "mongoose";
const model = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    playlist_session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist_Session",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Host", model);
