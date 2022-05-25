export function headers(key: string, json = true) {
  const headers: HeadersInit = {
    "x-api-key": key,
  };
  if (json === true) {
    headers["content-type"] = "application/json";
  }
  return headers;
}
