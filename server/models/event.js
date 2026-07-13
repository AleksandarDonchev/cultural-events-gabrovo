const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["event", "announcement"],
      default: "event",
    },

    municipality: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },
    createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Event", eventSchema)