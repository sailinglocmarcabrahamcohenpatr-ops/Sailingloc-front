import type { NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_API_URL ?? "https://api.dsp-dev-o24a-g1.cloud/api";

async function handler(
  request: NextRequest,
  ctx: RouteContext<"/api/[...path]">
) {
  const { path } = await ctx.params;
  const search = new URL(request.url).search;
  const base = BACKEND.replace(/\/+$/, "");
  const segments = path.filter(Boolean).join("/");
  const url = `${base}/${segments}${search}`;

  const headers = new Headers();
  const ct = request.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  const auth = request.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  const hasBody = ["POST", "PUT", "PATCH"].includes(request.method);
  const body = hasBody ? await request.text() : undefined;

  const res = await fetch(url, {
    method: request.method,
    headers,
    body,
  });

  const data = await res.arrayBuffer();

  return new Response(data, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
