import mongoose from "mongoose";
import { nanoid } from "nanoid";
const model = new mongoose.Schema(
  {
    name: { type: String, required: true },
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      required: true,
      unique: true,
    },
    session_id: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(8),
    },
    songs_queue: [
      {
        id: String,
        data: Object,
        upvote: { type: Number, default: 0 },
        downvote: { type: Number, default: 0 },
        playing: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Playlist_Session", model);
