import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    profilePicture : {
        type : String, 
        default : "default.png"
    },
    password: {
      type: String,
      required: true,
    },
    remainingBudget : {
      type : Number,
      default : 0
    },
    totalBudget : {
      type : Number,
      default : 0
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
