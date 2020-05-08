const htmltotext = require('html-to-text');

const http = require('./httpandassist');

module.exports = (bot) => {
    bot.on('inline_query', async ctx => {
        let enteredText = ctx.inlineQuery.query;
        const items = await http.makeQuestionRequest(enteredText, ctx);
        let results = [];
        for (let item in items) {
            results.push({
                type: 'article',
                id: item,
                title: htmltotext.fromString(items[item].title),
                input_message_content: {
                    message_text: `*${htmltotext.fromString(items[item].title)}*\n${htmltotext.fromString(items[item].body)}`,
                    /*parse_mode: "Markdown"*/
                },
                description: htmltotext.fromString(items[item].title),
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Browse Answer",
                                callback_data: `browseAnswer,${ctx.update.inline_query.query},${item},${items[item].question_id},${0},${items[item].answer_id}`
                            }
                        ]
                    ]
                }
            });
        }
        ctx.answerInlineQuery(results);
    });

};
