"use client";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import type { ReactNode } from "react";
import { Component, useState } from "react";
import { api } from "../../../convex/_generated/api";

class QueryErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <pre className="whitespace-pre-wrap rounded bg-red-100 p-4 text-red-900">
          Backend rejected the request:
          {"\n"}
          {this.state.error.message}
        </pre>
      );
    }

    return this.props.children;
  }
}

function AdminLoansQuery() {
  const loans = useQuery(api.admin.getAllLoans);

  return (
    <pre className="whitespace-pre-wrap rounded bg-gray-100 p-4 text-black">
      {JSON.stringify(loans, null, 2)}
    </pre>
  );
}

export default function RbacTestPage() {
  const [runTest, setRunTest] = useState(false);
  const [testNumber, setTestNumber] = useState(0);

  function runAdminTest() {
    setRunTest(false);
    setTestNumber((value) => value + 1);
    setRunTest(true);
  }

  return (
    <main className="space-y-4 p-8">
      <h1 className="text-2xl font-bold">LendLoop RBAC Security Test</h1>

      <AuthLoading>Checking authentication...</AuthLoading>

      <Unauthenticated>
        <p>Please sign in first.</p>
      </Unauthenticated>

      <Authenticated>
        <p>Current test: Admin-only access to all loans.</p>

        <button
          onClick={runAdminTest}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Run Admin Authorization Test
        </button>

        {runTest && (
          <QueryErrorBoundary key={testNumber}>
            <AdminLoansQuery />
          </QueryErrorBoundary>
        )}
      </Authenticated>
    </main>
  );
}
