import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iliykpzhcfrpdkfwetvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaXlrcHpoY2ZycGRrZndldHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNTYzODQsImV4cCI6MjEwMzkzMjM4NH0.zi5BeAKq9dOduh-uU9sP5oZxFr9FCtom7pQppkkeeEI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SHAKTI_ID = 'f646a2c5-21b8-4538-ab2e-87aac9488506';

async function seed() {
  console.log('Seeding Supabase database for Cooperative Platform...');

  // 1. Get Service Categories for skills mapping
  const { data: categories } = await supabase.from('service_categories').select('id, name');
  const catMap = {};
  if (categories) {
    for (const c of categories) {
      catMap[c.name.toLowerCase()] = c.id;
    }
  }
  console.log('Categories loaded:', Object.keys(catMap));

  // 2. Link existing verified workers to Shakti Labour Coop if society_id is null
  const { data: existingWorkers } = await supabase.from('workers').select('id, full_name, society_id, is_verified, verification_status');
  if (existingWorkers) {
    for (const w of existingWorkers) {
      // If it's the pending worker
      if (w.verification_status === 'pending' || w.full_name === 'Rajesh Kumar' && !w.society_id) {
        await supabase.from('workers').update({ society_id: SHAKTI_ID }).eq('id', w.id);
        console.log(`Linked pending worker ${w.full_name} (${w.id}) to Shakti`);
      } else if (!w.society_id) {
        await supabase.from('workers').update({
          society_id: SHAKTI_ID,
          is_verified: true,
          verification_status: 'verified'
        }).eq('id', w.id);
        console.log(`Linked verified worker ${w.full_name} (${w.id}) to Shakti`);
      }
    }
  }

  // 3. Ensure we have 2 explicit pending applicant workers for the approval/rejection test flow
  const pendingApplicants = [
    {
      full_name: 'Mohit Jain',
      phone: '+91 98765 43901',
      trade: 'Plumber',
      catId: catMap['plumber'],
      aadhaar: 'XXXX-XXXX-4821',
      status: 'pending',
    },
    {
      full_name: 'Kavita Verma',
      phone: '+91 98765 43902',
      trade: 'Electrician',
      catId: catMap['electrician'],
      aadhaar: 'XXXX-XXXX-9932',
      status: 'pending',
    },
  ];

  for (const app of pendingApplicants) {
    const { data: existing } = await supabase
      .from('workers')
      .select('id')
      .eq('phone', app.phone)
      .maybeSingle();

    let workerId = existing?.id;
    if (!existing) {
      const { data: created, error } = await supabase
        .from('workers')
        .insert({
          full_name: app.full_name,
          phone: app.phone,
          aadhaar_number: app.aadhaar,
          society_id: SHAKTI_ID,
          is_verified: false,
          verification_status: 'pending',
          is_available: false,
          avg_rating: 4.8,
          total_jobs_completed: 0,
          profile_photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(app.full_name)}&background=3b82f6&color=fff`,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating pending worker:', error.message);
      } else {
        workerId = created.id;
        console.log(`Created pending applicant ${app.full_name} (${workerId})`);
      }
    } else {
      await supabase.from('workers').update({
        society_id: SHAKTI_ID,
        is_verified: false,
        verification_status: 'pending'
      }).eq('id', existing.id);
      console.log(`Ensured pending applicant ${app.full_name} has status=pending`);
    }

    if (workerId && app.catId) {
      const { data: skill } = await supabase
        .from('worker_skills')
        .select('id')
        .eq('worker_id', workerId)
        .maybeSingle();

      if (!skill) {
        await supabase.from('worker_skills').insert({
          worker_id: workerId,
          service_category_id: app.catId,
          years_experience: 3,
          certification_name: 'Panchayat & Skill Certified Artisan',
          is_verified: true,
        });
        console.log(`Assigned trade skill ${app.trade} to ${app.full_name}`);
      }
    }
  }

  // 4. Ensure welfare_records has live records
  const { data: currentWelfare } = await supabase.from('welfare_records').select('id');
  if (!currentWelfare || currentWelfare.length === 0) {
    const welfareSeed = [
      {
        type: 'Healthcare Emergency',
        policy_number: 'WF-882104',
        provider: 'ShramNexus Cooperative Welfare Fund',
        status: 'approved',
        premium_amount: 15000,
        document_url: 'Emergency Hospital Assistance (Ramesh K.)',
      },
      {
        type: 'Equipment Grant',
        policy_number: 'WF-882105',
        provider: 'ShramNexus Cooperative Welfare Fund',
        status: 'approved',
        premium_amount: 12500,
        document_url: 'Certified Safety Gear & Helmets Distribution',
      },
      {
        type: 'Skill Development',
        policy_number: 'WF-882106',
        provider: 'ShramNexus Cooperative Welfare Fund',
        status: 'approved',
        premium_amount: 8000,
        document_url: 'Skill Upgradation: Solar Inverter Training',
      },
      {
        type: 'Health Camp',
        policy_number: 'WF-882107',
        provider: 'ShramNexus Cooperative Welfare Fund',
        status: 'approved',
        premium_amount: 18500,
        document_url: 'Annual Health Checkup Camp Jaipur',
      },
    ];

    const { error: wfErr } = await supabase.from('welfare_records').insert(welfareSeed);
    if (wfErr) {
      console.error('Error inserting welfare records:', wfErr.message);
    } else {
      console.log('Inserted 4 live welfare_records rows.');
    }
  } else {
    console.log(`welfare_records already has ${currentWelfare.length} rows.`);
  }

  // 5. Check live counts
  const { count: vCount } = await supabase
    .from('workers')
    .select('*', { count: 'exact', head: true })
    .eq('society_id', SHAKTI_ID)
    .eq('is_verified', true);

  const { count: pCount } = await supabase
    .from('workers')
    .select('*', { count: 'exact', head: true })
    .eq('society_id', SHAKTI_ID)
    .eq('verification_status', 'pending');

  console.log(`Shakti Coop now has: ${vCount} verified workers, ${pCount} pending applicants.`);
}

seed();
