const htmltotext = require('html-to-text');

const fileio = require('./fileio/fileio');
const http  = require('./http');

module.exports = (bot) => {
    bot.hears("Browse question", ctx => {
        ctx.reply("Please type in the key words");
        bot.on('text', async ctx => {
            try {
                let items = await http.makeQuestionRequest(ctx.message.text, ctx);
                console.log(items);
                if (items.length !== 0) {
                    ctx.telegram.sendMessage(ctx.chat.id, `*${htmltotext.fromString(items[0].title)}*\n\n${htmltotext.fromString(items[0].body)}`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{text: "Previous Q", callback_data: "previousQuestion"},
                                    {text: "Next Q", callback_data: "nextQuestion"}
                                ], [{text: "Browse answers", callback_data: "browseAnswer"}]
                            ]
                        }, parse_mode: "Markdown"
                    });
                    fileio.writeStates(0, ctx.message.text, items[0].question_id)
                } else {
                    ctx.reply(`Could not find any such question with word(s) " ${ctx.message.text} " in it.`)
                }

            } catch (e) {
                ctx.reply(e);
            }
        });
    });
};



