const express = require('express');
const app = express();

 require('dotenv').config(); // <---- ADD THIS

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
    await mongoose.connect(process.env.MONGODB_URL, {
  dbName: 'ecommerceDB', // forces this DB
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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


//server.js for vercel deployment
// server.js (for Vercel)

// const cors = require('cors');

// // allow only your local dev origin
// app.use(cors({
//   origin: 'http://localhost:3000',
//   methods: ['GET','POST','PUT','DELETE','OPTIONS'],
//   allowedHeaders: ['Content-Type','Authorization'],
//   credentials: true // set true only if you need cookies/auth
// }));

// // If you want to allow any origin (dev/test only), use:
// // app.use(cors());

// require('dotenv').config(); // safe to call on Vercel, it will no-op if no .env

// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const path = require('path');

// // routes
// const stateRoute = require('./admin/state.route.js');
// const cityRoute = require('./admin/city.route.js');
// const productCatgRoute = require('./admin/productcatg.route.js');
// const productRoute = require('./product/product.route.js');
// const customerRoute = require('./customer/customer.route.js');
// const paymentRoute = require('./payment.js');
// const venderRoute = require('./vender/vender.route.js');
// const billRoute = require('./admin/bills/bill.route.js');
// const paymentdetailsRoute = require('./admin/bills/paymentdetails.route.js'); 
// const emailRoute = require('./emailmgt.js');
// const emailactivationRoute = require('./emailactivation.js');
// const saleRoute = require('./vender/sales.route.js');
// const inventoryRoute = require('./product/inventory.route.js');

// //app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// app.use('/state', stateRoute);
// app.use('/city', cityRoute);
// app.use('/productcatg', productCatgRoute);
// app.use('/product', productRoute);
// app.use('/customer', customerRoute);
// app.use('/payment', paymentRoute);
// app.use('/vender', venderRoute);
// app.use('/bill', billRoute);
// app.use('/paymentdetails', paymentdetailsRoute);
// app.use('/email', emailRoute);
// app.use('/emailactivation', emailactivationRoute);
// app.use('/sales', saleRoute);
// app.use('/inventory', inventoryRoute);
// app.use('/productimages', express.static(path.join(__dirname, 'product/productimages')));

// // --------- Mongo connection helper (serverless-friendly) ---------
// const mongoEnv = process.env.MONGODB_URL || process.env.MONGODB_URI;

// const mask = s => {
//   if (!s) return 'undefined';
//   return s.replace(/(:\/\/.+?:).+?(@)/, '$1<<PASS>>$2');
// };
// console.log('MONGO env (masked):', mask(mongoEnv));

// if (!mongoEnv) {
//   console.error('ERROR: No MongoDB env var found. Set MONGODB_URL or MONGODB_URI in Vercel or .env');
//   // we don't crash here because Vercel might call the function — still better to surface error.
// }

// async function connectIfNeeded() {
//   // mongoose.readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
//   if (mongoose.connection.readyState === 1) {
//     // already connected
//     return;
//   }
//   if (mongoose.connection.readyState === 2) {
//     // currently connecting
//     // wait until connected (simple polling)
//     let waited = 0;
//     while (mongoose.connection.readyState !== 1 && waited < 10000) {
//       // small sleep
//       // eslint-disable-next-line no-await-in-loop
//       await new Promise(r => setTimeout(r, 200));
//       waited += 200;
//     }
//     return;
//   }

//   try {
//     await mongoose.connect(mongoEnv, {
//       dbName: process.env.MONGODB_DBNAME || 'ecommerceDB', // override with env if needed
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('Connected to MongoDB:', mongoose.connection.name);
//   } catch (err) {
//     console.error('Mongo connection error:', err && err.message ? err.message : err);
//     // don't throw here — let routes decide how to handle a missing DB connection
//   }
// }

// // Middleware that ensures connection is ready before handling requests
// app.use(async (req, res, next) => {
//   try {
//     await connectIfNeeded();
//   } catch (e) {
//     console.error('connectIfNeeded error:', e);
//   }
//   next();
// });

// module.exports = app;
