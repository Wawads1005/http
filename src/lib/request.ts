import z from "zod";
import { URL } from "@/lib/url";
import { Headers } from "@/lib/headers";

type RequestMethod = z.infer<typeof requestMethod>;
type RequestProtocol = z.infer<typeof requestProtocol>;
type RequestInput = z.infer<typeof requestInput>;

const requestMethod = z.enum(["GET", "POST", "PUT", "DELETE"]);
const requestProtocol = z.enum(["HTTP/1.1"]);
const requestInput = z.object({
  method: requestMethod,
  protocol: requestProtocol,
  headers: z.instanceof(Headers),
  url: z.instanceof(URL),
  data: z.union([z.instanceof(Buffer), z.null()]),
});

class Request {
  method: RequestMethod;
  protocol: RequestProtocol;
  headers: Headers;
  url: URL;
  data: Buffer | null;

  constructor(input: RequestInput) {
    this.method = input.method;
    this.protocol = input.protocol;
    this.headers = input.headers;
    this.url = input.url;
    this.data = input.data;
  }

  static parse(headBuffer: Buffer, dataBuffer: Buffer | null) {
    const requestDelimiter = Buffer.from("\r\n");
    const requestDelimiterIndex = headBuffer.indexOf(requestDelimiter);

    if (requestDelimiterIndex < 0) {
      throw new Error("Invalid Request");
    }

    const requestBuffer = headBuffer.subarray(0, requestDelimiterIndex);
    const headersBuffer = headBuffer.subarray(
      requestDelimiter.length + requestDelimiterIndex
    );

    const requestLine = requestBuffer.toString("utf-8");
    const requestLines = requestLine.split(" ");

    const [method, path, protocol] = requestLines;

    const parsedMethod = requestMethod.parse(method);
    const parsedProtocol = requestProtocol.parse(protocol);
    const parsedHeaders = Headers.parse(headersBuffer);

    const [urlPathname, urlSearch] = path?.split("?") ?? "";
    const urlHostname = parsedHeaders.get("host") ?? "";
    const urlProtocol = parsedProtocol === "HTTP/1.1" ? "http" : "http";
    const url = `${urlProtocol}://${urlHostname}${
      urlPathname !== "/" ? urlPathname : ""
    }${urlSearch ? `?${urlSearch}` : ""}`;

    const parsedURL = URL.parse(url);

    const requestInput: RequestInput = {
      method: parsedMethod,
      headers: parsedHeaders,
      protocol: parsedProtocol,
      url: parsedURL,
      data: dataBuffer,
    };
    const request = new Request(requestInput);

    return request;
  }
}

export type { RequestMethod };
export { Request, requestMethod };
