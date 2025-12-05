// // routes/saleRoutes.js
// const express = require("express");
// const Sale = require("./sales.model.js");
// const router = express.Router();
// const Product = require('../product/product.model.js');

// // Add Sale
// router.post("/add", async (req, res) => {
//   console.log("sales fun called")
//   try {
//     const { venderId, productId, quantity, totalPrice,billid,date } = req.body;
//     const sale = new Sale({ venderId, productId, quantity, totalPrice,billid,date });
//     await sale.save();
//     res.json(sale);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//     console.log(err);
//   }
// });

// // Get Sales per Vendor (with product info + totals)
// router.get("/vender/:venderId", async (req, res) => {
//  // console.log("Sales Vender Id " + req.params.venderId);

//   try {
//     const sales = await Sale.find({ venderId: req.params.venderId }).sort({ date: -1 });

//     // collect product IDs
//     const productIds = sales.map((s) => s.productId);
//     const products = await Product.find({ pid: { $in: productIds } });

//     // merge sales with product info
//     const salesWithProducts = sales.map((sale) => {
//       const product = products.find((p) => p.pid === sale.productId);
//       return {
//         ...sale._doc,
//         product: product
//           ? { pname: product.pname, oprice: product.oprice, pprice: product.pprice }
//           : null,
//       };
//     });

//     // --- GRAND TOTAL ---
//     const grandTotal = salesWithProducts.reduce((sum, s) => sum + (s.totalPrice || 0), 0);

//     // --- PER PRODUCT TOTALS ---
//     const productTotals = {};
//     salesWithProducts.forEach((s) => {
//       const pname = s.product?.pname || "Unknown";
//       if (!productTotals[pname]) {
//         productTotals[pname] = { qty: 0, revenue: 0 };
//       }
//       productTotals[pname].qty += s.quantity;
//       productTotals[pname].revenue += s.totalPrice;
//     });

//     // final response
//     res.json({
//       sales: salesWithProducts,
//       grandTotal,
//       productTotals,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// module.exports = router;


const express = require("express");
const router = express.Router();
const Sale = require("./sales.model");
const Product = require("../product/product.model");

// Add Sale
router.post("/add", async (req, res) => {
  try {
    const sale = new Sale(req.body);
    console.log("sale call"+sale)
    await sale.save();
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sales by vendor (join product info)
router.get("/vender/:venderId", async (req, res) => {
  try {
    const sales = await Sale.find({ venderId: req.params.venderId }).sort({ date: -1 });
    const productIds = sales.map(s => s.productId);
    const products = await Product.find({ pid: { $in: productIds } });

    const salesWithProducts = sales.map(sale => {
      const product = products.find(p => p.pid === sale.productId);
      return {
        ...sale._doc,
        product: product ? {
          pname: product.pname,
          oprice: product.oprice,
          pprice: product.pprice,
          ppicname: product.ppicname
        } : null
      };
    });

    res.json({ sales: salesWithProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
