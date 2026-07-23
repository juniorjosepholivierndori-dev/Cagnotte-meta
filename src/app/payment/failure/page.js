import Link from 'next/link';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-[var(--color-danger)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">❌</span>
        </div>
        
        <h1 className="text-3xl font-bold text-[var(--color-danger)]">Paiement échoué</h1>
        
        <p className="text-gray-300">
          Nous n'avons pas pu valider votre paiement. Veuillez réessayer.
        </p>
        
        <div className="pt-6">
          <Link href="/don" className="inline-block w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-3 rounded-xl transition-colors">
            Réessayer
          </Link>
        </div>
      </div>
    </div>
  );
}
