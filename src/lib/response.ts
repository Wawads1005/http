import z from "zod";
import { Headers } from "@/lib/headers";
import { Request } from "@/lib/request";

type ResponseData = z.infer<typeof responseData>;
type ResponseStatus = z.infer<typeof responseStatus>;
type ResponseStatusText = z.infer<typeof responseStatusText>;
type ResponseInput = z.infer<typeof responseInput>;

const responseStatus = z.number();
const responseStatusText = z.string();
const responseData = z.union([z.instanceof(Buffer), z.null()]);
const responseInput = z.object({
  status: responseStatus,
  statusText: responseStatusText,
  data: responseData,
  headers: z.instanceof(Headers),
  request: z.instanceof(Request),
});

class Response {
  headers: Headers;
  request: Request;
  data: ResponseData;
  status: ResponseStatus;
  statusText: ResponseStatusText;

  constructor(input: ResponseInput) {
    this.headers = input.headers;
    this.request = input.request;
    this.data = input.data;
    this.status = input.status;
    this.statusText = input.statusText;
  }

  toString() {
    const statusLine = `${this.request.protocol} ${this.status} ${this.statusText}`;
    const headersLine = this.headers.toString();
    const dataLine = this.data?.toString("utf-8") ?? "";
    const responseLine = [statusLine, headersLine, "", dataLine].join("\r\n");

    return responseLine;
  }

  toBuffer() {
    const responseLine = this.toString();
    const responseBuffer = Buffer.from(responseLine, "utf-8");

    return responseBuffer;
  }
}

export type { ResponseInput, ResponseData, ResponseStatus, ResponseStatusText };
export { Response };
