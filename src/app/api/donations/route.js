import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const DonationSchema = z.object({
  amount: z.string().or(z.number()).transform(val => Number(val)).pipe(z.number().positive('Le montant doit être positif')),
  operator: z.string().min(1, 'L\'opérateur est requis'),
  phone: z.string().regex(/^(01|05|07)\d{8}$/, 'Le numéro doit faire 10 chiffres et commencer par 01, 05 ou 07'),
  name: z.string().regex(/^[A-Za-zÀ-ÿ\s]*$/, 'Le nom ne doit contenir que des lettres et des espaces').max(100).optional().or(z.literal(''))
});

export async function POST(request) {
  try {
    const data = await request.json();
    const validated = DonationSchema.parse(data);
    const { amount, operator, phone, name } = validated;

    const reference = `TX${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    const parsedAmount = parseInt(amount, 10);

    if (operator === 'wave') {
      const newDonation = await db.createDonation({
        reference,
        amount: parsedAmount,
        operator,
        donor_phone: phone,
        donor_name: name || 'Anonyme',
        status: 'PENDING'
      });
      return NextResponse.json({
        success: true,
        reference: newDonation.reference,
        payment_url: 'https://pay.wave.com/m/M_ci_6mx-fb2LdUGp/c/ci/'
      });
    }

    // Flux pour MTN, Orange, Moov (Lien statique d'agrégateur - Option 2 Rapide)
    // On exécute la création du don et la mise à jour de la cagnotte en parallèle pour plus de rapidité !
    const donationPromise = db.createDonation({
      reference,
      amount: parsedAmount,
      operator,
      donor_phone: phone,
      donor_name: name || 'Anonyme',
      status: 'SUCCESS' // Validation immédiate
    });

    const campaignPromise = db.getCampaign().then(campaign => {
      if (campaign) {
        // On importe supabase de db.js s'il est exporté, sinon on le refait
        // Heureusement, db.js fait: export const supabase = ...
        const { supabase } = require('@/lib/db');
        return supabase
          .from('campaign')
          .update({ current_amount: Number(campaign.current_amount) + parsedAmount })
          .eq('id', '1');
      }
    });

    // On attend que les deux opérations parallèles soient finies
    const [newDonation] = await Promise.all([donationPromise, campaignPromise]);

    return NextResponse.json({
      success: true,
      reference: newDonation.reference,
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
