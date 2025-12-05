const express = require("express");
var app=express();
const customerRoute = express.Router();
const Customer = require("./customer.model");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// Ensure image folder exists
const imageDir = path.join(__dirname, "customerimages");
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

// Static route for images
app.use("/customerimages", express.static(imageDir));

// ---------------- Multer Storage for local images ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, __dirname + "/customerimages/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// ---------------- Gmail Function ----------------
function sendGMail(mailto) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "bsmernwala@gmail.com", pass: "necc umnw wnpi bmzy" },
  });

  const mailOptions = {
    from: "bsmernwala@gmail.com",
    to: mailto,
    subject: "Registration Success",
    text: "Dear Customer, your registration is successful. Admin review is required before you can login.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Email error:", error);
    else console.log("Email sent:", info.response);
  });
}

// ---------------- Customer Registration ----------------
customerRoute.post("/register", async (req, res) => {
  try {
    const { CUserId, CEmail } = req.body;

    // Save customer
    const customer = new Customer(req.body);
    await customer.save();

    sendGMail(CEmail);
    res.json({ message: "Registration Successful" });

  } catch (err) {
    console.error(err);

    // Handle duplicate key errors
    if (err.code === 11000) {
      if (err.keyPattern.CEmail) return res.status(400).json({ message: "Email already exists" });
      if (err.keyPattern.CUserId) return res.status(400).json({ message: "User ID already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Login ----------------
customerRoute.post("/login", async (req, res) => {
  const { CUserId, CUserPass } = req.body;
  try {
    const customer = await Customer.findOne({ CUserId, CUserPass });
    if (!customer) return res.status(404).json({ message: "Invalid credentials" });
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Upload Customer Image ----------------
customerRoute.post("/savecustomerimage", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image upload failed" });
  res.json({ message: "Image uploaded successfully", imageUrl: req.file.filename });
});

// ---------------- Get Customer Image ----------------
customerRoute.get("/getimage/:cpicname", (req, res) => {
  res.sendFile(__dirname + "/customerimages/" + req.params.cpicname);
});

// ---------------- Get Customer Count ----------------
customerRoute.get("/getcustomercount", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Get Customer Details by ID ----------------
customerRoute.get("/getcustomerdetails/:cid", async (req, res) => {
  try {
    const customer = await Customer.findOne({ Cid: req.params.cid });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Get Customer List ----------------
customerRoute.get("/getcustomerlist", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Enable/Disable Customer ----------------
customerRoute.put("/customermanage/:cid/:status", async (req, res) => {
  try {
    await Customer.updateOne({ Cid: req.params.cid }, { Status: req.params.status });
    //sendGMailbyAdminCustomerActivation(req.body.CEmail);
 sendGMailbyAdminCustomerActivation(req.params.status === "Active" ? (await Customer.findOne({ Cid: req.params.cid })).CEmail : null);   
       
    res.json({ message: "Customer status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
//====================
//send mail Gmail Function on Customer Activated by Admin
//====================
function sendGMailbyAdminCustomerActivation(mailto) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "bsmernwala@gmail.com", pass: "necc umnw wnpi bmzy" },
  });

  const mailOptions = {
    from: "bsmernwala@gmail.com",
    to: mailto,
    subject: "Registration Success",
    text: "Dear Customer, your are Activated by Admin now you can Login.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Email error:", error);
    else console.log("Email sent:", info.response);
  });
}


// ---------------- Forgot Password: Send OTP ----------------
customerRoute.post("/forgotpassword/send-otp", async (req, res) => {
  const { CUserId } = req.body;
  try {
    const customer = await Customer.findOne({ CUserId });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    customer.otp = otp;
    customer.otpExpiry = otpExpiry;
    await customer.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: "bsmernwala@gmail.com", pass: "necc umnw wnpi bmzy" },
    });

    transporter.sendMail({
      from: "bsmernwala@gmail.com",
      to: customer.CEmail,
      subject: "OTP for Password Reset",
      text: `Dear ${customer.CustomerName}, your OTP is ${otp}. It expires in 10 minutes.`,
    }, (error, info) => {
      if (error) return res.status(500).json({ message: "Failed to send OTP" });
      res.json({ message: "OTP sent to email" });
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Verify OTP & Reset Password ----------------
customerRoute.post("/forgotpassword/verify-otp", async (req, res) => {
  const { CUserId, OTP, NewPassword } = req.body;
  try {
    const customer = await Customer.findOne({ CUserId });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (!customer.otp || !customer.otpExpiry)
      return res.status(400).json({ message: "No OTP found. Request again" });

    if (customer.otp !== OTP) return res.status(400).json({ message: "Invalid OTP" });
    if (customer.otpExpiry < new Date()) return res.status(400).json({ message: "OTP expired" });

    customer.CUserPass = NewPassword;
    customer.otp = undefined;
    customer.otpExpiry = undefined;
    await customer.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


customerRoute.put("/update/:cid", upload.single("CPicName"), async (req, res) => {
  try {
    const { cid } = req.params;
    console.log("Received update request for CID:", cid);
    console.log(" Body data:", req.body);
    console.log(" File data:", req.file ? req.file.filename : "No file uploaded");

    const { CEmail, CUserId } = req.body;
    const customer = await Customer.findOne({ Cid: cid });
    if (!customer) {
      console.log(" Customer not found");
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check for duplicate email
    const emailExists = await Customer.findOne({ CEmail, Cid: { $ne: cid } });
    if (emailExists) {
      console.log(" Duplicate email found:", CEmail);
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check for duplicate user ID
    const userIdExists = await Customer.findOne({ CUserId, Cid: { $ne: cid } });
    if (userIdExists) {
      console.log(" Duplicate UserID found:", CUserId);
      return res.status(400).json({ message: "User ID already exists" });
    }

    // Update data
    customer.CustomerName = req.body.CustomerName;
    customer.CAddress = req.body.CAddress;
    customer.CContact = req.body.CContact;
    customer.CEmail = CEmail;
    customer.CUserId = CUserId;
    customer.StId = req.body.StId;
    customer.CtId = req.body.CtId;

    if (req.file) customer.CPicName = req.file.filename;

    await customer.save();
    console.log(" Customer updated successfully:", customer.CustomerName);
    res.json({ message: "Profile updated successfully", customer });

  } catch (err) {
    console.error(" Error in update route:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Change Password ----------------
customerRoute.post("/changepassword", async (req, res) => {
  try {
    const { CUserId, OldPassword, NewPassword } = req.body;

    // Validate input
    if (!CUserId || !OldPassword || !NewPassword)
      return res.status(400).json({ message: "All fields are required" });

    // Find the customer
    const customer = await Customer.findOne({ CUserId });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    // Verify old password
    if (customer.CUserPass !== OldPassword)
      return res.status(400).json({ message: "Old password is incorrect" });

    // Update new password
    customer.CUserPass = NewPassword;
    await customer.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = customerRoute;
