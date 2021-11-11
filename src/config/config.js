require('dotenv').config();

const configs = {
    TOKEN: process.env.BOT_TOKEN,
    API_BASE_URL: "https://api.stackexchange.com/2.2",
    SERVER_URL:'https://stackoverflowrealbot.herokuapp.com',
    PRODUCTION_MODE: true,
    stackKey: process.env.STACK_KEY,
    stackClientId: process.env.STACK_CLIENT_ID,
    stackClientSecret: process.env.STACK_CLIENT_SECRET,
};


module.exports = configs;