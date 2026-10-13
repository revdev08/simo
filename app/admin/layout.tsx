import PestanasAdmin from '@/components/admin/PestanasAdmin'

// Marco común de la administración: cada página comprueba el acceso por su cuenta
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Administración</span>
          <PestanasAdmin />
        </div>
      </div>
      {children}
    </div>
  )
}
