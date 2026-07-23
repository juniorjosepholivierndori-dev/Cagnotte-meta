'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/campaign')
      .then(res => res.json())
      .then(data => {
        setCampaign(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampaign(prev => ({
      ...prev,
      [name]: name === 'goal_amount' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/admin/campaign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign)
      });
      
      if (res.ok) {
        setMessage('Configuration enregistrée avec succès');
      } else {
        setMessage('Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setMessage('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Configuration de la cagnotte</h1>
      
      {message && (
        <div className={`px-4 py-3 rounded-lg mb-6 text-sm ${message.includes('succès') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Titre de la campagne</label>
          <input
            type="text"
            name="title"
            value={campaign?.title || ''}
            onChange={handleChange}
            className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
          <textarea
            name="description"
            value={campaign?.description || ''}
            onChange={handleChange}
            rows="4"
            className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Objectif Financier (FCFA)</label>
          <input
            type="number"
            name="goal_amount"
            value={campaign?.goal_amount || ''}
            onChange={handleChange}
            className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
        >
          {saving ? <div className="spinner w-4 h-4 border-2"></div> : null}
          {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
}
