export async function analyzeRetinaImage(file: File) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  const url = apiUrl ? `${apiUrl}/analyze` : "/analyze";

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `Failed to analyze image (${response.status})`;
    try {
      const json = JSON.parse(text);
      message = json.detail || json.message || message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return response.json();
}
