import { parse, stringify } from "querystring";

export const toSearchString = (query: any = {}) => {
  const s = stringify(
    Object.keys(query)
      .filter((key) => query[key] !== undefined)
      .reduce((p, c) => ({ ...p, [c]: query[c] }), {}),
  );

  return s ? `?${s}` : "";
};

export function parseSearchString<T extends ReturnType<typeof parse> = any>(search: string): T {
  if (search.startsWith("?")) {
    search = search.slice(1);
  }
  return parse(search) as any;
}
