import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  const [content, setContent] = useState("");

  const sendRequest = async () => {
    const response = await fetch("http://localhost:8081/sse", {
      method: "POST",
      headers: {
        "Content-Type": "text/event-stream",
      },
      body: null,
    });

    if (!response.body) {
      return;
    }

    // To recieve data as a string we use TextDecoderStream class in pipethrough
    // const reader = response.body
    //   .pipeThrough(new TextDecoderStream())
    //   .getReader();

    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (content) {
        setContent(content + value);
        console.log("Received", value);
      }
    }

    // To receive data as byte array we call getReader() directrly
    // const reader = response.body.getReader();
  };

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Streaming Demo</h1>
      <div className="card">
        <button onClick={() => sendRequest()}>Connect!</button>
      </div>

      <textarea value={content} cols={50} rows={30}></textarea>
    </>
  );
}

export default App;
