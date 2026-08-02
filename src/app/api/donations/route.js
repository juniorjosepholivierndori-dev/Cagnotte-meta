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

    if (operator !== 'wave') {
      return NextResponse.json({ error: 'Opérateur non supporté' }, { status: 400 });
    }

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
      payment_url: 'https://pay.wave.com/m/M_ci_Na04388hZUu-/c/ci/'
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
