'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const confirmDonation = async (reference) => {
    const loadingToast = toast.loading('Confirmation en cours...');
    try {
      const res = await fetch(`/api/admin/donations/${reference}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUCCESS' })
      });
      if (res.ok) {
        toast.success('Don validé avec succès !', { id: loadingToast });
        fetchStats(); // Refresh stats after confirmation
      } else {
        toast.error('Erreur lors de la validation', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur de connexion', { id: loadingToast });
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (!stats) return <div>Erreur de chargement</div>;

  const progress = Math.min(100, Math.round((stats.totalCollected / stats.goal) * 100));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <p className="text-slate-500 text-sm mb-1 font-medium">Total Collecté</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{stats.totalCollected.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-500 text-sm mb-1 font-medium">Objectif</p>
          <p className="text-2xl font-bold">{stats.goal.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-500 text-sm mb-1 font-medium">Donateurs</p>
          <p className="text-2xl font-bold">{stats.donorCount}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-500 text-sm mb-1 font-medium">Don Moyen</p>
          <p className="text-2xl font-bold">{Math.round(stats.averageDonation).toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4">Progression Globale</h3>
        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-slate-500 font-medium">
          <span>{progress}% de l'objectif</span>
          <span>Reste: {(stats.goal - stats.totalCollected).toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4">Derniers dons (MVP)</h3>
        <p className="text-sm text-slate-500 mb-4">Dans ce MVP, les paiements Wave ne sont pas automatiquement confirmés par webhook. Confirmez-les manuellement ici après avoir vérifié votre compte Wave.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="pb-3 px-4 font-medium">Date</th>
                <th className="pb-3 px-4 font-medium">Nom</th>
                <th className="pb-3 px-4 font-medium">Téléphone</th>
                <th className="pb-3 px-4 font-medium">Opérateur</th>
                <th className="pb-3 px-4 font-medium">Montant</th>
                <th className="pb-3 px-4 font-medium">Statut</th>
                <th className="pb-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentDonations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">Aucun don enregistré</td>
                </tr>
              ) : (
                stats.recentDonations.reverse().map((don) => (
                  <tr key={don.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">{new Date(don.date).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 px-4 font-medium">{don.donor_name}</td>
                    <td className="py-3 px-4">{don.donor_phone}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs">{don.operator}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{don.amount.toLocaleString('fr-FR')}</td>
                    <td className="py-3 px-4">
                      {don.status === 'SUCCESS' ? (
                        <span className="text-green-700 text-xs font-bold px-2 py-1 bg-green-100 rounded-md">RÉUSSI</span>
                      ) : (
                        <span className="text-yellow-700 text-xs font-bold px-2 py-1 bg-yellow-100 rounded-md">EN ATTENTE</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {don.status === 'PENDING' && (
                        <button 
                          onClick={() => confirmDonation(don.reference)}
                          className="text-xs text-white font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] px-3 py-1.5 rounded transition-colors"
                        >
                          Confirmer
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
