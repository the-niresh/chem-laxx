import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { chatStream } from "./streaming";
import { streamChatChat } from "./chat";
import { httpAction } from "./_generated/server";


const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/chat-stream",
  method: "POST",
  handler: streamChatChat,
});

http.route({
    path: "/chat-stream",
    method: "OPTIONS",
    handler: httpAction(async (_, request) => {
      const headers = request.headers;
      console.log("$$$$$$$$$$$$$$$$$$$$$$")
      if (
        headers.get("Origin") !== null &&
        headers.get("Access-Control-Request-Method") !== null &&
        headers.get("Access-Control-Request-Headers") !== null
      ) {
        return new Response(null, {
          headers: new Headers({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type, Digest, Authorization",
            "Access-Control-Max-Age": "86400",
          }),
        });
      } else {
        return new Response();
      }
    }),
  });

export default http;