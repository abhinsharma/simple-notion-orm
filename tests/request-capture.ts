import { server } from "./setup-msw";

export type CapturedRequest = {
  url: string;
  headers: Headers;
  body: unknown;
};

/**
 * Resolve with the first request that matches the predicate. Register it before making the call.
 */
export function captureNextRequest(predicate: (request: Request) => boolean): Promise<CapturedRequest> {
  return new Promise((resolve) => {
    const listener = ({ request }: { request: Request }) => {
      if (!predicate(request)) {
        return;
      }
      server.events.removeListener("request:start", listener);
      void request
        .clone()
        .json()
        .catch(() => undefined)
        .then((body) => resolve({ url: request.url, headers: request.headers, body }));
    };
    server.events.on("request:start", listener);
  });
}
