import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const SUPERBASE_URL = 'http://localhost:7777/v1/data/products';
const SUPERBASE_KEY = 'db_O5-MqWO_USRwGc_f3RQVycl_47DFmnCvA4KfOuo1Ypw';

async function migrate() {
  console.log('Fetching products from cloud Supabase...');
  const { data: products, error } = await supabase.from('products').select('*');
  
  if (error) {
    console.error('Error fetching from Supabase:', error);
    return;
  }
  
  console.log(`Found ${products.length} products. Migrating to local Superbase...`);
  
  for (const p of products) {
    // We only want to send the payload, omit id so local postgres generates it
    const payload = { ...p };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;
    
    // Ensure numbers are floats, etc.
    if (payload.price) payload.price = parseFloat(payload.price);
    if (payload.compare_price) payload.compare_price = parseFloat(payload.compare_price);
    if (payload.rating) payload.rating = parseFloat(payload.rating);
    
    const res = await fetch(SUPERBASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERBASE_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const err = await res.text();
      console.error(`Failed to migrate product ${p.name}:`, err);
    } else {
      console.log(`Migrated: ${p.name}`);
    }
  }
  
  console.log('Migration complete!');
}

migrate();
