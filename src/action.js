const htmltotext = require('html-to-text');

const fileio = require('./fileio/fileio');
const http = require('./http');

module.exports = (bot) => {
    bot.action("previousQuestion", async ctx => {
        try {
            const state = fileio.readStates();
            let count = state.questionCount;
            if (count > 0) {
                count--;
                const lastInputText = state.lastQuestionText;
                ctx.deleteMessage();
                const items = await http.makeQuestionRequest(lastInputText, ctx);
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
            const items = await http.makeQuestionRequest(lastInputText, ctx);
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
            const items = await http.makeAnswerRequest(currentState.currentQuestionId, ctx);
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
        const items = await http.makeAnswerRequest(currentState.currentQuestionId, ctx);
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
        const items = await http.makeAnswerRequest(currentState.currentQuestionId, ctx);
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

};