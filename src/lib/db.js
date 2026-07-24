import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const db = {
  getUserByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error) return null;
    return data;
  },
  
  getCampaign: async () => {
    const { data, error } = await supabase
      .from('campaign')
      .select('*')
      .eq('id', '1')
      .single();
    if (error) return null;
    return data;
  },
  
  updateCampaign: async (newCampaignData) => {
    const { id, current_amount, ...updateData } = newCampaignData;
    const { data, error } = await supabase
      .from('campaign')
      .update(updateData)
      .eq('id', '1')
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  
  createDonation: async (donationData) => {
    const newDonation = {
      id: Date.now().toString(),
      ...donationData,
      status: 'PENDING',
      date: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('donations')
      .insert([newDonation])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  },
  
  updateDonationStatus: async (reference, status) => {
    const { data: donation, error: findError } = await supabase
      .from('donations')
      .select('*')
      .eq('reference', reference)
      .single();
      
    if (findError || !donation) return null;
    
    // Avoid double counting
    if (donation.status === 'SUCCESS' && status === 'SUCCESS') {
      return donation;
    }
    
    const { data: updatedDonation, error: updateError } = await supabase
      .from('donations')
      .update({ status })
      .eq('reference', reference)
      .select()
      .single();
      
    if (updateError) return null;
    
    if (status === 'SUCCESS') {
      const campaign = await db.getCampaign();
      if (campaign) {
        await supabase
          .from('campaign')
          .update({ current_amount: Number(campaign.current_amount) + Number(donation.amount) })
          .eq('id', '1');
      }
    }
    
    return updatedDonation;
  },
  
  getDonationByRef: async (reference) => {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('reference', reference)
      .single();
    if (error) return null;
    return data;
  },
  
  getAllDonations: async () => {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('date', { ascending: false });
    if (error) return [];
    return data;
  },
  
  getStats: async () => {
    const campaign = await db.getCampaign();
    if (!campaign) return null;
    
    const totalCollected = Number(campaign.current_amount) || 0;
    const goal = Number(campaign.goal_amount) || 0;
    
    const { data: successDonations, error: successError } = await supabase
      .from('donations')
      .select('amount')
      .eq('status', 'SUCCESS');
      
    const donorCount = successDonations ? successDonations.length : 0;
    const averageDonation = donorCount > 0 ? totalCollected / donorCount : 0;
    
    const { data: recentDonations, error: recentError } = await supabase
      .from('donations')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
      
    return {
      totalCollected,
      goal,
      donorCount,
      averageDonation,
      recentDonations: recentDonations || []
    };
  }
};
