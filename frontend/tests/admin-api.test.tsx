import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/components/auth-provider";
import AdminEmpresasPage from "@/app/admin/empresas/page";
import LoginPage from "@/app/admin/login/page";
import * as api from "@/lib/api";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/empresas",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })
}));

vi.mock("@/lib/api", async () => ({
  fetchEmpresas: vi.fn(),
  createEmpresa: vi.fn(),
  deleteEmpresa: vi.fn()
}));

function wrapWithProviders(component: React.ReactNode) {
  return <AuthProvider>{component}</AuthProvider>;
}

describe("Admin web panel", () => {
  it("renders login page and validates the api key", async () => {
    render(wrapWithProviders(<LoginPage />));

    fireEvent.change(screen.getByLabelText(/ADMIN_API_KEY/i), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    expect(await screen.findByText(/La API key es requerida/i)).toBeInTheDocument();
  });

  it("renders empresas page and loads data", async () => {
    (api.fetchEmpresas as any).mockResolvedValue([
      { id: "1", name: "Empresa 1", tenantId: "tenant-1", webhookToken: "token-1", status: "active" }
    ]);
    document.cookie = "admin_api_key=test-key";

    render(wrapWithProviders(<AdminEmpresasPage />));

    expect(await screen.findByText(/Empresa 1/i)).toBeInTheDocument();
    expect(screen.getByText(/tenant-1/i)).toBeInTheDocument();
  });

  it("creates a new empresa", async () => {
    document.cookie = "admin_api_key=test-key";
    (api.fetchEmpresas as any).mockResolvedValue([]);
    (api.createEmpresa as any).mockResolvedValue({ id: "2", name: "Empresa 2", tenantId: "tenant-2", webhookToken: "token-2", status: "active" });
    (api.fetchEmpresas as any).mockResolvedValueOnce([]).mockResolvedValueOnce([
      { id: "2", name: "Empresa 2", tenantId: "tenant-2", webhookToken: "token-2", status: "active" }
    ]);

    render(wrapWithProviders(<AdminEmpresasPage />));

    fireEvent.click(screen.getByRole("button", { name: /Nueva Empresa/i }));
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Empresa 2" } });
    fireEvent.change(screen.getByLabelText(/tenantId/i), { target: { value: "tenant-2" } });
    fireEvent.change(screen.getByLabelText(/webhookToken/i), { target: { value: "token-2" } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: "active" } });
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => expect(api.createEmpresa).toHaveBeenCalled());
  });
});
