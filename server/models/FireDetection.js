const mongoose = require("mongoose");

const fireDetectionSchema = new mongoose.Schema(
  {
    // ==========================================
    // EXISTING FIRMS FIELDS
    // ==========================================

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    brightness: {
      type: Number,
      default: null,
    },

    bright_t31: {
      type: Number,
      default: null,
    },

    frp: {
      type: Number,
      default: null,
    },

    scan: {
      type: Number,
      default: null,
    },

    track: {
      type: Number,
      default: null,
    },

    daynight: {
      type: String,
      default: null,
    },


    // ==========================================
    // ML PREDICTION FIELDS
    // ==========================================

    prediction: {
      type: Number,
      enum: [0, 1],
      default: null,
    },

    prediction_probability: {
      type: Number,
      default: null,
    },

    prediction_label: {
      type: String,
      default: null,
    },

    risk_level: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: null,
    },

    predicted_at: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "FireDetection",
  fireDetectionSchema
);