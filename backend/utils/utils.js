const crypto = require('crypto')
const config = require('../config')
const KycVerificationModel = require("../Models/KycVerificationModel");
const axios = require('axios')

const createSignature = (config, httpMethod, url, body = '') => {
    const ts = Math.floor(Date.now() / 1000);
    const signature = crypto.createHmac('sha256', config.secretKey);
    // Convert body to string if it's an object
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const dataToSign = ts + httpMethod + url + bodyString;
    signature.update(dataToSign);
    const finalSignature = signature.digest('hex');

    return {
        signature: finalSignature,
        ts: ts.toString()
    };
}
const whiteListAddress = async (address, applicationId) => {
    try {
        const contractAddress = process.env.CONTRACT_ADDRESS;
        const privateKey = process.env.PRIVATE_KEY; // Make sure this matches your .env variable name

        if (!contractAddress || !privateKey) {
            throw new Error('CONTRACT_ADDRESS or PRIVATE_KEY not found in environment variables');
        }

        // Create contract instance
        const contract = new global.web3.eth.Contract(config.ABI, contractAddress);

        // Create account from private key
        const account = global.web3.eth.accounts.privateKeyToAccount(privateKey);

        // Add account to wallet
        global.web3.eth.accounts.wallet.add(account);

        // Prepare transaction data for setWhitelist
        const txData = contract.methods.addToWhitelist(address).encodeABI();

        // Get gas estimate
        const gasEstimate = await contract.methods.addToWhitelist(address).estimateGas({
            from: account.address
        });


        // Get current gas price
        const gasPrice = await global.web3.eth.getGasPrice();

        // Create transaction object
        const txObject = {
            to: contractAddress,
            data: txData,
            gas: Math.floor(gasEstimate * 1.2), // Add 20% buffer
            gasPrice: gasPrice,
            from: account.address
        };

        // Sign and send transaction
        const signedTx = await global.web3.eth.accounts.signTransaction(txObject, privateKey);
        const receipt = await global.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log('Whitelist transaction successful:', receipt.transactionHash);

        // Update KYC verification record in database
        const updatedKyc = await KycVerificationModel.findOneAndUpdate(
            { applicationId: applicationId },
            {
                isWhitelisted: true,
                kycStatus: 'completed',
                hash: receipt.transactionHash
            },
            { new: true } // Return the updated document
        );

        return

    } catch (whitelistError) {
        console.error("Error whitelisting address:", whitelistError);
        throw "KYC status retrieved but failed to whitelist address"

    }
}

const getWhitelistedAddresses = async (addresses) => {
    try {
        const contractAddress = process.env.CONTRACT_ADDRESS;

        if (!contractAddress) {
            throw new Error('CONTRACT_ADDRESS not found in environment variables');
        }

        // Create contract instance
        const contract = new global.web3.eth.Contract(config.ABI, contractAddress);

        // Check each address and filter whitelisted ones
        const whitelistedAddresses = [];

        for (const address of addresses) {
            try {
                const isApproved = await contract.methods.isKYCApproved(address).call();
                if (isApproved) {
                    whitelistedAddresses.push(address);
                }
            } catch (error) {
                console.warn(`Error checking address ${address}:`, error.message);
                // Continue checking other addresses even if one fails
            }
        }

        console.log(`Found ${whitelistedAddresses.length} whitelisted addresses out of ${addresses.length} checked`);
        return whitelistedAddresses;

    } catch (error) {
        console.error("Error getting whitelisted addresses:", error);
        throw error;
    }
}


const createApplicationToken = async (walletAddress, levelName = 'id-and-liveness', SUMSUB_CONFIG) => {
    try {

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


        return {
            success: true,
            accessToken: accessTokenResponse.data.token,
            levelName: levelName
        }


    } catch (error) {
        console.error("Error fetching kyc transaction history:", error);
        throw "Internal server error"

    }
}












module.exports = {
    createSignature,
    whiteListAddress,
    getWhitelistedAddresses,
    createApplicationToken
}