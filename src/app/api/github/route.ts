import { NextResponse } from "next/server";

const githubHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner")?.trim();
  const repo = searchParams.get("repo")?.trim();
  const resource = searchParams.get("resource");

  if (!owner || !repo || !["apis", "issues", "pulls"].includes(resource || "")) {
    return NextResponse.json({ error: "Provide a repository owner, name, and a supported resource." }, { status: 400 });
  }

  try {
    if (resource === "apis") {
      const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/HEAD?recursive=1`, { headers: githubHeaders, cache: "no-store" });
      if (!response.ok) return githubError(response);
      const tree = await response.json();
      const items = (tree.tree || [])
        .filter((entry: { type: string; path: string }) => entry.type === "blob" && /(api|apis|route|routes|endpoint|controller|graphql|openapi|swagger)/i.test(entry.path))
        .slice(0, 30)
        .map((entry: { path: string }, index: number) => ({
          id: index,
          path: entry.path,
          name: entry.path.split("/").pop(),
          html_url: `https://github.com/${owner}/${repo}/blob/HEAD/${entry.path}`,
        }));
      return NextResponse.json({ items });
    }

    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${resource}?state=open&per_page=30`, { headers: githubHeaders, cache: "no-store" });
    if (!response.ok) return githubError(response);
    const items = await response.json();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("GitHub explorer error:", error);
    return NextResponse.json({ error: "GitHub data is temporarily unavailable." }, { status: 502 });
  }
}

async function githubError(response: Response) {
  if (response.status === 404) return NextResponse.json({ error: "Repository or resource not found." }, { status: 404 });
  if (response.status === 403) return NextResponse.json({ error: "GitHub API rate limit reached. Try again later." }, { status: 429 });
  return NextResponse.json({ error: "GitHub could not load this resource." }, { status: response.status });
}
