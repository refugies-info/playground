import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // TODO: For production, use a persistent backend or the official SDK if available.
    // This local file reading only works in development with the default workflow backend.
    const runPath = path.join(
      process.cwd(),
      ".next/workflow-data/runs",
      `${id}.json`,
    );

    try {
      const fileContent = await fs.readFile(runPath, "utf-8");
      const run = JSON.parse(fileContent);
      return NextResponse.json(run);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return NextResponse.json(
          { error: "Workflow run not found" },
          { status: 404 },
        );
      }
      throw err;
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Log error
    console.error("Error fetching workflow run:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow run" },
      { status: 500 },
    );
  }
}
