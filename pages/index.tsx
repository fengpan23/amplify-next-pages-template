import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

type DataStatus = "idle" | "missing-config" | "ready" | "error";

function hasGraphqlProvider() {
  try {
    const config = Amplify.getConfig();
    const apiConfig = (config as { API?: Record<string, any> })?.API;

    if (!apiConfig) {
      return false;
    }

    if (typeof apiConfig?.graphql_endpoint === "string") {
      return true;
    }

    if (typeof apiConfig?.GraphQL?.endpoint === "string") {
      return true;
    }

    if (typeof apiConfig?.aws_appsync_graphqlEndpoint === "string") {
      return true;
    }

    if (
      Array.isArray(apiConfig?.endpoints) &&
      apiConfig.endpoints.some(
        (endpoint) =>
          endpoint?.endpointType === "GraphQL" ||
          typeof endpoint?.endpoint === "string",
      )
    ) {
      return true;
    }
  } catch (error) {
    console.warn("Unable to inspect Amplify config", error);
  }

  return false;
}

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [status, setStatus] = useState<DataStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hasGraphqlProvider()) {
      setStatus("missing-config");
      setErrorMessage(
        "Amplify Data isn't configured locally. Run `npx ampx generate outputs --branch <env>` or deploy the backend to produce amplify_outputs.json.",
      );
      return;
    }

    setStatus("ready");

    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
      error: (error) => {
        console.error("Failed to load todos from Amplify Data", error);
        setStatus("error");
        setErrorMessage("Unable to connect to Amplify Data. Check API outputs.");
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  function createTodo() {
    if (status !== "ready") {
      window.alert(
        "Amplify Data is not ready yet. Configure the backend before creating todos.",
      );
      return;
    }

    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      {status === "missing-config" || status === "error" ? (
        <div role="alert" style={{ marginTop: "1rem", color: "#b22222" }}>
          {errorMessage}
        </div>
      ) : null}
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/gen2/start/quickstart/nextjs-pages-router/">
          Review next steps of this tutorial.
        </a>
      </div>
    </main>
  );
}
