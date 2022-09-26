import http from "http";
import fs from "fs";
import { WebSocketServer } from "ws";
import path from "path";

class User {
  constructor(public nick: string) {}
}

const users: User[] = [];

const server = http.createServer({}, (request, response) => {
  const { method, url } = request;

  if (method === "POST") {
    if (url === "/register") {
      let data: any = "";
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
        } else {
          users.push(user);

          response.statusCode = 200;
          response.setHeader("content-type", "application/json");
          response.end(JSON.stringify(user));
        }
      });
    }
  } else if (method === "GET" && url === "/") {
    const page = fs.readFileSync(path.resolve(__dirname, "../view/index.html"));

    response.setHeader("content-type", "text/html; charset=UTF-8");
    response.end(page);
  }
});

const wsServer = new WebSocketServer({ server });

wsServer.on("connection", (ws) => {
  ws.addEventListener("message", ({ data }) => {
    const _data = JSON.parse(<any>data);

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
