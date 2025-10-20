// routes.js
const express = require("express");
const transactionController = require("../controllers/controller");
const router = express.Router();

// Admin/Transaction routes

router.post("/sumsub/createApplicant", transactionController.createApplication);
router.post("/sumsub/webhook", transactionController.sumSubWebHook);
router.get("/sumsub/token/:walletAddress", transactionController.createToken);
router.get("/sumsub/status/:applicationID", transactionController.getStatus);
router.get("/sumsub/data/:applicationID", transactionController.getData);
router.post("/sumsub/checkWhiteList", transactionController.checkWhitelistByAddress);



module.exports = router;
