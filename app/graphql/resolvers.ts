export const resolvers = {
  Query: {
    hello: () => "Hello from Apollo Server!",

    health: () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        pythonAPI: "connected",
        database: "connected",
      },
    }),

    getUsers: () => {
      // Mock data - replace with actual database query
      return [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          createdAt: new Date().toISOString(),
        },
      ];
    },

    getUser: (_: any, { id }: { id: string }) => {
      // Mock data - replace with actual database query
      return {
        id,
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date().toISOString(),
      };
    },
  },

  Mutation: {
    createUser: (
      _: any,
      { input }: { input: { name: string; email: string } }
    ) => {
      // Mock data - replace with actual database insert
      return {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...input,
        createdAt: new Date().toISOString(),
      };
    },

    updateUser: (
      _: any,
      { id, input }: { id: string; input: { name?: string; email?: string } }
    ) => {
      // Mock data - replace with actual database update
      return {
        id,
        name: input.name || "John Doe",
        email: input.email || "john@example.com",
        createdAt: new Date().toISOString(),
      };
    },

    deleteUser: (_: any, { id }: { id: string }) => {
      // Mock data - replace with actual database delete
      return true;
    },
  },
};
