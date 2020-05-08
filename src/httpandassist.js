const axios = require('axios');

const configs = require('./config/config');

const httpandassist = {
        makeQuestionRequest: async (enteredText, ctx) => {
            try {
                const response = await axios.get(configs.API_BASE_URL + `/questions?order=desc&sort=votes&site=stackoverflow&tagged=${enteredText}&filter=withbody`);
                return response.data.items;
            } catch (e) {
                ctx.reply(e)
            }
        },
        makeAnswerRequest: async (currentQuestionId, ctx) => {
            try {
                const response = await axios.get(configs.API_BASE_URL + `/questions/${currentQuestionId}/answers?site=stackoverflow&filter=withbody`);
                return response.data.items;
            } catch (e) {
                ctx.reply(e)
            }
        },
        getDataObject: (dataString) => {
            const dataArray = dataString.split(",");
            return {
                enteredText: dataArray[0],
                questionCount: dataArray[1],
                questionId: dataArray[2],
                answerCount: dataArray[3],
                answerId: dataArray[4]
            }
        }
    }
;
module.exports = httpandassist;