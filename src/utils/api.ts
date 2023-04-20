export interface APIResponse<T = any> {
  error?: string;
  data?: T;
}

export async function generateScript(
  prompt: string
): Promise<APIResponse<"success">> {
  const req = await fetch("http://localhost:3001/generateScript", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const res = await req.json();

  return res as APIResponse<"success">;
}
