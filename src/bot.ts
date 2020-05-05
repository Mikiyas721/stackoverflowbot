import Telegraf from 'telegraf';
import axios from 'axios';
import htmltotext from 'html-to-text';


import configs from '../src/config/config';
import fileio from '../src/stateio/stateio';

const bot = new Telegraf(configs.TOKEN);

let count = 0;
let currentQuestionId;

bot.start(ctx => {
    ctx.telegram.sendMessage(ctx.chat.id, "Use this bot to get easier access to Stack Overflow. In development.", {
        reply_markup: {
            keyboard: [[{text: "Browse question"}]]
        }
    });
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
bot.hears("‍♂ Browse question", ctx => {
    bot.on('text', async ctx => {
        try {
            const response = await axios.get(configs.API_BASE_URL + `/questions?order=desc&sort=votes&site=stackoverflow&tagged=${ctx.message.text}&filter=withbody`);
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
                fileio.writeStates(count, ctx.message.text, items[count].question_id)
            }
            else {
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
        let count = state.count;
        if (count > 0) {
            count--;
            const lastInputText = state.lastText;
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
        const state = fileio.readStates();
        let count = state.count;
        const lastInputText = state.lastText;
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
bot.action("browseAnswer", async ctx => {
    const currentState = fileio.readStates();
    const response = await axios.get(configs.API_BASE_URL + `/questions/${currentState.currentQuestionId}/answers?site=stackoverflow&filter=withbody`);
    const items = response.data.items;
    let message = '';
    for (let item in items) {
        message += `\n*Answer ${parseInt(item) + 1}*\n${htmltotext.fromString(items[item].body)}\n================================================`
    }
    ctx.telegram.sendMessage(ctx.chat.id, message, {
        parse_mode: "Markdown"
    });
});

bot.launch();


