interface Env {
  DB: D1Database;
  ADMIN_TOKEN: string;
  R2_PUBLIC_URL?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM listings ORDER BY created_at DESC LIMIT 100"
  ).all();
  const base = env.R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";
  const withUrls = (results as any[]).map((r) => ({
    ...r,
    image_url: r.image_key ? `${base}/${r.image_key}` : null,
  }));
  return Response.json(withUrls, {
    headers: { "cache-control": "public, max-age=30" },
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }
  const b = await request.json<any>();
  if (!b?.title || typeof b.price !== "number") {
    return new Response("Missing title or price", { status: 400 });
  }
  const res = await env.DB.prepare(
    `INSERT INTO listings (title, price, beds, baths, area, community, type, image_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      b.title,
      b.price,
      b.beds ?? null,
      b.baths ?? null,
      b.area ?? null,
      b.community ?? null,
      b.type ?? null,
      b.image_key ?? null
    )
    .run();
  return Response.json({ ok: true, id: res.meta.last_row_id });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });
  await env.DB.prepare("DELETE FROM listings WHERE id = ?").bind(id).run();
  return Response.json({ ok: true });
};
