"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var filePath = '/file/state';
var FileIo = {
    writeStates: function (count, lastMessageText, questionId) {
        var state = {
            count: count,
            lastText: lastMessageText,
            currentQuestionId: questionId
        };
        var stateObjectJson = JSON.stringify(state);
        fs.writeFileSync(filePath, stateObjectJson);
    },
    readStates: function () {
        var rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    }
};
exports.default = FileIo;
//# sourceMappingURL=stateio.js.map