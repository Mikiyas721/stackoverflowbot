const htmltotext = require('html-to-text');

const http = require('./httpandassist');
module.exports = (bot) => {
    bot.hears("Browse question", ctx => {
        ctx.reply("Please type in the key words");
        bot.on('text', async ctx => {
            try {
                let items = await http.makeQuestionRequest(ctx.message.text, ctx);
                if (items.length !== 0) {
                    ctx.telegram.sendMessage(ctx.chat.id, `*${htmltotext.fromString(items[0].title)}*\n\n${htmltotext.fromString(items[0].body)}`, {
                        reply_markup: {
                            inline_keyboard: [
                                [[{
                                    text: "Previous Q",
                                    callback_data: `previousQuestion,${ctx.message.text},${0},${items[0].question_id},${0},${items[0].answer_id}`
                                },
                                    {
                                        text: "Next Q",
                                        callback_data: `nextQuestion,${ctx.message.text},${0},${items[0].question_id},${0},${items[0].answer_id}`
                                    }
                                ], [{
                                    text: "Browse answers",
                                    callback_data: `browserAnswer,${ctx.message.text},${0},${items[0].question_id},${0},${items[0].answer_id}`
                                }]
                                ]
                            ]
                        }, parse_mode: "Markdown"
                    });
                } else {
                    ctx.reply(`Could not find any such question with word(s) " ${ctx.message.text} " in it.`)
                }

            } catch (e) {
                ctx.reply(e);
            }
        });
    });
};



