const config = require("../config");
const KycVerificationModel = require("../Models/KycVerificationModel");
const axios = require('axios')
const crypto = require('crypto')
// const createSignature = require("../utils/utils")
const { whiteListAddress, createSignature, createApplicationToken } = require("../utils/utils")

// Sumsub configuration
const SUMSUB_CONFIG = {
  baseURL: process.env.SUMSUB_URL,
  secretKey: process.env.SUMSUB_SECRET_KEY,
  appToken: process.env.SUMSUB_APP_TOKEN
};




const createApplication = async (req, res) => {


  try {
    const { walletAddress, levelName = 'id-and-liveness' } = req.body;

    if (!walletAddress) {
      console.log('❌ Missing wallet address');
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    let isExist = await KycVerificationModel.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (isExist) {

      let response = await createApplicationToken(walletAddress, levelName, SUMSUB_CONFIG)
      res.json(response);
      return
    }

    const applicantData = {
      externalUserId: walletAddress,
      fixedInfo: {
        country: 'USA',
        firstName: 'Crypto',
        lastName: 'User'
      }
    };

    const applicantUrl = `/resources/applicants?levelName=${levelName}`;
    const applicantSignature = createSignature(SUMSUB_CONFIG, 'POST', applicantUrl, JSON.stringify(applicantData));
    const applicantResponse = await axios.post(
      `${SUMSUB_CONFIG.baseURL}${applicantUrl}`,
      applicantData,
      {
        headers: {
          'X-App-Token': SUMSUB_CONFIG.appToken,
          'X-App-Access-Sig': applicantSignature.signature,
          'X-App-Access-Ts': applicantSignature.ts,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const accessTokenUrl = `/resources/accessTokens/sdk`; // ← NO query parameters
    const accessTokenData = {
      userId: walletAddress,
      levelName: levelName
    };
    const accessTokenSignature = createSignature(SUMSUB_CONFIG, 'POST', accessTokenUrl, JSON.stringify(accessTokenData));

    const accessTokenResponse = await axios.post(
      `${SUMSUB_CONFIG.baseURL}${accessTokenUrl}`,
      accessTokenData, // ← Data in body, not query params
      {
        headers: {
          'X-App-Token': SUMSUB_CONFIG.appToken,
          'X-App-Access-Sig': accessTokenSignature.signature,
          'X-App-Access-Ts': accessTokenSignature.ts,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );


    await KycVerificationModel({
      kycStatus: 'pending',
      walletAddress: walletAddress.toLowerCase(),
      applicationId: applicantResponse.data.id,
      levelName: levelName,
      isWhitelisted: false
    }).save();

    res.json({
      success: true,
      accessToken: accessTokenResponse.data.token,
      applicantId: applicantResponse.data.id,
      levelName: levelName
    });

  } catch (error) {
    console.log('\n❌ === KYC PROCESS FAILED ===');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);

    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }

    res.status(500).json({
      error: 'Failed to initialize KYC process',
      details: error.response?.data || error.message
    });
  }

  console.log('🏁 === KYC PROCESS COMPLETED ===\n');
};




const sumSubWebHook = async (req, res) => {
  try {

    const data = req.body;
    // ✅ Check if KYC review is completed
    if (data.reviewStatus === "completed" && data.reviewResult?.reviewAnswer === "GREEN") {
      console.log(`✅ KYC approved for wallet: ${data.externalUserId}`);
      // Call your whitelist function using the wallet address
      await whiteListAddress(data.externalUserId, data.applicantId);
    } else {
      console.log(`ℹ️ KYC not approved yet or still pending for wallet: ${data.externalUserId}`);
    }

    res.status(200).json({ success: true, message: "Webhook received successfully" });

  } catch (error) {
    console.error("❌ Error in Sumsub webhook:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



const createToken = async (req, res) => {
  try {

    const { walletAddress, levelName = 'id-and-liveness' } = req.params;

    const accessTokenUrl = `/resources/accessTokens/sdk`; // ← NO query parameters
    const accessTokenData = {
      userId: walletAddress,
      levelName: levelName
    };
    const accessTokenSignature = createSignature(SUMSUB_CONFIG, 'POST', accessTokenUrl, JSON.stringify(accessTokenData));
    const accessTokenResponse = await axios.post(
      `${SUMSUB_CONFIG.baseURL}${accessTokenUrl}`,
      accessTokenData, // ← Data in body, not query params
      {
        headers: {
          'X-App-Token': SUMSUB_CONFIG.appToken,
          'X-App-Access-Sig': accessTokenSignature.signature,
          'X-App-Access-Ts': accessTokenSignature.ts,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );


    res.json({
      success: true,
      accessToken: accessTokenResponse.data.token,
      levelName: levelName
    });


  } catch (error) {
    console.error("Error fetching kyc transaction history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



const getStatus = async (req, res) => {
  console.log("req.params.applicationID", req.params.applicationID)
  const method = 'GET';
  const url = `/resources/applicants/${req.params.applicationID}/status`;
  const ts = Math.floor(Date.now() / 1000); // seconds

  // Create HMAC signature
  const hmacSignature = crypto
    .createHmac('sha256', SUMSUB_CONFIG.secretKey)
    .update(ts + method + url)
    .digest('hex');

  const headers = {
    'X-App-Token': SUMSUB_CONFIG.appToken,
    'X-App-Access-Sig': hmacSignature,
    'X-App-Access-Ts': ts,
  };

  try {
    const response = await axios.get(SUMSUB_CONFIG.baseURL + url, { headers });
    res.json({
      success: true,
      status: response.data
    });
    console.log('✅ Applicant Status:', response.data);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }


}

const getData = async (req, res) => {
  console.log("req.params.applicationID", req.params.applicationID)
  const method = 'GET';
  const url = `/resources/applicants/${req.params.applicationID}/one`;
  const ts = Math.floor(Date.now() / 1000); // seconds

  // Create HMAC signature
  const hmacSignature = crypto
    .createHmac('sha256', SUMSUB_CONFIG.secretKey)
    .update(ts + method + url)
    .digest('hex');

  const headers = {
    'X-App-Token': SUMSUB_CONFIG.appToken,
    'X-App-Access-Sig': hmacSignature,
    'X-App-Access-Ts': ts,
  };

  try {
    const response = await axios.get(SUMSUB_CONFIG.baseURL + url, { headers });
    res.json({
      success: true,
      status: response.data
    });
    console.log('✅ Applicant Status:', response.data);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }


}


const checkWhitelistByAddress = async (req, res) => {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!contractAddress) {
      throw new Error('CONTRACT_ADDRESS not found in environment variables');
    }
    // Create contract instance
    const contract = new global.web3.eth.Contract(config.ABI, contractAddress);
    const isApproved = await contract.methods.isKYCApproved(req.body.address).call();

    res.json({
      success: true,
      isWhiteList: isApproved
    });

  } catch (error) {
    console.error("Error getting whitelisted addresses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

module.exports = {
  createApplication,
  sumSubWebHook,
  createToken,
  getStatus,
  getData,
  checkWhitelistByAddress
};
