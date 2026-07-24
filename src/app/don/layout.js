import { db } from '@/lib/db';

export async function generateMetadata() {
  const stats = await db.getStats();
  
  const total = stats ? stats.totalCollected : 0;
  const goal = stats ? stats.goal : 5000000;
  const progress = Math.min(100, Math.round((total / goal) * 100));

  return {
    title: `Cagnotte Metamorphoo - ${progress}% atteint !`,
    description: `Aidez-nous à financer notre projet solidaire. Nous avons déjà collecté ${total.toLocaleString('fr-FR')} FCFA sur notre objectif de ${goal.toLocaleString('fr-FR')} FCFA. Chaque contribution compte !`,
    openGraph: {
      type: 'website',
      title: `Cagnotte Metamorphoo - ${progress}% atteint !`,
      description: `Aidez-nous à atteindre notre objectif de ${goal.toLocaleString('fr-FR')} FCFA. Chaque don fait une différence.`,
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default function DonLayout({ children }) {
  return <>{children}</>;
}
