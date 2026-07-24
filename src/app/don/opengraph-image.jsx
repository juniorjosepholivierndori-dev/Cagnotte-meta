import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';

export const runtime = 'edge';

export const alt = 'Cagnotte Metamorphoo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const stats = await db.getStats();
  
  const total = stats ? stats.totalCollected : 0;
  const goal = stats ? stats.goal : 5000000;
  const progress = Math.min(100, Math.round((total / goal) * 100));

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to right, #0f172a, #1e293b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '60px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 70, fontWeight: 'bold', marginBottom: 20 }}>
          Cagnotte Metamorphoo
        </div>
        <div style={{ display: 'flex', fontSize: 35, color: '#94a3b8', marginBottom: 80 }}>
          Aidez-nous à financer notre projet solidaire !
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', width: '85%', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 40, marginBottom: 20 }}>
            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{total.toLocaleString('fr-FR')} FCFA collectés</span>
            <span style={{ color: '#cbd5e1' }}>Objectif: {goal.toLocaleString('fr-FR')} FCFA</span>
          </div>
          
          <div style={{ display: 'flex', width: '100%', height: 40, background: '#334155', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', width: `${progress}%`, background: '#38bdf8', height: '100%' }}></div>
          </div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 40, color: '#38bdf8', fontWeight: 'bold' }}>
            Déjà {progress}% atteint !
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
