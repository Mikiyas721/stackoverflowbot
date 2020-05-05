const fs  = require('fs');
const filePath = '/file/state';

const FileIo = {
    writeStates: (count, lastMessageText, questionId) => {
        let state = {
            count: count,
            lastText: lastMessageText,
            currentQuestionId: questionId
        };
        let stateObjectJson = JSON.stringify(state);
        fs.writeFileSync(filePath, stateObjectJson)
    },
    readStates: () => {
        let rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    }

};
export default FileIo;