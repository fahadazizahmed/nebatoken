const mongoose = require('mongoose');

const KycVerificationSchema = new mongoose.Schema({
    kycStatus: {
        type: String,
        default: 'pending'
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true
    },
    applicationId: {
        type: String,
        required: true,
        unique: true
    },
    levelName: {
        type: String,
        required: true
    },
    isWhitelisted: {
        type: Boolean,
        default: false
    },
    hash: { type: String,  unique: true },
}, {
    timestamps: true // optional: adds createdAt and updatedAt fields
});



const KycVerificationModel = mongoose.model('kyc', KycVerificationSchema);

module.exports = KycVerificationModel;