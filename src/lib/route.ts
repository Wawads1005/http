import z from "zod";
import { Request, requestMethod, RequestMethod } from "@/lib/request";
import { URL } from "@/lib/url";
import { Response } from "@/lib/response";

type RouteController = z.infer<typeof routeController>;
type RouteInput = z.infer<typeof routeInput>;

const routeController = z
  .function()
  .args(z.instanceof(Request))
  .returns(z.promise(z.instanceof(Response)));

const routeInput = z.object({
  controller: routeController,
  method: requestMethod,
  url: z.instanceof(URL),
});

class Route {
  controller: RouteController;
  method: RequestMethod;
  url: URL;

  constructor(input: RouteInput) {
    this.controller = input.controller;
    this.method = input.method;
    this.url = input.url;
  }
}

export type { RouteController, RouteInput };
export { Route };
