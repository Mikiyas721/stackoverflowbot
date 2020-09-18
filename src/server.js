const Telegraf = require('telegraf');
const Scene = require('telegraf/scenes/base');
const Session = require('telegraf/session');
const Stage = require('telegraf/stage');
const configs = require('./config/config');


const bot = new Telegraf(configs.TOKEN);
const browseScene = new Scene('browseScene');
const stage = new Stage();

stage.register(browseScene);

bot.use(Session());
bot.use(stage.middleware());


const inlineQueryHandler = require('./inlinequeryhandler');
inlineQueryHandler(bot);

const command = require('./command');
command(bot);

const action = require('./action');
action(bot);

const hears = require('./hears');
hears(bot, browseScene);

if (configs.PRODUCTION_MODE) {
    bot.telegram.setWebhook(`${configs.SERVER_URL}/${configs.TOKEN}`).then(() => console.log("Webhook added"));
    bot.startWebhook(`/${configs.TOKEN}`, null, process.env.PORT);
} else {
    bot.launch().then(() => console.log("Bot launched")).catch(console.log);
}