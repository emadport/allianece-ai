import { ApolloServer } from "@apollo/server";
import { NextRequest } from "next/server";
import { typeDefs } from "../../graphql/schema";
import { resolvers } from "../../graphql/resolvers";

let apolloServerInstance: ApolloServer | null = null;

async function getApolloServer() {
  if (!apolloServerInstance) {
    apolloServerInstance = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await apolloServerInstance.start();
  }
  return apolloServerInstance;
}

export async function GET(request: NextRequest) {
  const server = await getApolloServer();
  const url = new URL(request.url);

  const response = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: { query: url.searchParams.get("query") || "{ hello }" },
    },
    context: async () => ({ req: request }),
  });

  return new Response(response.body.string, {
    status: response.status,
    headers: response.headers,
  });
}

export async function POST(request: NextRequest) {
  const server = await getApolloServer();

  const body = await request.json();

  const response = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
    },
    context: async () => ({ req: request }),
  });

  return new Response(response.body.string, {
    status: response.status,
    headers: response.headers,
  });
}
