"use client";

import { useState } from "react";
import { runWorkflow } from "../actions/workflow";

export default function WorkflowPage() {
  const [xmlInput, setXmlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);

  const handleRun = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setWorkflowId(null);

    try {
      const response = await runWorkflow(xmlInput);
      if (response.success && response.results) {
        setResults(response.results);
      } else {
        setError(response.error || "Unknown error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunVercel = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setWorkflowId(null);

    try {
      const response = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xmlContent: xmlInput }),
      });

      const data = await response.json();

      if (response.ok) {
        setWorkflowId(data.workflowId);
      } else {
        setError(data.error || "Failed to start workflow");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Vercel Workflow POC</h1>

      <div className="mb-6">
        <label htmlFor="xmlInput" className="block text-sm font-medium mb-2">
          Paste Lhéo XML Content
        </label>
        <textarea
          id="xmlInput"
          className="w-full h-64 p-4 border rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
          value={xmlInput}
          onChange={(e) => setXmlInput(e.target.value)}
          placeholder="<lheo>...</lheo>"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleRun}
          disabled={isLoading || !xmlInput.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Running..." : "Run Locally"}
        </button>

        <button
          type="button"
          onClick={handleRunVercel}
          disabled={isLoading || !xmlInput.trim()}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg viewBox="0 0 76 65" fill="currentColor" className="w-4 h-4" aria-label="Vercel Logo">
            <title>Vercel Logo</title>
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
          </svg>
          {isLoading ? "Starting..." : "Run with Vercel Workflow"}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {workflowId && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <h3 className="font-bold mb-2">Workflow Started</h3>
          <p>Workflow ID: <code className="bg-green-100 px-2 py-1 rounded">{workflowId}</code></p>
          <p className="mt-2 text-sm">
            Check the <a href="http://localhost:3000/workflow-dashboard" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Workflow Dashboard</a> (if enabled) or server logs for progress.
          </p>
        </div>
      )}

      {results && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <div className="grid gap-4">
            {Object.entries(results).map(([filename, path]) => (
              <div key={filename} className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">{filename}</h3>
                <div className="flex items-center justify-between">
                  <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                    {path}
                  </code>
                  {path.startsWith("Error") ? (
                    <span className="text-red-500 text-sm">Failed</span>
                  ) : (
                    <span className="text-green-500 text-sm">Generated</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Files have been saved to the <code>output</code> directory in the project root.
          </p>
        </div>
      )}
    </div>
  );
}
