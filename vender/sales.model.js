// //sales.model.js
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const SalesSchema = new Schema({
//   venderId: { type: Number, required: true },  // vid from Product
//   productId: { type: Number, required: true }, // pid from Product
//   quantity: { type: Number, required: true },
//   totalPrice: { type: Number, required: true },
//   billid:{ type: Number, required: true },
//   date: {
//       type: Date,
//       default: Date.now,
//       set: (val) => {
//         if (typeof val === "string") {
//           // Expecting "DD-MM-YYYY"
//           const [day, month, year] = val.split("-");
//           if (!day || !month || !year) return new Date(val); // fallback
//           return new Date(`${year}-${month}-${day}`);
//         }
//         return val;
//       },
//     },
//   },
// {
//   collection: "Sales"
// });
// module.exports = mongoose.model("Sales", SalesSchema);


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SalesSchema = new Schema({
  venderId: { type: Number, required: true },
  productId: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  billid: { type: Number, required: true },
  date: {
    type: Date,
    default: Date.now,
    set: (val) => {
      if (typeof val === "string") {
        const [day, month, year] = val.split("-");
        return new Date(`${year}-${month}-${day}`);
      }
      return val;
    },
  },
}, { collection: "Sales" });

module.exports = mongoose.model("Sales", SalesSchema);
