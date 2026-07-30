import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const ConfirmSchema = z.object({
  status: z.enum(['SUCCESS', 'FAILED'], { errorMap: () => ({ message: 'Le statut doit être SUCCESS ou FAILED' }) })
});

export async function PUT(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: reference } = await params; // Here ID is the reference
    const data = await request.json();
    const validated = ConfirmSchema.parse(data);
    const { status } = validated;

    const updatedDonation = await db.updateDonationStatus(reference, status);

    if (!updatedDonation) {
      return NextResponse.json({ error: 'Donation introuvable' }, { status: 404 });
    }

    return NextResponse.json(updatedDonation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation échouée', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
