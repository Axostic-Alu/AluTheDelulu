import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const filePath = join(
    process.cwd(),
    "src",
    "app",
    "projects",
    "physical layer.html"
  );

  try {
    const html = readFileSync(filePath, "utf-8");
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch {
    return new Response("Presentation not found", { status: 404 });
  }
}