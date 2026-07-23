import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromCookie } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: reference } = await params; // Here ID is the reference
    const data = await request.json();
    const { status } = data;

    if (!['SUCCESS', 'FAILED'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const updatedDonation = db.updateDonationStatus(reference, status);

    if (!updatedDonation) {
      return NextResponse.json({ error: 'Donation introuvable' }, { status: 404 });
    }

    return NextResponse.json(updatedDonation);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
