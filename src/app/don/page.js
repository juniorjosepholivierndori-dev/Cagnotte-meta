'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';

const OPERATORS = [
  { id: 'wave', name: 'Wave', color: '#1dc3c3', image: 'https://www.emploitogo.info/wp-content/uploads/2024/04/wave-recrute.png' },
  { id: 'orange', name: 'Orange Money', color: '#ff6600', image: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg' },
  { id: 'mtn', name: 'MTN MoMo', color: '#ffcc00', image: 'https://www.seekpng.com/png/detail/69-691715_mtn-mm-logo-generic-mtn-mobile-money-logo.png' },
  { id: 'moov', name: 'Moov Money', color: '#0066ff', image: 'https://www.moov-africa.ml/PublishingImages/contenu/moov-money.png' }
];

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000];

export default function DonationPage() {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(10000);
  const [operator, setOperator] = useState('wave');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/campaign')
      .then(res => res.json())
      .then(data => {
        setCampaign(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur de chargement de la campagne");
        setLoading(false);
      });
  }, []);

  const phoneSchema = z.string().regex(/^(01|05|07)\d{8}$/, "Le numéro doit commencer par 01, 05 ou 07 (Réseaux Ivoiriens).");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Remove spaces from phone
    let cleanPhone = phone.replace(/\s+/g, '');
    
    // Si l'utilisateur a mis le +225 lui-même, on le retire pour la vérification
    if (cleanPhone.startsWith('+225')) {
      cleanPhone = cleanPhone.substring(4);
    } else if (cleanPhone.startsWith('225') && cleanPhone.length === 13) {
      cleanPhone = cleanPhone.substring(3);
    }

    // Vérification stricte de la longueur
    if (cleanPhone.length !== 10) {
      const msg = cleanPhone.length > 10 
        ? `Le numéro est trop long (${cleanPhone.length} chiffres). Il doit en faire exactement 10.`
        : `Le numéro est trop court (${cleanPhone.length} chiffres). Il doit en faire exactement 10.`;
      toast.error(msg);
      return;
    }

    // Validate phone with Zod pour vérifier le préfixe (01, 05, 07)
    const phoneValidation = phoneSchema.safeParse(cleanPhone);
    if (!phoneValidation.success) {
      toast.error(phoneValidation.error.errors[0].message);
      return;
    }

    // Validation du nom (lettres et espaces uniquement, pas de chiffres/caractères spéciaux)
    if (name) {
      const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
      if (!nameRegex.test(name)) {
        toast.error("Le nom ne doit contenir que des lettres (pas de chiffres ni de caractères spéciaux).");
        return;
      }
    }

    // Ajout automatique de l'indicateur
    const finalPhone = `+225 ${cleanPhone}`;

    setIsSubmitting(true);
    const loadingToast = toast.loading('Création du don...');

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, operator, phone: finalPhone, name })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Redirection vers le paiement...', { id: loadingToast });
        
        // Sécurité: Validation de l'URL pour éviter l'Open Redirect
        try {
          const urlObj = new URL(data.payment_url);
          const allowedHosts = ['pay.wave.com', 'checkout.cinetpay.com', 'app.fedapay.com', 'app.fineopay.com'];
          if (allowedHosts.includes(urlObj.hostname)) {
            window.location.href = data.payment_url;
          } else {
            throw new Error('URL de paiement non sécurisée');
          }
        } catch (urlError) {
          toast.error('URL de paiement invalide', { id: loadingToast });
          setIsSubmitting(false);
        }
      } else {
        const errorMsg = data.error || "Une erreur est survenue";
        setError(errorMsg);
        toast.error(errorMsg, { id: loadingToast });
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
      toast.error("Erreur de connexion au serveur", { id: loadingToast });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;
  }

  if (!campaign) return null;

  const progress = Math.min(100, Math.round((campaign.current_amount / campaign.goal_amount) * 100));

  return (
    <main className="min-h-screen py-12 px-4 md:px-8 max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center justify-center">
      {/* Informations de la campagne */}
      <div className="w-full lg:w-5/12 space-y-8">
        <div className="space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-sm font-semibold tracking-wide uppercase mb-2">
            Campagne solidaire
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            {campaign.title.split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? "gradient-text" : "text-slate-900"}>{word} </span>
            ))}
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mt-4">
            {campaign.description}
          </p>
        </div>
        
        <div className="glass-card p-6 md:p-8 mt-8 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-[var(--color-primary)] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
          
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Montant collecté</p>
              <p className="text-4xl font-bold text-slate-900">{campaign.current_amount.toLocaleString('fr-FR')} <span className="text-xl text-slate-500 font-normal">FCFA</span></p>
            </div>
          </div>
          
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] animate-progress rounded-full"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 text-sm font-medium">
            <span className="text-[var(--color-primary)]">{progress}% atteint</span>
            <span className="text-slate-500">Objectif: {campaign.goal_amount.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </div>

      {/* Formulaire de don */}
      <div className="w-full lg:w-7/12 max-w-xl">
        <div className="glass-card p-6 md:p-10 shadow-2xl relative">
          
          <h2 className="text-2xl font-bold mb-8 text-center text-slate-900">Contribuez maintenant</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center flex items-center justify-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Montant */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs">1</span>
                Choisissez votre montant
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PRESET_AMOUNTS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                      amount === preset 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] shadow-[0_0_15px_rgba(37,99,235,0.2)] transform scale-105' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {preset.toLocaleString('fr-FR')}
                  </button>
                ))}
              </div>
              
              <div className="input-glow relative mt-4 rounded-xl overflow-hidden border border-slate-200 bg-white">
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-transparent py-4 px-5 pr-20 text-xl font-bold text-slate-900 focus:outline-none placeholder-slate-400"
                  min="100"
                  required
                />
                <div className="absolute right-0 top-0 bottom-0 bg-slate-50 flex items-center justify-center px-6 font-semibold text-slate-500 border-l border-slate-200">
                  FCFA
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs">2</span>
                Moyen de paiement
              </label>
              <div className="grid grid-cols-2 gap-4">
                {OPERATORS.map(op => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperator(op.id)}
                    className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border-2 transition-all duration-300 ${
                      operator === op.id 
                        ? 'shadow-lg transform scale-[1.02]' 
                        : 'border-slate-200 bg-white opacity-70 hover:opacity-100 hover:border-slate-300'
                    }`}
                    style={operator === op.id ? { borderColor: op.color, backgroundColor: `${op.color}10` } : {}}
                  >
                    <div className="h-8 w-16 relative flex items-center justify-center bg-white rounded-md p-1 overflow-hidden shadow-sm border border-slate-100">
                      <img src={op.image} alt={op.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 text-center">{op.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Infos Donateur */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs">3</span>
                Vos informations
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-glow rounded-xl border border-slate-200 bg-white p-2 focus-within:border-[var(--color-primary)] transition-colors">
                  <label className="block text-xs text-slate-500 px-3 pt-1 font-medium">Téléphone mobile</label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 07 00 00 00 00"
                    className="w-full bg-transparent border-none py-2 px-3 text-slate-900 focus:outline-none placeholder-slate-400 font-medium"
                    required
                  />
                </div>
                
                <div className="input-glow rounded-xl border border-slate-200 bg-white p-2 focus-within:border-[var(--color-primary)] transition-colors">
                  <label className="block text-xs text-slate-500 px-3 pt-1 font-medium">Nom (Optionnel)</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Généreux donateur"
                    className="w-full bg-transparent border-none py-2 px-3 text-slate-900 focus:outline-none placeholder-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary w-full text-white font-bold py-5 rounded-xl text-lg flex items-center justify-center gap-3 mt-8 shadow-xl"
            >
              {isSubmitting ? (
                <><div className="spinner w-6 h-6"></div> Traitement sécurisé...</>
              ) : (
                <>
                  <span>Faire un don de {amount.toLocaleString('fr-FR')} FCFA</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 font-medium">Paiement sécurisé de bout en bout</p>
          </form>
        </div>
      </div>
    </main>
  );
}

