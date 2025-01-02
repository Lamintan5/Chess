const otpController = require("./contollers/otp.controller");
const pushNotificationController = require("./contollers/push-notification.controller");

const express = require("express");
const router = express.Router();
const multer = require("multer");


router.post("/otp-login", otpController.otpLogin);
router.post("/otp-verify", otpController.verifyOTP);

router.get("/SendNotification", pushNotificationController.SendNotification);
router.post("/SendNotificationToDevice", pushNotificationController.SendNotificationToDevice);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + ".jpeg");
    },
});

const upload = multer({
    storage: storage,
});

router.route("/addimage").post(upload.single("img"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }
        res.json({ path: req.file.filename });
    } catch (e) {
        console.error("Error uploading image:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
