import Link from "next/link";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white px-4 py-6">
          <div className="mb-10">
            <p className="text-xl font-semibold">Abiel Core</p>
            <p className="text-sm text-slate-500">Panel de administración</p>
          </div>
          <nav className="space-y-2 text-sm text-slate-700">
            <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-slate-100">Empresas</Link>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
