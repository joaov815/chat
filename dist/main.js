"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const ws_1 = require("ws");
const path_1 = __importDefault(require("path"));
class User {
    constructor(nick) {
        this.nick = nick;
    }
}
const users = [];
const server = http_1.default.createServer({}, (request, response) => {
    const { method, url } = request;
    if (method === "POST") {
        if (url === "/register") {
            let data = "";
            request.on("data", (chunk) => {
                data += chunk;
            });
            request.on("end", () => {
                const data2 = JSON.parse(data);
                const user = new User(data2.nick);
                if (users.some(({ nick }) => nick === user.nick)) {
                    response.statusCode = 409;
                    response.end({
                        message: "Nick já usado, utilize outro!",
                    });
                }
                else {
                    users.push(user);
                    response.statusCode = 200;
                    response.setHeader("content-type", "application/json");
                    response.end(JSON.stringify(user));
                }
            });
        }
    }
    else if (method === "GET" && url === "/") {
        const page = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../view/index.html"));
        console.log(__dirname);
        response.setHeader("content-type", "text/html; charset=UTF-8");
        response.end(page);
    }
});
const wsServer = new ws_1.WebSocketServer({ server });
wsServer.on("connection", (ws) => {
    ws.addEventListener("message", ({ data }) => {
        const _data = JSON.parse(data);
        if (!users.some(({ nick }) => nick === _data.nick)) {
            return;
        }
        wsServer.clients.forEach((client) => {
            client.send(data);
        });
    });
    console.log("nova conexao");
});
server.listen(3000);
