import { Elysia, t } from "elysia";

const app = new Elysia()
  .ws("/ws", {
    body: t.Object({
      draw: t.Object({
        color: t.String(),
        strokeSize: t.Number(),
        pathString: t.String()
      }),
    }),
    message(ws, { draw }) {
      ws.publish("group", draw, true);
    },
    open(ws) {
      console.log("Websocket connection opened");
      ws.subscribe("group");
    },
    close(ws) {
      console.log("Websocket connection closed");
      ws.send("Bye :)");
    },
  })
  .get("/", () => "Hello, World!")
  .listen(5000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
