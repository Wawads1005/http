import Net from "node:net";
import { Route, RouteController, RouteInput } from "@/lib/route";
import { Request, RequestMethod } from "@/lib/request";
import z from "zod";
import { URL, URLInput } from "@/lib/url";
import { Response, ResponseInput } from "@/lib/response";
import { Headers } from "@/lib/headers";

type ServerPort = z.infer<typeof serverPort>;
type ServerHostname = z.infer<typeof serverHostname>;
type ServerAddress = z.infer<typeof serverAddress>;
type ServerInput = z.infer<typeof serverInput>;

const serverPort = z.number();
const serverHostname = z.string();
const serverAddress = z.object({
  port: serverPort,
  hostname: serverHostname,
});
const serverInput = z.object({
  address: serverAddress,
});

class Server {
  private server: Net.Server;
  private routes: Route[];
  private address: ServerAddress;

  constructor(input: ServerInput) {
    this.server = new Net.Server();
    this.routes = [];
    this.address = input.address;

    this.server.addListener("connection", this.onConnection.bind(this));
  }

  private onConnection(socket: Net.Socket) {
    socket.on("data", async (buffer: Buffer) => {
      const headDelimiter = Buffer.from("\r\n\r\n");
      const headDelimiterIndex = buffer.indexOf(headDelimiter);

      if (headDelimiterIndex < 0) {
        // TODO: Handle connection timeout
        return;
      }

      const headBuffer = buffer.subarray(0, headDelimiterIndex);
      const dataBuffer = buffer.subarray(
        headDelimiterIndex + headDelimiter.length
      );

      const parsedRequest = Request.parse(headBuffer, dataBuffer);

      const foundRoute = this.routes.find(
        (route) =>
          route.url.pathname === parsedRequest.url.pathname &&
          route.method === parsedRequest.method
      );

      if (!foundRoute) {
        const headers = new Headers();

        const responseInput: ResponseInput = {
          request: parsedRequest,
          headers,
          data: null,
          status: 404,
          statusText: "NOT FOUND",
        };
        const response = new Response(responseInput);
        const responseBuffer = response.toBuffer();

        socket.end(responseBuffer);
        return;
      }

      const response = await foundRoute.controller(parsedRequest);
      const responseBuffer = response.toBuffer();

      socket.end(responseBuffer);
    });
  }

  addRoute(
    pathname: string,
    method: RequestMethod,
    controller: RouteController
  ) {
    const urlInput: URLInput = {
      hostname: this.address.hostname,
      pathname: pathname,
      protocol: "http",
      search: "",
    };
    const url = new URL(urlInput);
    const routeInput: RouteInput = {
      controller,
      method,
      url,
    };

    const route = new Route(routeInput);
    this.routes = [...this.routes, route];
  }

  listen() {
    this.server.listen(this.address.port, this.address.hostname);

    this.server.addListener("listening", () => {
      console.log(
        `Server running on port: http://${this.address.hostname}:${this.address.port}`
      );
    });
  }
}

export type { ServerAddress, ServerHostname, ServerPort, ServerInput };
export { Server };
