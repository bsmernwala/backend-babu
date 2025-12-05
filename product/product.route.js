const express = require('express');
const productRoute = express.Router();
const Product = require('./product.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { createInventoryForNewProduct } = require('./inventory.route.js');

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "productimages");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Save product
productRoute.post('/saveproduct', async (req, res) => {
  try {
    const product = new Product(req.body);
    console.log("product g---"+product);
    await product.save();
    // Create inventory record for new product
    await createInventoryForNewProduct(product.pid, product.vid, req.body.initialStock || 0, {
      updatedBy: product.vid, // or get from auth context
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.send('Product added successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Upload image
productRoute.post('/saveproductimage', upload.single('file'), (req, res) => {
  res.send("Upload Success");
});

// Get image
productRoute.get('/getproductimage/:picname', (req, res) => {
  const imgPath = path.join(__dirname, "productimages", req.params.picname);
  if (fs.existsSync(imgPath)) res.sendFile(imgPath);
  else res.sendFile(path.join(__dirname, "productimages", "default.png"));
});

// Show products by vendor
productRoute.get('/showproductbyvender/:vid', (req, res) => {
  Product.find({ vid: req.params.vid })
    .then((data) => res.send(data))
    .catch((err) => res.status(400).send(err.message));
});


// // --- SAVE PRODUCT ---
// productRoute.route('/saveproduct').post((req, res) => {
//   const product = new Product(req.body);
//   product.save()
//     .then(() => res.send('Product added successfully'))
//     .catch(err => res.status(400).send(err));
// });
//show product by category
//get product by category
productRoute.route
('/showproductbycatgid/:pcatgid').get(function (req, res) {
     Product.find({"pcatgid":req.params.pcatgid})
    .then(product => {
      console.log(product);
      res.send(product);
      res.end();
    })
    .catch(err => {
    res.send(err);
    });
});


// --- GET ALL PRODUCTS ---
productRoute.route('/showproduct').get((req, res) => {
  Product.find()
    .then(products => res.send(products))
    .catch(err => res.status(400).send("Data not found"));
});

// --- GET PRODUCT BY VENDOR ---
productRoute.route('/showproductbyvender/:vid').get((req, res) => {
  Product.find({ vid: req.params.vid })
    .then(products => res.send(products))
    .catch(err => res.status(400).send("Data not found"));
});

// --- GET PRODUCT COUNT / MAX PID ---
productRoute.route('/getmaxpid').get((req, res) => {
  Product.find()
    .then(products => res.send(products))
    .catch(err => res.status(400).send("Something went wrong"));
});


// // --- GET PRODUCT IMAGE ---
// productRoute.route('/getproductimage/:picname').get((req, res) => {
//   res.sendFile(__dirname + "/productimages/" + req.params.picname);
// });

// --- SOFT DELETE / UPDATE STATUS ---
productRoute.route('/updateproductstatus/:pid/:status').put((req, res) => {
  Product.updateOne({ pid: req.params.pid }, { status: req.params.status })
    .then(() => res.send('Product status updated successfully'))
    .catch(err => res.status(400).send(err));
});

// --- UPDATE PRODUCT DETAILS ---
productRoute.route('/updateproduct/:pid').put((req, res) => {
  Product.updateOne({ pid: req.params.pid }, { $set: req.body })
    .then(() => res.send('Product updated successfully'))
    .catch(err => res.status(400).send(err));
});

//get product all
productRoute.route
('/showproductstatus/:pid').get(function (req, res) {
     Product.findOne({"pid":req.params.pid})
    .then(product => {
      console.log(product);
      res.send(product);
      res.end();
    })
    .catch(err => {
    res.status(400).send
    ("Data not found something went wrong");
    });
});
module.exports = productRoute;
