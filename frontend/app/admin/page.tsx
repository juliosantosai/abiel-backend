"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchEmpresas, createEmpresa, deleteEmpresa } from "@/lib/api";
import { AdminLayout } from "@/components/admin-layout";

const empresaSchema = z.object({
  name: z.string().min(3, "Nombre mínimo 3 caracteres"),
  tenantId: z.string().min(3, "tenantId mínimo 3 caracteres"),
  webhookToken: z.string().min(6, "webhookToken mínimo 6 caracteres"),
  status: z.enum(["active", "inactive"])
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

type Empresa = {
  id: string;
  name: string;
  tenantId: string;
  webhookToken: string;
  status: string;
};

export default function AdminEmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      name: "",
      tenantId: "",
      webhookToken: "",
      status: "active"
    }
  });

  const loadEmpresas = async () => {
    setLoading(true);
    try {
      const data = await fetchEmpresas();
      setEmpresas(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpresas();
  }, []);

  const onSubmit = async (values: EmpresaFormValues) => {
    setLoading(true);
    try {
      await createEmpresa(values);
      await loadEmpresas();
      setIsOpen(false);
      form.reset();
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteEmpresa(id);
      setEmpresas((current) => current.filter((item) => item.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const hasEmpresas = empresas.length > 0;

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Empresas</h1>
            <p className="text-sm text-slate-600">Administra tus tenants desde este panel.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nueva Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Nueva empresa</DialogTitle>
                <DialogDescription>Ingresa los datos para crear un nuevo tenant.</DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" {...form.register("name")} />
                  {form.formState.errors.name && <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="tenantId">tenantId</Label>
                  <Input id="tenantId" {...form.register("tenantId")} />
                  {form.formState.errors.tenantId && <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>}
                </div>
                <div>
                  <Label htmlFor="webhookToken">webhookToken</Label>
                  <Input id="webhookToken" {...form.register("webhookToken")} />
                  {form.formState.errors.webhookToken && <p className="text-sm text-red-600">{form.formState.errors.webhookToken.message}</p>}
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select id="status" className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500" {...form.register("status")}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Guardar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {loading && <p className="text-sm text-slate-500">Cargando empresas...</p>}
          {!loading && !hasEmpresas && <p className="text-sm text-slate-500">No hay empresas registradas.</p>}
          {!loading && hasEmpresas && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>tenantId</TableHead>
                  <TableHead>webhookToken</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell>{empresa.name}</TableCell>
                    <TableCell>{empresa.tenantId}</TableCell>
                    <TableCell>{empresa.webhookToken}</TableCell>
                    <TableCell>{empresa.status}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(empresa.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
