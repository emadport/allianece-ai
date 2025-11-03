import { ApolloServer, HeaderMap } from "@apollo/server";
import { typeDefs } from "../../graphql/schema";
import { resolvers } from "../../graphql/resolvers";
import { NextRequest } from "next/server";

let apolloServerInstance: ApolloServer | null = null;

async function getApolloServer() {
  if (!apolloServerInstance) {
    apolloServerInstance = new ApolloServer({ typeDefs, resolvers });
    await apolloServerInstance.start();
  }
  return apolloServerInstance;
}

async function handleRequest(request: NextRequest) {
  const server = await getApolloServer();
  const url = new URL(request.url);

  const headers = new HeaderMap();
  for (const [key, value] of request.headers.entries()) {
    headers.set(key, value);
  }

  const body =
    request.method === "GET"
      ? { query: url.searchParams.get("query") || "{ hello }" }
      : await request.json();

  const response = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      method: request.method,
      headers,
      search: url.search,
      body,
    },
    context: async () => ({ req: request }),
  });

  // Convert response.body to string
  let bodyString = "";

  if (response.body.kind === "complete") {
    bodyString = response.body.string;
  } else {
    // For chunked responses
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.body.asyncIterator) {
      if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk, "utf-8"));
      } else {
        chunks.push(chunk);
      }
    }
    bodyString = Buffer.concat(chunks).toString("utf-8");
  }

  return new Response(bodyString, {
    status: response.status || 200,
    headers: Object.fromEntries(response.headers),
  });
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
