import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_API_URL ?? "https://api.dsp-dev-o24a-g1.cloud/api";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) {
    return NextResponse.json({ error: "Authorization header manquant" }, { status: 401 });
  }

  let body: { id_reservation?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { id_reservation } = body;
  if (!id_reservation) {
    return NextResponse.json({ error: "id_reservation est requis" }, { status: 400 });
  }

  const url = `${BACKEND.replace(/\/+$/, "")}/paiements/stripe/create-intent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify({ id_reservation }),
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
