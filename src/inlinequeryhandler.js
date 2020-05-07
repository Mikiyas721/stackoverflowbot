const htmltotext = require('html-to-text');

const http = require('./http');

module.exports = (bot) => {
    bot.on('inline_query', async ctx => {
        let enteredText = ctx.inlineQuery.query;
        const items = await http.makeQuestionRequest(enteredText, ctx);
        let results = [];
        console.log(items.length);
        for (let item in items) {
            results.push({
                type: 'article',
                id: item,
                title: items[item].title,
                input_message_content: {
                    message_text: `*${htmltotext.fromString(items[item].title)}*\n${htmltotext.fromString(items[item].body)}`,
                },
                description: "description here",
                reply_markup: {
                    inline_keyboard: [[{text: "Browse Answer", callback_data: "browseAnswers"}]]
                }
            });
        }
        ctx.answerInlineQuery(results);
    });

};
