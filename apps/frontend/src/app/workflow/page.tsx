"use client";

import { useState } from "react";
import { runWorkflow } from "../actions/workflow";

export default function WorkflowPage() {
  const [xmlInput, setXmlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

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

      <button
        onClick={handleRun}
        disabled={isLoading || !xmlInput.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Running Workflow..." : "Run Workflow"}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
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
