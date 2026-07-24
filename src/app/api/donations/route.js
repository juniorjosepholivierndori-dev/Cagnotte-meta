import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const data = await request.json();
    const { amount, operator, phone, name } = data;

    if (!amount || !operator || !phone) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const reference = `TX${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    const newDonation = await db.createDonation({
      reference,
      amount: parseInt(amount, 10),
      operator,
      donor_phone: phone,
      donor_name: name || 'Anonyme',
      status: 'PENDING'
    });

    // Simulated payment URL response. For Wave MVP, we always return the static link.
    // In a real scenario with CinetPay/Wave API, we'd make an API call here.
    return NextResponse.json({
      success: true,
      reference: newDonation.reference,
      payment_url: 'https://pay.wave.com/m/M_ci_6mx-fb2LdUGp/c/ci/'
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
