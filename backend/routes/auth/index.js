const express = require("express");
const router = express.Router();

router.use("/register", require("./register"));
router.use("/login", require("./login"));
router.use("/logout", require("./logout"));

router.use("/check-email", require("./check-email"));

router.use("/verify", require("./verify"));
router.use("/verify-token", require("./verify-token"));
router.use("/resend-verification", require("./resend-verification"));

router.use("/refresh-token", require("./refresh-token"));
router.use("/me", require("./me"));

module.exports = router;