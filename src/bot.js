const Telegraf = require('telegraf');
const axios = require('axios');
const htmltotext = require('html-to-text');
const fs = require('fs');

const bot = new Telegraf('1000620512:AAF8g7HtlbcdGB7SrfRVTcUFmHF-F-8CysI');


const stackKey = "X7hmoKyFazswM65No1lnsA((";
const stackClientId = "17827";
const stackClientSecret = "cRGRyBLLNg8zDknij7lq9w((";
const filePath = './file/state.json';

let count = 0;
let currentQuestionId;


bot.command("start", ctx => {
    ctx.reply("Bot in development");
});

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
        }
        else {
            ctx.reply(`Could not find any such question with word(s) " ${ctx.message.text} " in it.`)
        }

    } catch (e) {
        ctx.reply(e);
    }

});

bot.action("previousQuestion", async ctx => {
    try {
        const state = readStates();
        let count = state.count;
        if (count > 0) {
            count--;
            const lastInputText = state.lastText;
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
        }
        else {
            //TODO Send toast message instead.
        }
    } catch (e) {
        ctx.reply(e);
    }

});
bot.action("nextQuestion", async ctx => {
    try {
        const state = readStates();
        let count = state.count;
        const lastInputText = state.lastText;
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
bot.action("browseAnswer", async ctx => {
    const currentState = readStates();
    const response = await axios.get(`https://api.stackexchange.com/2.2/questions/${currentState.currentQuestionId}/answers?site=stackoverflow&filter=withbody`);
    const items = response.data.items;
    let message = '';
    for (let item in items) {
        message += `\n*Answer ${parseInt(item) + 1}*\n${htmltotext.fromString(items[item].body)}\n================================================`
    }
    ctx.telegram.sendMessage(ctx.chat.id, message, {
        parse_mode: "Markdown"
    });
});

const writeStates = (count, lastMessageText, questionId) => {
    let state = {
        count: count,
        lastText: lastMessageText,
        currentQuestionId: questionId
    };
    let stateObjectJson = JSON.stringify(state);
    fs.writeFileSync(filePath, stateObjectJson)
};
const readStates = () => {
    let rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
};
bot.launch();


