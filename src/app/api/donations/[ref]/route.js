import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { ref } = await params;
    const donation = db.getDonationByRef(ref);

    if (!donation) {
      return NextResponse.json({ error: 'Donation introuvable' }, { status: 404 });
    }

    return NextResponse.json(donation);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
