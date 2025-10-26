"use client";

import { ApolloWrapper } from "../../components/apollo-wrapper";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_HELLO,
  GET_HEALTH,
  GET_USERS,
  CREATE_USER,
} from "../graphql/queries";
import { useState } from "react";

function GraphQLDemoContent() {
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  const { data: helloData, loading: helloLoading } = useQuery(GET_HELLO);
  const { data: healthData, loading: healthLoading } = useQuery(GET_HEALTH);
  const {
    data: usersData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useQuery(GET_USERS);

  const [createUser, { loading: createLoading }] = useMutation(CREATE_USER, {
    onCompleted: () => {
      setNewUserName("");
      setNewUserEmail("");
      refetchUsers();
    },
  });

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail) return;

    await createUser({
      variables: {
        input: {
          name: newUserName,
          email: newUserEmail,
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col p-8 bg-zinc-50 dark:bg-black">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            Apollo GraphQL Demo
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Interactive GraphQL queries and mutations
          </p>
        </div>

        {/* Hello Query */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Hello Query
          </h2>
          {helloLoading ? (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">Loading...</p>
          ) : (
            <p className="mt-2 text-lg text-zinc-900 dark:text-zinc-100">
              {helloData?.hello}
            </p>
          )}
        </div>

        {/* Health Query */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Health Status
          </h2>
          {healthLoading ? (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">Loading...</p>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-zinc-900 dark:text-zinc-100">
                Status:{" "}
                <span className="font-semibold text-green-600">
                  {healthData?.health.status}
                </span>
              </p>
              <p className="text-zinc-900 dark:text-zinc-100">
                Timestamp:{" "}
                <span className="font-mono text-sm">
                  {healthData?.health.timestamp}
                </span>
              </p>
              {healthData?.health.services && (
                <div className="mt-4 space-y-1">
                  <p className="text-zinc-900 dark:text-zinc-100">
                    Python API:{" "}
                    <span className="font-semibold">
                      {healthData.health.services.pythonAPI}
                    </span>
                  </p>
                  <p className="text-zinc-900 dark:text-zinc-100">
                    Database:{" "}
                    <span className="font-semibold">
                      {healthData.health.services.database}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create User Mutation */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Create New User
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full rounded border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full rounded border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <button
              onClick={handleCreateUser}
              disabled={createLoading || !newUserName || !newUserEmail}
              className="rounded bg-zinc-900 px-4 py-2 font-semibold text-zinc-50 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {createLoading ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Users
          </h2>
          {usersLoading ? (
            <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
          ) : (
            <div className="space-y-2">
              {usersData?.getUsers?.map((user: any) => (
                <div
                  key={user.id}
                  className="rounded border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {user.name}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {user.email}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    Created: {new Date(user.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GraphQL Endpoint */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            GraphQL Playground
          </h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Visit{" "}
            <code className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
              /api/graphql
            </code>{" "}
            to access the GraphQL endpoint
          </p>
          <div className="rounded bg-zinc-100 p-4 dark:bg-zinc-800">
            <p className="font-mono text-xs text-zinc-900 dark:text-zinc-100">
              POST http://localhost:3000/api/graphql
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GraphQLDemo() {
  return (
    <ApolloWrapper>
      <GraphQLDemoContent />
    </ApolloWrapper>
  );
}
