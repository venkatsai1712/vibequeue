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
        upvote: [{type: String}],
        downvote: [{type: String}],
      },
    ],
    current_playing: { type: Number, default: -1 },
  },
  { timestamps: true }
);

export default mongoose.model("Playlist_Session", model);
