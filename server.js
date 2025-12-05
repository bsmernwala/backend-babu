const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const PORT = 9191;
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./DB.js');
const stateRoute = require('./admin/state.route.js');
const cityRoute = require('./admin/city.route.js');
const productCatgRoute = require('./admin/productcatg.route.js');
const productRoute =require("./product/product.route.js");
const customerRoute =require("./customer/customer.route.js");
 const paymentRoute =require("./payment.js");
const venderRoute=require("./vender/vender.route.js");
 const billRoute=require("./admin/bills/bill.route.js");
 const paymentdetailsRoute=require("./admin/bills/paymentdetails.route.js"); 
 const emailRoute =require("./emailmgt.js");
 const emailactivationRoute =require("./emailactivation.js");
const saleRoute = require("./vender/sales.route.js");
const inventoryRoute = require('./product/inventory.route.js');
const path = require("path"); 

app.use(cors()); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/state', stateRoute);
app.use('/city', cityRoute);
app.use('/productcatg', productCatgRoute);
app.use("/product",productRoute);
app.use("/customer",customerRoute);
app.use("/payment",paymentRoute);
 app.use("/vender",venderRoute);
 app.use("/bill",billRoute);
app.use("/paymentdetails",paymentdetailsRoute);
app.use("/email",emailRoute);
app.use("/emailactivation",emailactivationRoute);
app.use("/sales", saleRoute);
app.use("/inventory", inventoryRoute);
app.use("/productimages", express.static(path.join(__dirname, "product/productimages")));

 require('dotenv').config(); // <---- ADD THIS

// mongoose.connect(config.URL).then(() => {      
//       console.log('Database is connected '+config.URL) },
//     err => { console.log('Can not connect to the database'+ err)}
//   );
  
//   app.listen(PORT, function(){
//     console.log('Server is running on Port:',PORT);
//   });

let isconnected = false;

async function connectToMongoDB() {

  try {
    await mongoose.connect(config.URL, { useNewUrlParser: true, useUnifiedTopology: true } );
    isconnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
    
}

app.use(async (req, res, next) => {
  if (!isconnected) {
    await connectToMongoDB();
  }
  next();
}); 

module.exports = app;
