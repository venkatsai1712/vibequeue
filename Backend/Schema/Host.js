import mongoose from "mongoose";
const model = new mongoose.Schema(
  {
    name: String,
    email: String,
  },
  { timestamps: true }
);

export default mongoose.model("Host", model);
