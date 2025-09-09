class Headers {
  private headers: Map<string, string>;

  constructor() {
    this.headers = new Map<string, string>();
  }

  private standardizeKey(key: string) {
    const standardKey = key.toLowerCase();

    return standardKey;
  }

  get(key: string) {
    const standardKey = this.standardizeKey(key);
    const foundProperty = this.headers.get(standardKey);

    return foundProperty;
  }

  set(key: string, value: string) {
    const standardKey = this.standardizeKey(key);

    this.headers.set(standardKey, value);
  }

  entries() {
    const entries = this.headers.entries();

    return entries;
  }

  toString() {
    const headersLines = Array.from(this.headers.entries()).map(
      ([key, value]) => `${key}: ${value}`
    );
    const headersLine = headersLines.join("\r\n");

    return headersLine;
  }

  toBuffer() {
    const headersLine = this.toString();
    const headersBuffer = Buffer.from(headersLine, "utf-8");

    return headersBuffer;
  }

  static parse(buffer: Buffer) {
    const headersLine = buffer.toString("utf-8");
    const headersLines = headersLine.split("\r\n");

    const headers = new Headers();

    for (const headersLine of headersLines) {
      const [key, value] = headersLine.split(": ");

      if (!key || !value) {
        continue;
      }

      headers.set(key, value);
    }

    return headers;
  }
}

export { Headers };
