import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
  try {
    const payload = await request.json();
    
    // Vérifier l'événement de webhook FedaPay (paiement réussi)
    if (payload.name === 'transaction.approved') {
      const transaction = payload.entity;
      
      // On récupère notre référence locale injectée dans custom_metadata lors de la création
      const local_reference = transaction.custom_metadata?.local_reference;
      
      if (local_reference && transaction.status === 'approved') {
        // Validation réussie, la fonction met à jour le statut et la cagnotte
        await db.updateDonationStatus(local_reference, 'SUCCESS');
        console.log(`✅ [Webhook FedaPay] Don ${local_reference} validé avec succès.`);
      } else {
        console.warn(`⚠️ [Webhook FedaPay] Transaction approuvée mais référence introuvable:`, transaction.id);
      }
    }
    
    // FedaPay demande de toujours retourner un code HTTP 200
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('❌ [Webhook FedaPay] Erreur interne:', error);
    // On retourne 200 même en cas d'erreur pour que FedaPay ne retente pas inutilement si c'est un payload inconnu
    return new NextResponse('OK', { status: 200 });
  }
}
