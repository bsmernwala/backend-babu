const express = require("express");
const venderRoute = express.Router();
const Vender = require("./vender.model");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");

// Multer storage for profile images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, __dirname + "/venderimages/"),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

venderRoute.post('/savevenderimage', upload.single('file'), (req, res) =>{
    res.json({})
  })
// ===================
// Vendor Registration
// ===================
venderRoute.post("/register", async (req, res) => {
    try {
        const exists = await Vender.findOne({ $or: [{ VUserId: req.body.VUserId }, { VEmail: req.body.VEmail }] });
        if (exists) return res.status(400).send("VUserId or VEmail already exists");

        const maxVidDoc = await Vender.findOne().sort({ Vid: -1 });
        const newVid = maxVidDoc ? maxVidDoc.Vid + 1 : 1;

        const vender = new Vender({ ...req.body, Vid: newVid });
        await vender.save();
        sendGMail(req.body.VEmail);
        res.send("Registration Successful");
    } catch (err) {
        console.error(err);
        res.status(400).send("Registration Failed");
    }
});
//====================
//send mail Gmail Function on Successful Registration
//====================
function sendGMail(mailto) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "bsmernwala@gmail.com", pass: "necc umnw wnpi bmzy" },
  });

  const mailOptions = {
    from: "bsmernwala@gmail.com",
    to: mailto,
    subject: "Registration Success",
    text: "Dear Vender, your registration is successfull. Admin review is required before you can login.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Email error:", error);
    else console.log("Email sent:", info.response);
  });
}


// ===================
// Login
// ===================
venderRoute.post("/login", async (req, res) => {
    const { vuid, vupass } = req.body;
    
    try {
        const vendor = await Vender.findOne({ VUserId: vuid, VUserPass: vupass });
        if (!vendor) return res.status(404).send("Invalid credentials");
        res.send(vendor);
    } catch (err) {
        res.status(500).send("Something went wrong");
    }
});

// ===================
// Get All Vendors
// ===================
venderRoute.get("/getvendercount", async (req, res) => {
    try {
        const vendors = await Vender.find();
        res.send(vendors);
    } catch (err) {
        res.status(500).send("Something went wrong");
    }
});

// ===================
// Toggle Vendor Status
// ===================
venderRoute.put("/vendermanage/:vid/:status", async (req, res) => {
    try {
        await Vender.updateOne({ Vid: req.params.vid }, { Status: req.params.status });
        sendGMailbyAdminVenderActivation(req.params.status === "Active" ? (await Vender.findOne({ Vid: req.params.vid })).VEmail : null);   
        
        res.send("Vender Status Updated successfully");
    } catch (err) {
        res.status(500).send(err);
    }
});

//====================
//send mail Gmail Function on Vender Activated by Admin
//====================
function sendGMailbyAdminVenderActivation(mailto) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "bsmernwala@gmail.com", pass: "necc umnw wnpi bmzy" },
  });

  const mailOptions = {
    from: "bsmernwala@gmail.com",
    to: mailto,
    subject: "Registration Success",
    text: "Dear Vender, your are activated by Admin now you can Login.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Email error:", error);
    else console.log("Email sent:", info.response);
  });
}


// ===================
// Update Vendor Profile
// ===================
venderRoute.put("/update/:VUserId", upload.single("file"), async (req, res) => {
    try {
        const VUserId = req.params.VUserId;
        const vendor = await Vender.findOne({ VUserId });
        if (!vendor) return res.status(404).send("Vendor not found");

        const updatedData = {
            VenderName: req.body.VenderName || vendor.VenderName,
            VAddress: req.body.VAddress || vendor.VAddress,
            VContact: req.body.VContact || vendor.VContact,
            VEmail: req.body.VEmail || vendor.VEmail,
            VPicName: req.file ? req.file.filename : vendor.VPicName
        };

        await Vender.updateOne({ VUserId }, { $set: updatedData });
        res.send({ message: "Profile updated successfully", updatedData });
    } catch (err) {
        res.status(500).send("Error updating profile");
    }
});

// ===================
// Get Vendor Image
// ===================
venderRoute.get("/getimage/:vpicname", (req, res) => {
    res.sendFile(__dirname + "/venderimages/" + req.params.vpicname);
});



// =========================
// Forgot Password (OTP)
// =========================
let otpStore = {}; // temporary storage

// Send OTP
venderRoute.post("/send-otp", async (req, res) => {
  try {
    const { VUserId } = req.body;
    const vendor = await Vender.findOne({ VUserId });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[VUserId] = otp;

    // configure mail
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
       user: "bsmernwala@gmail.com",
                pass: "necc umnw wnpi bmzy", // Use app password
      }
    });

    await transporter.sendMail({
     from: "bsmernwala@gmail.com",
      to: vendor.VEmail,
      subject: "Vendor Password Reset OTP",
      text: `Your OTP is ${otp}`
    });

    res.json({ success: true, message: "OTP sent to registered email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error sending OTP" });
  }
});

// Reset Password
venderRoute.post("/reset-password", async (req, res) => {
  try {
    const { VUserId, otp, newPassword } = req.body;

    if (!otpStore[VUserId] || otpStore[VUserId] !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await Vender.updateOne({ VUserId }, { $set: { VUserPass: newPassword } });
    delete otpStore[VUserId];

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
});

// ---------------- Change Password ----------------
venderRoute.post("/changepassword", async (req, res) => {
  try {
    const { VUserId, OldPassword, NewPassword } = req.body;

    // Validate input
    if (!VUserId || !OldPassword || !NewPassword)
      return res.status(400).json({ message: "All fields are required" });

    // Find the customer
    const vender = await Vender.findOne({ VUserId });
    if (!vender)
      return res.status(404).json({ message: "Vender not found" });

    // Verify old password
    if (vender.VUserPass !== OldPassword)
      return res.status(400).json({ message: "Old password is incorrect" });

    // Update new password
    vender.VUserPass = NewPassword;
    await vender.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = venderRoute;
