"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var telegraf_1 = require("telegraf");
var axios_1 = require("axios");
var html_to_text_1 = require("html-to-text");
var config_1 = require("../src/config/config");
var stateio_1 = require("../src/stateio/stateio");
var bot = new telegraf_1.default(config_1.default.TOKEN);
var count = 0;
var currentQuestionId;
bot.start(function (ctx) {
    ctx.telegram.sendMessage(ctx.chat.id, "Use this bot to get easier access to Stack Overflow. In development.", {
        reply_markup: {
            keyboard: [[{ text: "Browse question" }]]
        }
    });
});
bot.help(function (ctx) {
    var helpMessage = "\n        *Stack Overflow Bot (In development)*\nThis bot uses the Stack Overflow api to get you answers.\n\nSend a key word from your question. The bot will then respond with similar questions that have been asked before. You can navigate through these questions to find one that suits you.\n\nUse the browse answer button to find the answers to that question.\n         ";
    ctx.telegram.sendMessage(ctx.chat.id, helpMessage, {
        parse_mode: "Markdown"
    });
});
bot.hears("‍♂ Browse question", function (ctx) {
    bot.on('text', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var response, items, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get(config_1.default.API_BASE_URL + ("/questions?order=desc&sort=votes&site=stackoverflow&tagged=" + ctx.message.text + "&filter=withbody"))];
                case 1:
                    response = _a.sent();
                    items = response.data.items;
                    count = 0;
                    if (items.length !== 0) {
                        ctx.telegram.sendMessage(ctx.chat.id, "*" + html_to_text_1.default.fromString(items[count].title) + "*\n\n" + html_to_text_1.default.fromString(items[count].body), {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "Previous Q", callback_data: "previousQuestion" },
                                        { text: "Next Q", callback_data: "nextQuestion" }
                                    ], [{ text: "Browse answers", callback_data: "browseAnswer" }]
                                ]
                            }, parse_mode: "Markdown"
                        });
                        stateio_1.default.writeStates(count, ctx.message.text, items[count].question_id);
                    }
                    else {
                        ctx.reply("Could not find any such question with word(s) \" " + ctx.message.text + " \" in it.");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    ctx.reply(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
});
bot.action("previousQuestion", function (ctx) { return __awaiter(_this, void 0, void 0, function () {
    var state, count_1, lastInputText, response, items, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                state = stateio_1.default.readStates();
                count_1 = state.count;
                if (!(count_1 > 0)) return [3 /*break*/, 2];
                count_1--;
                lastInputText = state.lastText;
                ctx.deleteMessage();
                return [4 /*yield*/, axios_1.default.get(config_1.default.API_BASE_URL + ("/questions?order=desc&sort=votes&site=stackoverflow&tagged=" + lastInputText + "&filter=withbody"))];
            case 1:
                response = _a.sent();
                items = response.data.items;
                ctx.telegram.sendMessage(ctx.chat.id, html_to_text_1.default.fromString(items[count_1].title) + "\n\n" + html_to_text_1.default.fromString(items[count_1].body), {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Previous Q", callback_data: "previousQuestion" },
                                { text: "Next Q", callback_data: "nextQuestion" }
                            ], [{ text: "Browse answers", callback_data: "browseAnswer" }]
                        ]
                    } /*, parse_mode: "Markdown"*/
                });
                stateio_1.default.writeStates(count_1, lastInputText, items[count_1].question_id);
                return [3 /*break*/, 2];
            case 2: return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                ctx.reply(e_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
bot.action("nextQuestion", function (ctx) { return __awaiter(_this, void 0, void 0, function () {
    var state, count_2, lastInputText, response, items, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                state = stateio_1.default.readStates();
                count_2 = state.count;
                lastInputText = state.lastText;
                return [4 /*yield*/, axios_1.default.get(config_1.default.API_BASE_URL + ("/questions?order=desc&sort=votes&site=stackoverflow&tagged=" + lastInputText + "&filter=withbody"))];
            case 1:
                response = _a.sent();
                items = response.data.items;
                if (count_2 < items.length) {
                    count_2++;
                    ctx.deleteMessage();
                    ctx.telegram.sendMessage(ctx.chat.id, html_to_text_1.default.fromString(items[count_2].title) + "\n\n" + html_to_text_1.default.fromString(items[count_2].body), {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "Previous Q", callback_data: "previousQuestion" },
                                    { text: "Next Q", callback_data: "nextQuestion" }
                                ], [{ text: "Browse answers", callback_data: "browseAnswer" }]
                            ]
                        },
                    });
                    stateio_1.default.writeStates(count_2, lastInputText, items[count_2].question_id);
                }
                else {
                    // TODO Send toast message instead.
                }
                return [3 /*break*/, 3];
            case 2:
                e_3 = _a.sent();
                ctx.reply(e_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
bot.action("browseAnswer", function (ctx) { return __awaiter(_this, void 0, void 0, function () {
    var currentState, response, items, message, item;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                currentState = stateio_1.default.readStates();
                return [4 /*yield*/, axios_1.default.get(config_1.default.API_BASE_URL + ("/questions/" + currentState.currentQuestionId + "/answers?site=stackoverflow&filter=withbody"))];
            case 1:
                response = _a.sent();
                items = response.data.items;
                message = '';
                for (item in items) {
                    message += "\n*Answer " + (parseInt(item) + 1) + "*\n" + html_to_text_1.default.fromString(items[item].body) + "\n================================================";
                }
                ctx.telegram.sendMessage(ctx.chat.id, message, {
                    parse_mode: "Markdown"
                });
                return [2 /*return*/];
        }
    });
}); });
bot.launch();
//# sourceMappingURL=bot.js.map