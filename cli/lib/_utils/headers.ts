export function headers(key: string) {
  const headers: HeadersInit = {
    "x-api-key": key,
    "content-type": "application/json",
  };
  return headers;
}
