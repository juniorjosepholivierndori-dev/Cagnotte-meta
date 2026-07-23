import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data.json');

// Initialiser la base de données
const initDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [
        {
          id: 'admin-1',
          email: 'admin@metamorphoo.com',
          // Mot de passe: 'admin123'
          password: '$2b$10$O4iWWuSKaS2a3XflTc2thurgXLuY1XFBdN5w/HRFq3Fz/.sadJmdi', 
          role: 'ADMIN',
        }
      ],
      campaign: {
        id: '1',
        title: 'Cagnotte Metamorphoo',
        description: 'Aidez-nous à financer notre projet...',
        goal_amount: 5000000,
        current_amount: 2350000,
        image: '/images/default-campaign.jpg',
        deadline: '2026-12-31',
        status: 'ACTIVE'
      },
      donations: [],
      transactions: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
};

const readDB = () => {
  initDB();
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

export const db = {
  getUserByEmail: (email) => {
    const data = readDB();
    return data.users.find(u => u.email === email);
  },
  
  getCampaign: () => {
    const data = readDB();
    return data.campaign;
  },
  
  updateCampaign: (newCampaignData) => {
    const data = readDB();
    data.campaign = { ...data.campaign, ...newCampaignData };
    writeDB(data);
    return data.campaign;
  },
  
  createDonation: (donationData) => {
    const data = readDB();
    const newDonation = {
      id: Date.now().toString(),
      ...donationData,
      date: new Date().toISOString()
    };
    data.donations.push(newDonation);
    writeDB(data);
    return newDonation;
  },
  
  updateDonationStatus: (reference, status) => {
    const data = readDB();
    const index = data.donations.findIndex(d => d.reference === reference);
    if (index !== -1) {
      data.donations[index].status = status;
      
      // Update campaign total if successful
      if (status === 'SUCCESS') {
         data.campaign.current_amount += data.donations[index].amount;
      }
      writeDB(data);
      return data.donations[index];
    }
    return null;
  },
  
  getDonationByRef: (reference) => {
    const data = readDB();
    return data.donations.find(d => d.reference === reference);
  },
  
  getAllDonations: () => {
    const data = readDB();
    return data.donations.sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  
  getStats: () => {
    const data = readDB();
    const totalCollected = data.campaign.current_amount;
    const goal = data.campaign.goal_amount;
    const successDonations = data.donations.filter(d => d.status === 'SUCCESS');
    const donorCount = successDonations.length;
    const averageDonation = donorCount > 0 ? totalCollected / donorCount : 0;
    
    return {
      totalCollected,
      goal,
      donorCount,
      averageDonation,
      recentDonations: data.donations.slice(-5)
    };
  }
};
