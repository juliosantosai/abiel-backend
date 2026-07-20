import * as React from "react";

export function Table({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-md border border-slate-200"><table className="min-w-full divide-y divide-slate-200 bg-white">{children}</table></div>;
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-200 bg-white">{children}</tbody>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-slate-200 last:border-0">{children}</tr>;
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}

export function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-sm text-slate-700">{children}</td>;
}
