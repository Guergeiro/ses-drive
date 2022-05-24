export async function json(res: Response) {
  if (res.status === 204) {
    return { message: res.statusText };
  }
  const json = await res.json();
  if (res.status >= 400) {
    throw new Error(json.message);
  }
  return json;
}
