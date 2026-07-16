interface Env {
  DB: D1Database;
  ADMIN_TOKEN: string;
  R2_PUBLIC_URL?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM communities ORDER BY id DESC"
  ).all();
  const base = env.R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";
  return Response.json(
    (results as any[]).map((r) => ({
      ...r,
      image_url: r.image_key ? `${base}/${r.image_key}` : null,
    }))
  );
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }
  const b = await request.json<any>();
  if (!b?.name) return new Response("Missing name", { status: 400 });
  const res = await env.DB.prepare(
    "INSERT INTO communities (name, image_key) VALUES (?, ?)"
  )
    .bind(b.name, b.image_key ?? null)
    .run();
  return Response.json({ ok: true, id: res.meta.last_row_id });
};
