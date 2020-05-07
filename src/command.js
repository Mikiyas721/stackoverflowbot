module.exports = (bot)=>{
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
};