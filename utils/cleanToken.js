const cron = require('node-cron');
const tokenBlacklist = require('../models/tokenBlacklistModel');

const cleanUpBlacklistedTokens = async () => {
    try {
        const now = new Date();
        console.log('Token cleanup started at (UTC):', now.toUTCString());
        
        const countBefore = await tokenBlacklist.countDocuments({ expiresAt: { $lt: now } });
        console.log(`Tokens eligible for deletion: ${countBefore}`);
        
        const result = await tokenBlacklist.deleteMany({ expiresAt: { $lt: now } });
        console.log(`Expired blacklisted tokens deleted: ${result.deletedCount}`);
        
        if (result.deletedCount === 0) {
            console.log('No expired tokens found for deletion.');
        }
        
        const remainingTokens = await tokenBlacklist.find().limit(5).lean();
        
    } catch (error) {
        console.error("Error deleting blacklisted tokens:", error);
    }
};

const setTokenCleanUp = () => {
    cron.schedule('0 * * * *', cleanUpBlacklistedTokens);
    console.log('Token cleanup scheduled to run every hour');
};

module.exports = setTokenCleanUp;
