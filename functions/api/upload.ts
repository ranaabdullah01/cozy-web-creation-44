interface Env {
  BUCKET: R2Bucket;
  ADMIN_TOKEN: string;
  R2_PUBLIC_URL?: string;
}

// POST /api/upload  (multipart/form-data with field "file")
// Returns { key, url }
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return new Response("No file", { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return new Response("File too large (10MB max)", { status: 413 });
  }

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  await env.BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });

  const base = env.R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";
  return Response.json({ key, url: base ? `${base}/${key}` : null });
};
