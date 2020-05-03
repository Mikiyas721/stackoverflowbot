const Telegraf = require('telegraf');

const bot = new Telegraf('1000620512:AAF8g7HtlbcdGB7SrfRVTcUFmHF-F-8CysI');

bot.command("start", ctx => {
    ctx.reply("Bot in development");
});

bot.launch();

