/** Laravel JsonResource collections: plain array or `{ data: [...] }` */
export function resourceList(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}
