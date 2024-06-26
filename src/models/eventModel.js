const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    date: { type: Date },
    time: { type: Date },
    description: { type: String },
    duration: { type: String },
    venue: { type: String },
    guest: { type: String },
    doc: { type: String },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;


