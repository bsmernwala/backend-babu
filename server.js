// // const express = require('express');
// // const app = express();

// //  require('dotenv').config(); // <---- ADD THIS

// // const bodyParser = require('body-parser');
// // const PORT = 9191;
// // const cors = require('cors');
// // const mongoose = require('mongoose');
// // const config = require('./DB.js');
// // const stateRoute = require('./admin/state.route.js');
// // const cityRoute = require('./admin/city.route.js');
// // const productCatgRoute = require('./admin/productcatg.route.js');
// // const productRoute =require("./product/product.route.js");
// // const customerRoute =require("./customer/customer.route.js");
// //  const paymentRoute =require("./payment.js");
// // const venderRoute=require("./vender/vender.route.js");
// //  const billRoute=require("./admin/bills/bill.route.js");
// //  const paymentdetailsRoute=require("./admin/bills/paymentdetails.route.js"); 
// //  const emailRoute =require("./emailmgt.js");
// //  const emailactivationRoute =require("./emailactivation.js");
// // const saleRoute = require("./vender/sales.route.js");
// // const inventoryRoute = require('./product/inventory.route.js');
// // const path = require("path"); 

// // app.use(cors()); 
// // app.use(bodyParser.urlencoded({extended: true}));
// // app.use(bodyParser.json());
// // app.use('/state', stateRoute);
// // app.use('/city', cityRoute);
// // app.use('/productcatg', productCatgRoute);
// // app.use("/product",productRoute);
// // app.use("/customer",customerRoute);
// // app.use("/payment",paymentRoute);
// //  app.use("/vender",venderRoute);
// //  app.use("/bill",billRoute);
// // app.use("/paymentdetails",paymentdetailsRoute);
// // app.use("/email",emailRoute);
// // app.use("/emailactivation",emailactivationRoute);
// // app.use("/sales", saleRoute);
// // app.use("/inventory", inventoryRoute);
// // app.use("/productimages", express.static(path.join(__dirname, "product/productimages")));

// // // mongoose.connect(config.URL).then(() => {      
// // //       console.log('Database is connected '+config.URL) },
// // //     err => { console.log('Can not connect to the database'+ err)}
// // //   );
  
// // //   app.listen(PORT, function(){
// // //     console.log('Server is running on Port:',PORT);
// // //   });

// // let isconnected = false;

// // async function connectToMongoDB() {

// //   try {
// //     await mongoose.connect(process.env.MONGODB_URL, {
// //   dbName: 'ecommerceDB', // forces this DB
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true
// // });

// //     isconnected = true;
// //     console.log('Connected to MongoDB');
// //   } catch (error) {
// //     console.error('Error connecting to MongoDB:', error);
// //   }
    
// // }

// // app.use(async (req, res, next) => {
// //   if (!isconnected) {
// //     await connectToMongoDB();
// //   }
// //   next();
// // }); 

// // module.exports = app;


// //server.js for vercel deployment
// // server.js (for Vercel)
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

// app.use(cors());
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


// server.js (Vercel-ready)
// Exports the Express `app` for Vercel serverless runtime.
// Uses a cached MongoDB connection pattern to avoid reconnect storms.

require('dotenv').config(); // safe on Vercel (no-op if no .env)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ------------------ Routes (require your route files) ------------------
const stateRoute = require('./admin/state.route.js');
const cityRoute = require('./admin/city.route.js');
const productCatgRoute = require('./admin/productcatg.route.js');
const productRoute = require('./product/product.route.js');
const customerRoute = require('./customer/customer.route.js');
const paymentRoute = require('./payment.js');
const venderRoute = require('./vender/vender.route.js');
const billRoute = require('./admin/bills/bill.route.js');
const paymentdetailsRoute = require('./admin/bills/paymentdetails.route.js');
const emailRoute = require('./emailmgt.js');
const emailactivationRoute = require('./emailactivation.js');
const saleRoute = require('./vender/sales.route.js');
const inventoryRoute = require('./product/inventory.route.js');

app.use('/state', stateRoute);
app.use('/city', cityRoute);
app.use('/productcatg', productCatgRoute);
app.use('/product', productRoute);
app.use('/customer', customerRoute);
app.use('/payment', paymentRoute);
app.use('/vender', venderRoute);
app.use('/bill', billRoute);
app.use('/paymentdetails', paymentdetailsRoute);
app.use('/email', emailRoute);
app.use('/emailactivation', emailactivationRoute);
app.use('/sales', saleRoute);
app.use('/inventory', inventoryRoute);
app.use('/productimages', express.static(path.join(__dirname, 'product/productimages')));

// ------------------ MongoDB cached connection (vital for serverless) ------------------
// This caches connection/promise on `global` so serverless instances reuse it.
const mongoEnv = process.env.MONGODB_URL || process.env.MONGODB_URI;
const defaultDbName = process.env.MONGODB_DBNAME || 'ecommerceDB';

const mask = s => {
  if (!s) return 'undefined';
  return s.replace(/(:\/\/.+?:).+?(@)/, '$1<<PASS>>$2');
};
console.log('MONGO env (masked):', mask(mongoEnv));

if (!mongoEnv) {
  console.error('ERROR: No MongoDB env var found. Set MONGODB_URL or MONGODB_URI in Vercel or .env');
}

if (!global._mongo) global._mongo = { conn: null, promise: null };

async function connectDB() {
  if (global._mongo.conn) return global._mongo.conn;

  if (!global._mongo.promise) {
    global._mongo.promise = mongoose
      .connect(mongoEnv, {
        dbName: defaultDbName,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((m) => {
        console.log('MongoDB connected (serverless):', m.connection.name);
        return m;
      })
      .catch((err) => {
        // clear promise so future attempts can retry
        global._mongo.promise = null;
        console.error('Mongo connect error:', err && err.message ? err.message : err);
        throw err;
      });
  }

  global._mongo.conn = await global._mongo.promise;
  return global._mongo.conn;
}

// Middleware: ensure DB connected before handling requests
app.use(async (req, res, next) => {
  try {
    if (!mongoEnv) return next();
    await connectDB();
  } catch (e) {
    console.error('DB connection failed:', e && e.message ? e.message : e);
    // continue to route handlers which should handle missing DB gracefully
  }
  next();
});

// Export the app for Vercel
module.exports = app;

// ------------------ Optional: server-local.js content (for local dev) ------------------
// Create a separate file `server-local.js` with the following minimal content to run locally:

/*
// server-local.js
require('dotenv').config();
const app = require('./server'); // or './server.js' if you named it server.js
const PORT = process.env.PORT || 9191;
app.listen(PORT, () => console.log('Local server running on port', PORT));
*/

// ------------------ Usage notes ------------------
// 1) On Vercel: set environment variable MONGODB_URL (or MONGODB_URI) to your Atlas URI.
//    Optionally set MONGODB_DBNAME if you don't want to rely on the URI's path.
// 2) Redeploy the Vercel project after adding/updating env vars.
// 3) For local development, create server-local.js (see block above) and run:
//      node server-local.js
// 4) If you previously leaked credentials, rotate the Atlas user's password immediately.
// 5) Check Vercel Function Logs for the masked MONGO env line and the 'MongoDB connected' message.
