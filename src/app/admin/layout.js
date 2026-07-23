import Link from 'next/link';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-card md:border-y-0 md:border-l-0 md:rounded-none flex flex-col p-4 z-10">
        <div className="py-4 px-2 mb-6 border-b border-slate-200">
          <h2 className="text-xl font-bold gradient-text">Metamorphoo</h2>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-primary)]/10 transition-colors text-slate-600 hover:text-slate-900 font-medium">
            <span>📊</span> Tableau de bord
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-primary)]/10 transition-colors text-slate-600 hover:text-slate-900 font-medium">
            <span>⚙️</span> Configuration
          </Link>
          <a href="/don" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-primary)]/10 transition-colors text-slate-600 hover:text-slate-900 font-medium mt-4 border border-slate-200">
            <span>👁️</span> Voir la page
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
