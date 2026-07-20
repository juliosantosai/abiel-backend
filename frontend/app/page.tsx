import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm text-center">
        <h1 className="mb-4 text-3xl font-semibold">Abiel Admin</h1>
        <p className="mb-6 text-slate-600">Panel de administración para gestionar empresas y tenants.</p>
        <Link href="/admin/login" className="inline-flex rounded-md bg-sky-600 px-5 py-3 text-white hover:bg-sky-700">
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}
