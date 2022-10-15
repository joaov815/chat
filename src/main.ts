import http from "http";
import fs from "fs";
import { WebSocketServer } from "ws";
import path from "path";

class User {
  constructor(public nickname: string) {}
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
        const parsedData = JSON.parse(data);
        const user = new User(parsedData.nickname);

        if (users.some(({ nickname }) => nickname === user.nickname)) {
          response.statusCode = 409;
          response.end({
            message: "nickname já usado, utilize outro!",
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

    if (!users.some(({ nickname }) => nickname === _data.nickname)) {
      return;
    }

    wsServer.clients.forEach((client) => {
      client.send(data);
    });
  });
  console.log("New connection");
});

server.listen(3000);
