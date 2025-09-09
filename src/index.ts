import { Server, ServerAddress, ServerInput } from "@/lib/server";
import {
  Response,
  ResponseData,
  ResponseInput,
  ResponseStatus,
  ResponseStatusText,
} from "@/lib/response";
import { Headers } from "@/lib/headers";

const serverAddress: ServerAddress = {
  hostname: "127.0.0.1",
  port: 3000,
};
const serverInput: ServerInput = {
  address: serverAddress,
};
const server = new Server(serverInput);

server.addRoute("/", "GET", async (request) => {
  const body = JSON.stringify({ message: "Hello, World!" });

  const responseStatus: ResponseStatus = 200;
  const responseStatusText: ResponseStatusText = "OK";
  const responseData: ResponseData = Buffer.from(body, "utf-8");
  const responseHeaders = new Headers();

  responseHeaders.set("content-type", "application/json");
  responseHeaders.set("content-length", `${body.length}`);
  responseHeaders.set("connection", "close");

  const responseInput: ResponseInput = {
    request,
    headers: responseHeaders,
    data: responseData,
    status: responseStatus,
    statusText: responseStatusText,
  };
  const response = new Response(responseInput);

  return response;
});

server.listen();
