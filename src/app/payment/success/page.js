import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-[var(--color-success)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        
        <h1 className="text-3xl font-bold text-[var(--color-success)]">Merci pour votre don !</h1>
        
        <p className="text-gray-300">
          Votre contribution a bien été enregistrée. Que Dieu vous bénisse pour votre générosité.
        </p>
        
        <div className="pt-6">
          <Link href="/don" className="inline-block w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
