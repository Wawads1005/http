import z from "zod";

type URLPathname = z.infer<typeof urlPathname>;
type URLHostname = z.infer<typeof urlHostname>;
type URLSearch = z.infer<typeof urlSearch>;
type URLProtocol = z.infer<typeof urlProtocol>;
type URLInput = z.infer<typeof urlInput>;

const urlRegex = /^(http):\/\/([^\/\s?#]+)(\/[^?#]*)?(\?[^#]*)?/;
const urlPathname = z.string();
const urlHostname = z.string();
const urlSearch = z.string();
const urlProtocol = z.enum(["http"]);
const urlInput = z.object({
  pathname: urlPathname,
  hostname: urlHostname,
  search: urlSearch,
  protocol: urlProtocol,
});

class URL {
  pathname: URLPathname;
  hostname: URLHostname;
  search: URLSearch;
  protocol: URLProtocol;

  constructor(input: URLInput) {
    this.pathname = input.pathname;
    this.hostname = input.hostname;
    this.protocol = input.protocol;
    this.search = input.search;
  }

  static parse(stringifiedURL: string) {
    const matched = urlRegex.exec(stringifiedURL);

    if (!matched) {
      throw new Error("Invalid URL");
    }

    const [_, protocol, hostname, pathname = "/", search = ""] = matched;
    const parsedProtocol = urlProtocol.parse(protocol);
    const parsedHostname = urlHostname.parse(hostname);
    const parsedPathname = urlPathname.parse(pathname);
    const parsedSearch = urlSearch.parse(search);

    const urlInput: URLInput = {
      protocol: parsedProtocol,
      hostname: parsedHostname,
      pathname: parsedPathname,
      search: parsedSearch,
    };
    const url = new URL(urlInput);

    return url;
  }
}

export type { URLPathname, URLHostname, URLProtocol, URLInput };
export { URL };
