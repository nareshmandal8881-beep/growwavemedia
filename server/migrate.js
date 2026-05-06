const admin = require('firebase-admin');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Initialize Firebase Admin
// Make sure server/firebase-admin.json exists
const serviceAccount = require('./firebase-admin.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Import Mongoose Models
const Lead = require('./models/Lead');
// We can add other models here later if needed

async function migrateLeads() {
  console.log('--- Starting Leads Migration ---');
  try {
    const leadsSnapshot = await db.collection('leads').get();
    let count = 0;
    
    for (const doc of leadsSnapshot.docs) {
      const data = doc.data();
      
      // Determine type based on old data
      let type = 'contact_form';
      if (data.Type === 'influencer' || data.Type === 'brand') {
        type = data.Type;
      }
      
      const newLead = new Lead({
        type: type,
        name: data.Name || 'Unknown',
        email: data.Email || 'No Email',
        phone: data.Phone || 'N/A',
        handleCompany: data.Handle_Company || '',
        nicheWebsite: data.Niche_Website || data.Service || '',
        followers: data.Followers || '',
        message: data.Message || '',
        ytName: data.YT_Name || '',
        ytLink: data.YT_Link || '',
        ytSubs: data.YT_Subs || '',
        igHandle: data.IG_Handle || '',
        igLink: data.IG_Link || '',
        igFollowers: data.IG_Followers || '',
        fbName: data.FB_Name || '',
        fbLink: data.FB_Link || '',
        fbFollowers: data.FB_Followers || '',
        company: data.Company || '',
        website: data.Website || '',
        createdAt: data.Timestamp ? data.Timestamp.toDate() : new Date(data.Date)
      });
      
      await newLead.save();
      count++;
    }
    
    console.log(`✅ Successfully migrated ${count} leads from Firestore to MongoDB!`);
  } catch (error) {
    console.error('❌ Error migrating leads:', error);
  }
}

async function runMigration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Clear existing leads (optional, to prevent duplicates if run multiple times)
    // await Lead.deleteMany({});
    
    // Run migration functions
    await migrateLeads();
    
    // Disconnect when done
    await mongoose.disconnect();
    console.log('✅ Migration complete and disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal Migration Error:', err);
    process.exit(1);
  }
}

runMigration();
