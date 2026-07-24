import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';

export async function PUT(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();
    const updatedCampaign = await db.updateCampaign(data);

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
