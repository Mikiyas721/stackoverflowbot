const htmltotext = require('html-to-text');

const http = require('./httpandassist');

module.exports = (bot) => {
    const nextQuestion = async (ctx, stateObject) => {
        let count = stateObject.questionCount;
        const items = await http.makeQuestionRequest(stateObject.enteredText, ctx);
        if (count < items.length) {
            count++;
            ctx.deleteMessage();
            ctx.telegram.sendMessage(ctx.chat.id, `${htmltotext.fromString(items[count].title)}\n\n${htmltotext.fromString(items[count].body)}`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Previous Q",
                                callback_data: `previousQuestion,${stateObject.enteredText},${count},${items[count].question_id},${stateObject.answerCount},${stateObject.answerId}`
                            },
                            {
                                text: "Next Q",
                                callback_data: `nextQuestion,${stateObject.enteredText},${count},${items[count].question_id},${stateObject.answerCount},${stateObject.answerId}`
                            }
                        ],
                        [
                            {
                                text: "Browse Answers",
                                callback_data: `browseAnswer,${stateObject.enteredText},${count},${items[count].question_id},${stateObject.answerCount},${stateObject.answerId}`
                            }
                        ]
                    ]
                },
            });
        } else {
            // TODO Send toast message instead.
        }

    };
    const previousQuestion = async (ctx, stateObject) => {
        let questionCount = stateObject.questionCount;
        if (questionCount > 0) {
            questionCount--;
            const lastInputText = stateObject.enteredText;
            ctx.deleteMessage();
            const items = await http.makeQuestionRequest(lastInputText, ctx);
            ctx.telegram.sendMessage(ctx.chat.id, `${htmltotext.fromString(items[questionCount].title)}\n\n${htmltotext.fromString(items[questionCount].body)}`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Previous Q",
                                callback_data: `previousQuestion,${stateObject.enteredText},${questionCount},${items[questionCount].question_id},${stateObject.answerCount},${stateObject.answerId}`
                            },
                            {
                                text: "Next Q",
                                callback_data: `nextQuestion,${stateObject.enteredText},${questionCount},${items[questionCount].question_id},${stateObject.answerCount},${stateObject.answerId}`
                            }
                        ],
                        [
                            {
                                text: "Browse Answers",
                                callback_data: `browseAnswer,${stateObject.enteredText},${questionCount},${items[questionCount].question_id},${stateObject.answerCount},${stateObject.answerId}`
                            }
                        ]
                    ]
                }/*, parse_mode: "Markdown"*/
            });
        } else {
            //TODO Send toast message instead.
        }
    };
    const nextAnswer = async (ctx, stateObject) => {
        const items = await http.makeAnswerRequest(stateObject.questionId, ctx);
        if (stateObject.questionCount < items.length) {
            let answerCount = stateObject.answerCount;
            answerCount++;
            ctx.deleteMessage();
            ctx.telegram.sendMessage(ctx.chat.id, htmltotext.fromString(items[answerCount].body), {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Previous A",
                                callback_data: `previousAnswer,${stateObject.enteredText},${stateObject.questionCount},${stateObject.questionId},${answerCount},${items[answerCount].answer_id}`
                            },
                            {
                                text: "Next A",
                                callback_data: `nextAnswer,${stateObject.enteredText},${stateObject.questionCount},${stateObject.questionId},${answerCount},${items[answerCount].answer_id}`
                            },
                        ]
                    ]
                }
            });
        } else {

        }
    };
    const previousAnswer = async (ctx, stateObject) => {
        if (stateObject.answerCount > 0) {
            ctx.deleteMessage();
            let answerCount = stateObject.answerCount;
            answerCount--;
            const items = await http.makeAnswerRequest(stateObject.questionId, ctx);
            ctx.telegram.sendMessage(ctx.chat.id, htmltotext.fromString(items[answerCount].body), {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Previous A",
                                callback_data: `previousAnswer,${stateObject.enteredText},${stateObject.questionCount},${stateObject.questionId},${answerCount},${items[answerCount].answer_id}`
                            },
                            {
                                text: "Next A",
                                callback_data: `nextAnswer,${stateObject.enteredText},${stateObject.questionCount},${stateObject.questionId},${answerCount},${items[answerCount].answer_id}`
                            },
                        ]
                    ]
                }
            });
        } else {

        }

    };
    const browseAnswer = async (ctx, stateObject) => {
        const items = await http.makeAnswerRequest(stateObject.questionId, ctx);
        let message = '';
        let id;
        if (typeof ctx.chat !== "undefined") {
            id = ctx.chat.id;
        } else {
            id = ctx.update.callback_query.from.id
        }
        if (items.length <= 6) {
            for (let item in items) {
                message += `\n*Answer ${parseInt(item) + 1}*\n${htmltotext.fromString(items[item].body)}\n================================================`
            }

            ctx.telegram.sendMessage(id, message, {
                parse_mode: "Markdown"
            });
        } else {
            ctx.telegram.sendMessage(id, htmltotext.fromString(items[0].body), {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Previous A",
                                callback_data: `previousAnswer,${stateObject.enteredText},${stateObject.questionCount},${stateObject.questionId},${0},${items[0].answer_id}`
                            },
                            {
                                text: "Next A",
                                callback_data: `nextAnswer,${stateObject.enteredText},${stateObject.questionCount},${stateObject.questionId},${0},${items[0].answer_id}`
                            },
                        ]
                    ]
                }
            });
        }
    };

    bot.on("callback_query", async ctx => {
        let states = ctx.update.callback_query.data;
        let statesArray = states.split(",");
        statesArray.shift();
        let dataString = statesArray.join(",");
        let statesObject = http.getDataObject(dataString);

        states = ctx.update.callback_query.data;
        statesArray = states.split(",");
        if (statesArray[0] === "nextQuestion") {
            await nextQuestion(ctx, statesObject);
        } else if (statesArray[0] === "previousQuestion") {
            await previousQuestion(ctx, statesObject);
        } else if (statesArray[0] === "nextAnswer") {
            await nextAnswer(ctx, statesObject);
        } else if (statesArray[0] === "previousAnswer") {
            await previousAnswer(ctx, statesObject);
        } else if (statesArray[0] === "browseAnswer") {
            await browseAnswer(ctx, statesObject);
        }
    });


};