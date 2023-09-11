import EventEmitter from "events";
import { randomUUID } from "crypto";

console.log("Good Morning!");

const eventEmitter = new EventEmitter();
process.nextTick(() => {
  eventEmitter.emit("sse", 42);
});

const sseEvents = new EventEmitter();
export const sse = (data) => {
  sseEvents.emit(
    "sse",
    `id: ${randomUUID()}\ndata: ${JSON.stringify(data)}\n\n`,
  );
};

let counter = 0;
setInterval(() => {
  sse({ payload: { date: Date.now(), times: counter++ } });
}, 2000);

Bun.serve({
  port: 8081,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") return new Response("Home page!");
    if (url.pathname === "/sse") {
      let outputStream = new ReadableStream({
        // start(controller) {
        //   controller.enqueue("hello");
        //   controller.enqueue("world");
        //   controller.close();
        // },

        start(controller) {
          sseEvents.once("sse", () => {
            controller.enqueue(`retry: 3000\n\n`);
          });
        },
        pull(controller: ReadableStreamDefaultController) {
          sseEvents.on("sse", (data) => {
            const queue = [Buffer.from(data)];
            const chunk = queue.shift();
            controller.enqueue(chunk);
          });
        },
        cancel(controller: ReadableStreamDefaultController) {
          sseEvents.removeAllListeners("sse");
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
