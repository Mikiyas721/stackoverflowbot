const Telegraf = require('telegraf');
const axios = require('axios');
const htmltotext = require('html-to-text');

const configs = require('./config/config');
const fileio = require('./fileio/fileio');

const bot = new Telegraf(configs.TOKEN);

let count = 0;
let currentQuestionId;

bot.start(ctx => {
    try {
        console.log("start");
        return ctx.telegram.sendMessage(ctx.chat.id, "Use this bot to get easier access to Stack Overflow. In development.", {
            reply_markup: {
                keyboard: [[{text: "Browse question"}]], resize_keyboard: true
            }
        });
    } catch (e) {
        console.log(e);
    }
});
bot.help(ctx => {
    const helpMessage = `
        *Stack Overflow Bot (In development)*\nThis bot uses the Stack Overflow api to get you answers.\n\nSend a key word from your question. The bot will then respond with similar questions that have been asked before. You can navigate through these questions to find one that suits you.\n\nUse the browse answer button to find the answers to that question.
         `;
    ctx.telegram.sendMessage(ctx.chat.id, helpMessage,
        {
            parse_mode: "Markdown"
        }
    )
});

makeQuestionRequest = async (enteredText, ctx) => {
    try {
        const response = await axios.get(configs.API_BASE_URL + `/questions?order=desc&sort=votes&site=stackoverflow&tagged=${enteredText}&filter=withbody`);
        return response.data.items;
    } catch (e) {
        ctx.reply(e)
    }
};

bot.hears("Browse question", ctx => {
    ctx.reply("Please type in the key words");
    bot.on('text', async ctx => {
        try {
            let items = makeQuestionRequest(ctx.message.text, ctx);
            count = 0;
            if (items.length !== 0) {
                ctx.telegram.sendMessage(ctx.chat.id, `*${htmltotext.fromString(items[count].title)}*\n\n${htmltotext.fromString(items[count].body)}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: "Previous Q", callback_data: "previousQuestion"},
                                {text: "Next Q", callback_data: "nextQuestion"}
                            ], [{text: "Browse answers", callback_data: "browseAnswer"}]
                        ]
                    }, parse_mode: "Markdown"
                });
                fileio.writeStates(count, ctx.message.text, items[count].question_id)
            } else {
                ctx.reply(`Could not find any such question with word(s) " ${ctx.message.text} " in it.`)
            }

        } catch (e) {
            ctx.reply(e);
        }
    });
});

bot.action("previousQuestion", async ctx => {
    try {
        const state = fileio.readStates();
        let count = state.questionCount;
        if (count > 0) {
            count--;
            const lastInputText = state.lastQuestionText;
            ctx.deleteMessage();
            const response = await axios.get(configs.API_BASE_URL + `/questions?order=desc&sort=votes&site=stackoverflow&tagged=${lastInputText}&filter=withbody`);
            let items = response.data.items;
            ctx.telegram.sendMessage(ctx.chat.id, `${htmltotext.fromString(items[count].title)}\n\n${htmltotext.fromString(items[count].body)}`, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: "Previous Q", callback_data: "previousQuestion"},
                            {text: "Next Q", callback_data: "nextQuestion"}
                        ], [{text: "Browse answers", callback_data: "browseAnswer"}]
                    ]
                }/*, parse_mode: "Markdown"*/
            });
            fileio.writeStates(count, lastInputText, items[count].question_id)
        } else {
            //TODO Send toast message instead.
        }
    } catch (e) {
        ctx.reply(e);
    }

});
bot.action("nextQuestion", async ctx => {
    try {
        const state = fileio.readStates();
        let count = state.questionCount;
        const lastInputText = state.lastQuestionText;
        const response = await axios.get(configs.API_BASE_URL + `/questions?order=desc&sort=votes&site=stackoverflow&tagged=${lastInputText}&filter=withbody`);
        let items = response.data.items;
        if (count < items.length) {
            count++;
            ctx.deleteMessage();
            ctx.telegram.sendMessage(ctx.chat.id, `${htmltotext.fromString(items[count].title)}\n\n${htmltotext.fromString(items[count].body)}`, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: "Previous Q", callback_data: "previousQuestion"},
                            {text: "Next Q", callback_data: "nextQuestion"}
                        ], [{text: "Browse answers", callback_data: "browseAnswer"}]
                    ]
                },
            });
            fileio.writeStates(count, lastInputText, items[count].question_id)
        } else {
            // TODO Send toast message instead.

        }
    } catch (e) {
        ctx.reply(e);
    }

});
bot.action("previousAnswer", async ctx => {
    const currentState = fileio.readStates();
    if (currentState.answerCount > 0) {
        ctx.deleteMessage();
        const response = await axios.get(configs.API_BASE_URL + `/questions/${currentState.currentQuestionId}/answers?site=stackoverflow&filter=withbody`);
        const items = response.data.items;
        ctx.telegram.sendMessage(ctx.chat.id, htmltotext.fromString(items[currentState.questionCount - 1].body), {
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: "Previous A", callback_data: "previousAnswer"},
                        {text: "Next A", callback_data: "nextAnswer"},
                    ]
                ]
            }
        });
        fileio.writeStates(currentState.questionCount, currentState.lastQuestionText, currentState.currentQuestionId, currentState.answerCount - 1, items[currentState.answerCount - 1].answer_id);
    } else {

    }

});
bot.action("nextAnswer", async ctx => {
    const currentState = fileio.readStates();
    const response = await axios.get(configs.API_BASE_URL + `/questions/${currentState.currentQuestionId}/answers?site=stackoverflow&filter=withbody`);
    const items = response.data.items;
    if (currentState.answerCount < items.length) {
        ctx.deleteMessage();
        ctx.telegram.sendMessage(ctx.chat.id, htmltotext.fromString(items[currentState.questionCount + 1].body), {
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: "Previous A", callback_data: "previousAnswer"},
                        {text: "Next A", callback_data: "nextAnswer"},
                    ]
                ]
            }
        });
        fileio.writeStates(currentState.questionCount, currentState.lastQuestionText, currentState.currentQuestionId, currentState.answerCount + 1, items[currentState.answerCount + 1].answer_id);
    } else {

    }
});
bot.action("browseAnswer", async ctx => {
    const currentState = fileio.readStates();
    const response = await axios.get(configs.API_BASE_URL + `/questions/${currentState.currentQuestionId}/answers?site=stackoverflow&filter=withbody`);
    const items = response.data.items;
    let message = '';
    if (items.length <= 6) {
        for (let item in items) {
            message += `\n*Answer ${parseInt(item) + 1}*\n${htmltotext.fromString(items[item].body)}\n================================================`
        }
        ctx.telegram.sendMessage(ctx.chat.id, message, {
            parse_mode: "Markdown"
        });
    } else {
        ctx.telegram.sendMessage(ctx.chat.id, htmltotext.fromString(items[0].body), {
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: "Previous A", callback_data: "previousAnswer"},
                        {text: "Next A", callback_data: "nextAnswer"},
                    ]
                ]
            }
        });
        fileio.writeStates(0, currentState.lastQuestionText, currentState.currentQuestionId, 0, items[0].answer_id);
    }

});

bot.on('inline_query', async ctx => {
    let enteredText = ctx.inlineQuery.query;
    const response = await axios.get(configs.API_BASE_URL + `/questions?order=desc&sort=votes&site=stackoverflow&tagged=${enteredText}&filter=withbody`);
    const items = response.data.items;
    let results = [];
    console.log(items.length);
    for (let item in items) {
        results.push({
            type: 'article',
            id: item,
            title: items[item].title,
            input_message_content: {
                message_text: `*${htmltotext.fromString(items[item].title)}*\n${htmltotext.fromString(items[item].body)}`,
                parse_mode: "Markdown"
            },
            description: "description here",
            reply_markup: {
                inline_keyboard: [[{text: "Browse Answer", callback_data: "browseAnswers"}]]
            }
        });
    }
    ctx.answerInlineQuery(results, {});
});

if (configs.PRODUCTION_MODE) {
    bot.telegram.setWebhook(`${configs.SERVER_URL}/${configs.TOKEN}`).then(() => console.log("Webhook added"));
    bot.startWebhook(`/${configs.TOKEN}`, null, process.env.PORT);
} else {
    bot.launch().then(() => console.log("Bot launched")).catch(console.log);
}


