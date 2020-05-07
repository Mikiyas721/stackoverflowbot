const Telegraf = require('telegraf');
const configs = require('./config/config');

const bot = new Telegraf(configs.TOKEN);

const inlineQueryHandler = require('./inlinequeryhandler');
inlineQueryHandler(bot);

const command = require('./command');
command(bot);

const action = require('./action');
action(bot);

const hears = require('./hears');
hears(bot);

if (configs.PRODUCTION_MODE) {
    bot.telegram.setWebhook(`${configs.SERVER_URL}/${configs.TOKEN}`).then(() => console.log("Webhook added"));
    bot.startWebhook(`/${configs.TOKEN}`, null, process.env.PORT);
} else {
    bot.launch().then(() => console.log("Bot launched")).catch(console.log);
}