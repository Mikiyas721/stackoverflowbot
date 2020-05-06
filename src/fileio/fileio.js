const fs = require('fs');
const filePath = '/state/state.json';

const FileIo = {
    writeStates: (questionCount = 0, lastMessageText, questionId, answerCount = 0, answerId) => {
        let state = {
            questionCount: questionCount,
            lastQuestionText: lastMessageText,
            currentQuestionId: questionId,
            answerCount: answerCount,
            currentAnswerId: answerId
        };
        let stateObjectJson = JSON.stringify(state);
        fs.writeFileSync(filePath, stateObjectJson)
    },
    readStates: () => {
        let rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    }

};

