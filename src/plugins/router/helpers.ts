export function toSearchString(query: any) {
  const params = new URLSearchParams();
  for (const key in query) {
    if (query.hasOwnProperty(key) && query[key] !== undefined) {
      params.append(key, query[key]);
    }
  }
  return `?${params.toString()}` || "";
}

export function parseSearchString(url: string) {
  const obj: Record<string, any> = {};
  let queryString = url.split("?")[1];
  if (queryString !== undefined) {
    queryString = queryString.split("#")[0];
    const pairs = queryString.split("&");

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split("=");
      const key = decodeURIComponent(pair[0]);
      const value = decodeURIComponent(pair[1] || "");
      if (obj[key] === undefined) {
        obj[key] = value;
      } else if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else {
        obj[key] = [obj[key], value];
      }
    }
  }
  return obj;
}
