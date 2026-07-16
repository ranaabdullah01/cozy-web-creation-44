interface Env {
  BUCKET: R2Bucket;
}

// Fallback: serve R2 objects through the app if the bucket is private.
// If your R2 bucket is public (recommended), you can ignore this endpoint
// and use the public R2 URL directly.
export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const key = decodeURIComponent(String(params.key));
  const obj = await env.BUCKET.get(key);
  if (!obj) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=3600");
  return new Response(obj.body, { headers });
};
