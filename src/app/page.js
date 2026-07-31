import Link from 'next/link';

export default function Home({ campaign }) {
  const progress = Math.min(100, Math.round(((campaign.current_amount || 0) / (campaign.goal_amount || 1)) * 100));

  return (
    <main className="min-h-screen py-12 px-4 md:px-8 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
      
      {/* Colonne Gauche - Textes et Appel à l'action */}
      <div className="flex-1 space-y-8 animate-fade-in text-center md:text-left pt-10 md:pt-0">
        <div className="space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-sm font-semibold tracking-wide uppercase mb-2 shadow-sm">
            Campagne solidaire
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            {campaign.title.split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? "gradient-text" : "text-slate-900"}>{word} </span>
            ))}
          </h1>
          <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-xl mx-auto md:mx-0 mt-4">
            {campaign.description}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
          <Link href="/don" className="btn-primary px-8 py-4 rounded-full font-bold text-lg text-white shadow-xl flex items-center gap-2 group w-full sm:w-auto justify-center">
            Contribuer maintenant
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
          <a href="#details" className="px-8 py-4 rounded-full font-bold text-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors w-full sm:w-auto text-center">
            En savoir plus
          </a>
        </div>

        <div className="pt-8 flex items-center justify-center md:justify-start gap-4 text-sm font-medium text-slate-500">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${i === 1 ? 'bg-orange-500' : i === 2 ? 'bg-blue-500' : 'bg-yellow-400'}`}>
                {i === 1 ? 'OM' : i === 2 ? 'W' : 'M'}
              </div>
            ))}
          </div>
          <span>Paiements sécurisés 100% locaux</span>
        </div>
      </div>

      {/* Colonne Droite - Jauge de Progression */}
      <div className="flex-1 w-full max-w-lg mt-8 md:mt-0 animate-slide-up animation-delay-200">
        <div className="glass-card p-8 md:p-10 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[var(--color-primary)] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 rounded-full"></div>
          
          <div className="text-center mb-10">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Montant collecté</p>
            <h2 className="text-5xl font-extrabold text-slate-900">{(campaign.current_amount || 0).toLocaleString('fr-FR')} <span className="text-2xl text-slate-400 font-medium">FCFA</span></h2>
          </div>
          
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden relative shadow-inner mb-4">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] animate-progress rounded-full"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">{progress}% atteint</span>
            <span className="text-slate-500">Objectif : {(campaign.goal_amount || 0).toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </div>

    </main>
  );
}
