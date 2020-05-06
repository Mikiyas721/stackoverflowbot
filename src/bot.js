const Telegraf = require('telegraf');
const fs = require('fs');
const axios = require('axios');
const htmltotext = require('html-to-text');

//import configs from './config/config';
const configs = require('./config/config');
const fileio = require('./fileio/fileio');

const bot = new Telegraf('1000620512:AAF8g7HtlbcdGB7SrfRVTcUFmHF-F-8CysI');
const filePath = 'state/state.json';

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
bot.hears("Browse question", ctx => {
    ctx.reply("Please type in the key words");
    bot.on('text', async ctx => {
        try {
            const response = await axios.get(`https://api.stackexchange.com/2.2/questions?order=desc&sort=votes&site=stackoverflow&tagged=${ctx.message.text}&filter=withbody`);
            let items = response.data.items;
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
                writeStates(count, ctx.message.text, items[count].question_id)
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
        const state = readStates();
        let count = state.questionCount;
        if (count > 0) {
            count--;
            const lastInputText = state.lastQuestionText;
            ctx.deleteMessage();
            const response = await axios.get(`https://api.stackexchange.com/2.2/questions?order=desc&sort=votes&site=stackoverflow&tagged=${lastInputText}&filter=withbody`);
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
            writeStates(count, lastInputText, items[count].question_id)
        } else {
            //TODO Send toast message instead.
        }
    } catch (e) {
        ctx.reply(e);
    }

});
bot.action("nextQuestion", async ctx => {
    try {
        const state = readStates();
        let count = state.questionCount;
        const lastInputText = state.lastQuestionText;
        const response = await axios.get(`https://api.stackexchange.com/2.2/questions?order=desc&sort=votes&site=stackoverflow&tagged=${lastInputText}&filter=withbody`);
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
            writeStates(count, lastInputText, items[count].question_id)
        } else {
            // TODO Send toast message instead.

        }
    } catch (e) {
        ctx.reply(e);
    }

});
bot.action("previousAnswer", async ctx => {
    const currentState = readStates();
    if (currentState.answerCount > 0) {
        ctx.deleteMessage();
        const response = await axios.get(`https://api.stackexchange.com/2.2/questions/${currentState.currentQuestionId}/answers?site=stackoverflow&filter=withbody`);
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
        writeStates(currentState.questionCount, currentState.lastQuestionText, currentState.currentQuestionId, currentState.answerCount - 1, items[currentState.answerCount - 1].answer_id);
    } else {

    }

});
bot.action("nextAnswer", async ctx => {
    const currentState = readStates();
    const response = await axios.get(`https://api.stackexchange.com/2.2/questions/${currentState.currentQuestionId}/answers?site=stackoverflow&filter=withbody`);
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
        writeStates(currentState.questionCount, currentState.lastQuestionText, currentState.currentQuestionId, currentState.answerCount + 1, items[currentState.answerCount + 1].answer_id);
    } else {

    }
});
bot.action("browseAnswer", async ctx => {
    const currentState = readStates();
    const response = await axios.get(`https://api.stackexchange.com/2.2/questions/${currentState.currentQuestionId}/answers?site=stackoverflow&filter=withbody`);
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
        writeStates(0, currentState.lastQuestionText, currentState.currentQuestionId, 0, items[0].answer_id);
    }

});
writeStates = (questionCount = 0, lastMessageText, questionId, answerCount = 0, answerId) => {
    let state = {
        questionCount: questionCount,
        lastQuestionText: lastMessageText,
        currentQuestionId: questionId,
        answerCount: answerCount,
        currentAnswerId: answerId
    };
    let stateObjectJson = JSON.stringify(state);
    fs.writeFileSync(filePath, stateObjectJson)
};
readStates = () => {
    let rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
};

if (configs.PRODUCTION_MODE) {
    bot.telegram.setWebhook('https://stackoverflowrealbot.herokuapp.com').then(() => console.log("Webhook added"))
    bot.startWebhook(`/${configs.TOKEN}`, null, 8443)
} else {
    bot.launch().then(() => console.log("Bot launched")).catch(console.log);
}


