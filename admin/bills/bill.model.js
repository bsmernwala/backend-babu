//update 15/Nov/2025
var mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Bill = new Schema(
  {
    billid: { type: Number },
    billdate: { type: String },
    cid: { type: Number },
    pid: { type: Number },
    qty: { type: Number },

    status: {
      type: String,
      enum: [
        "Processing",
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
      ],
      default: "Processing"
    },

    //  NEW FIELDS
    updatedBy: { type: String, default: "System" },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    collection: "Bill"
  }
);
module.exports = mongoose.model("Bill", Bill);
