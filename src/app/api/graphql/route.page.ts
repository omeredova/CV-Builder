import { executeGraphql, parseGraphqlRequest } from "./executeGraphql";

export async function POST(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin || !request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ errors: [{ message: "Invalid request origin or content type" }] }, { status: 403 });
  }
  let input: ReturnType<typeof parseGraphqlRequest>;
  try {
    input = parseGraphqlRequest(await request.json());
  } catch {
    return Response.json({ errors: [{ message: "Invalid GraphQL operation" }] }, { status: 400 });
  }
  try {
    const result = await executeGraphql(input, origin, request.headers.get("authorization"));
    return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ errors: [{ message: "The backend is unavailable. Please try again." }] }, {
      status: 502, headers: { "Cache-Control": "private, no-store" },
    });
  }
}
