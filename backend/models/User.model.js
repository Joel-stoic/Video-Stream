import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    isActive:{
      type:Boolean,
      default:true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const User = mongoose.model("User", userSchema)
export default User
