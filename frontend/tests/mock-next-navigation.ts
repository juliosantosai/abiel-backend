export const usePathname = () => "/admin/empresas";
export const useRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn()
});
