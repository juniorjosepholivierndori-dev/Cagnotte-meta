import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const DonationSchema = z.object({
  amount: z.string().or(z.number()).transform(val => Number(val)).pipe(z.number().positive('Le montant doit être positif')),
  operator: z.string().min(1, 'L\'opérateur est requis'),
  phone: z.string().regex(/^[0-9+\s-]{10,}$/, 'Numéro de téléphone invalide'),
  name: z.string().regex(/^[a-zA-ZÀ-ÿ\s]*$/, "Le nom ne doit contenir que des lettres").max(100).optional()
});

export async function POST(request) {
  try {
    const data = await request.json();
    const validated = DonationSchema.parse(data);
    const { amount, operator, phone, name } = validated;

    const reference = `TX${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    const newDonation = await db.createDonation({
      reference,
      amount: parseInt(amount, 10),
      operator,
      donor_phone: phone,
      donor_name: name || 'Anonyme',
      status: operator === 'wave' ? 'PENDING' : 'SUCCESS'
    });

    if (operator === 'wave') {
      return NextResponse.json({
        success: true,
        reference: newDonation.reference,
        payment_url: 'https://pay.wave.com/m/M_ci_6mx-fb2LdUGp/c/ci/'
      });
    }

    // Flux pour MTN, Orange, Moov (Lien statique d'agrégateur)
    // On met à jour la cagnotte globale en arrière-plan sans bloquer la réponse (très rapide)
    db.getCampaign().then(campaign => {
      if (campaign) {
        db.updateCampaign({
          id: '1',
          current_amount: Number(campaign.current_amount) + parseInt(amount, 10)
        });
      }
    });

    return NextResponse.json({
      success: true,
      reference: newDonation.reference,
      // On utilise le lien fourni dans le fichier .env.local
      payment_url: process.env.AGGREGATOR_LINK || 'VOTRE_LIEN_AGREGATEUR_ICI'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation échouée', details: error.errors },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
