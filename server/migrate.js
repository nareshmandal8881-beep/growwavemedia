const admin = require('firebase-admin');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. Initialize Firebase Admin
const serviceAccount = require('./firebase-admin.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2. Import Mongoose Models
const Creator = require('./models/Creator');
const Deal = require('./models/Deal');
const Submission = require('./models/Submission');
const Invoice = require('./models/Invoice');

// Helper to convert Firestore Timestamps to JS Dates
function convertTimestamps(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const newObj = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    const val = obj[key];
    if (val && typeof val === 'object' && val._seconds !== undefined) {
      // It's a Firestore Timestamp
      newObj[key] = new Date(val._seconds * 1000);
    } else if (val && typeof val === 'object' && !(val instanceof Date)) {
      newObj[key] = convertTimestamps(val);
    } else {
      newObj[key] = val;
    }
  }
  return newObj;
}

async function migrate() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    const idMap = {};

    // --- 1. MIGRATING CREATORS ---
    console.log('👥 Migrating Creators...');
    const creatorsSnap = await db.collection('portal_creators').get();
    for (const doc of creatorsSnap.docs) {
      const data = convertTimestamps(doc.data());
      const mDoc = await Creator.findOneAndUpdate(
        { uid: data.uid },
        { ...data },
        { upsert: true, new: true }
      );
      idMap[doc.id] = mDoc._id;
    }
    console.log(`✅ Migrated ${creatorsSnap.size} creators.`);

    // --- 2. MIGRATING DEALS ---
    console.log('💼 Migrating Deals...');
    const dealsSnap = await db.collection('portal_deals').get();
    for (const doc of dealsSnap.docs) {
      const data = convertTimestamps(doc.data());
      const mappedCreatorId = data.creatorId ? idMap[data.creatorId] : null;
      
      const mDoc = await Deal.findOneAndUpdate(
        { title: data.title, createdAt: data.createdAt },
        { 
          ...data,
          creatorId: mappedCreatorId
        },
        { upsert: true, new: true }
      );
      idMap[doc.id] = mDoc._id;
    }
    console.log(`✅ Migrated ${dealsSnap.size} deals.`);

    // --- 3. MIGRATING SUBMISSIONS ---
    console.log('📤 Migrating Submissions...');
    const subsSnap = await db.collection('portal_submissions').get();
    for (const doc of subsSnap.docs) {
      const data = convertTimestamps(doc.data());
      await Submission.create({
        ...data,
        dealId: idMap[data.dealId] || null,
        creatorId: idMap[data.creatorId] || null
      });
    }
    console.log(`✅ Migrated ${subsSnap.size} submissions.`);

    // --- 4. MIGRATING INVOICES ---
    console.log('📄 Migrating Invoices...');
    const invSnap = await db.collection('portal_invoices').get();
    for (const doc of invSnap.docs) {
      const data = convertTimestamps(doc.data());
      await Invoice.create({
        ...data,
        dealId: idMap[data.dealId] || null,
        creatorId: idMap[data.creatorId] || null
      });
    }
    console.log(`✅ Migrated ${invSnap.size} invoices.`);

    console.log('🏁 FULL DATA MIGRATION COMPLETE!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Failed:', err);
    process.exit(1);
  }
}

migrate();
