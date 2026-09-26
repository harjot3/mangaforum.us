import { catalogRequest } from "@/lib/catalog-server";
import { ApiError } from "@/lib/api";

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const url = new URL(request.url);
  try {
    const result = await catalogRequest(`/${path.join("/")}${url.search}`);
    return Response.json(result.data, {
      headers: {
        "Cache-Control": "no-store",
        "X-Catalog-Source": result.source,
      },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    return Response.json(
      {
        error:
          status === 404
            ? "Not found"
            : status === 400
              ? "Invalid catalog request"
              : "Catalog unavailable",
      },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
