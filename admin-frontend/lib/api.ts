import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

function getAdminApiKey() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^|;)\s*admin_api_key=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : null;
}

const apiClient = axios.create({
  baseURL: `${backendUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const apiKey = getAdminApiKey();
  if (apiKey) {
    config.headers = config.headers ?? {};
    config.headers["x-api-key"] = apiKey;
  }
  return config;
});

export async function fetchEmpresas() {
  const response = await apiClient.get("/admin/empresas");
  return response.data;
}

export async function createEmpresa(data: { name: string; tenantId: string; webhookToken: string; status: string }) {
  const response = await apiClient.post("/admin/empresas", data);
  return response.data;
}

export async function deleteEmpresa(id: string) {
  const response = await apiClient.delete(`/admin/empresas/${encodeURIComponent(id)}`);
  return response.data;
}

export default apiClient;
