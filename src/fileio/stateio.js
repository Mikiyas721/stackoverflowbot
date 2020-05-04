/*
const filePath = '/file/state';
const fs = require('fs');

export default class FileIo {
    writeStates = (count, lastMessageText, questionId) => {
        let state = {
            count: count,
            lastText: lastMessageText,
            currentQuestionId: questionId
        };
        let stateObjectJson = JSON.stringify(state);
        fs.writeFileSync(filePath, stateObjectJson)
    };
    readStates = () => {
        let rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    };

}
*/
