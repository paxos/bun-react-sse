import EventEmitter from "events";
import { randomUUID } from "crypto";

console.log("Good Morning!");

const eventEmitter = new EventEmitter();

// eventEmitter.on("sse", () => {
//   console.log("Emitter emitted");
// });

const lorem =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

const lorems = lorem.split(" ");

let counter = 0;
setInterval(() => {
  const randomLorem = lorems[Math.floor(Math.random() * lorems.length)];
  eventEmitter.emit("sse", randomLorem);
}, 200);

Bun.serve({
  port: 8081,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") return new Response("Home page!");
    if (url.pathname === "/sse") {
      let outputStream = new ReadableStream({
        start(controller) {
          console.log("START?");
          // eventEmitter.once("sse", () => {
          //   controller.enqueue(`retry: 3000\n\n`);
          // });
          eventEmitter.on("sse", (data) => {
            console.log("EVENT");
            console.log(data);
            const queue = [Buffer.from(data)];
            const chunk = queue.shift();
            controller.enqueue(chunk);
          });
        },
        // pull(controller: ReadableStreamDefaultController) {},
        cancel(controller: ReadableStreamDefaultController) {
          eventEmitter.removeAllListeners("sse");
          controller.close();
        },
      });

      return new Response(outputStream, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "text/event-stream;charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Access-Control-Allow-Headers": "*",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    return new Response("Bun!");
  },
});
