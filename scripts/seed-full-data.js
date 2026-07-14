const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    throw new Error(`Environment file not found: ${envPath}`);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const [key, ...rest] = line.split('=');
    if (!key || rest.length === 0) {
      continue;
    }

    const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    process.env[key.trim()] = process.env[key.trim()] ?? value;
  }
}

function getEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createSupabaseClient() {
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseServiceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function seedProductCategories(supabase) {
  console.log('🏷️  Seeding product categories...');
  
  const categories = [
    { name: 'Makanan' },
    { name: 'Vitamin & Suplemen' },
    { name: 'Obat-obatan' },
    { name: 'Alat Kesehatan' },
    { name: 'Aksesoris' },
    { name: 'Toilet Training' },
    { name: 'Mainan' },
  ];

  const { data, error } = await supabase
    .from('product_categories')
    .insert(categories)
    .select();

  if (error) {
    console.warn(`  ⚠️  Categories might already exist: ${error.message}`);
    const { data: existing } = await supabase
      .from('product_categories')
      .select('*');
    return existing || [];
  }

  console.log(`  ✓ Created ${data?.length || 0} categories`);
  return data || [];
}

async function seedProducts(supabase, categories) {
  console.log('📦 Seeding products...');
  
  const products = [
    {
      name: 'Cat Food Premium',
      category_id: categories[0]?.id,
      sku: 'CF-001',
      price: 95000,
      cost_price: 60000,
      stock_qty: 50,
      unit: 'bag',
      min_stock_alert: 10,
      is_active: true,
    },
    {
      name: 'Dog Food Chicken',
      category_id: categories[0]?.id,
      sku: 'DF-001',
      price: 120000,
      cost_price: 75000,
      stock_qty: 45,
      unit: 'bag',
      min_stock_alert: 10,
      is_active: true,
    },
    {
      name: 'Vitamin B Complex',
      category_id: categories[1]?.id,
      sku: 'VIT-001',
      price: 45000,
      cost_price: 25000,
      stock_qty: 100,
      unit: 'bottle',
      min_stock_alert: 20,
      is_active: true,
    },
    {
      name: 'Antibiotic Spray',
      category_id: categories[2]?.id,
      sku: 'ABX-001',
      price: 75000,
      cost_price: 40000,
      stock_qty: 30,
      unit: 'bottle',
      min_stock_alert: 5,
      is_active: true,
    },
    {
      name: 'Thermometer Digital',
      category_id: categories[3]?.id,
      sku: 'THERM-001',
      price: 150000,
      cost_price: 90000,
      stock_qty: 15,
      unit: 'pcs',
      min_stock_alert: 3,
      is_active: true,
    },
    {
      name: 'Dog Leash Nylon',
      category_id: categories[4]?.id,
      sku: 'LEASH-001',
      price: 35000,
      cost_price: 18000,
      stock_qty: 60,
      unit: 'pcs',
      min_stock_alert: 10,
      is_active: true,
    },
    {
      name: 'Cat Litter Box',
      category_id: categories[5]?.id,
      sku: 'LITTER-001',
      price: 175000,
      cost_price: 100000,
      stock_qty: 20,
      unit: 'pcs',
      min_stock_alert: 5,
      is_active: true,
    },
    {
      name: 'Interactive Ball Toy',
      category_id: categories[6]?.id,
      sku: 'TOY-001',
      price: 55000,
      cost_price: 30000,
      stock_qty: 80,
      unit: 'pcs',
      min_stock_alert: 15,
      is_active: true,
    },
  ];

  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (error) {
    console.warn(`  ⚠️  Products might already exist: ${error.message}`);
    const { data: existing } = await supabase
      .from('products')
      .select('*');
    return existing || [];
  }

  console.log(`  ✓ Created ${data?.length || 0} products`);
  return data || [];
}

async function seedServices(supabase) {
  console.log('🏥 Seeding services...');
  
  const services = [
    {
      name: 'Vaksinasi Dasar',
      description: 'Vaksinasi dasar untuk hewan peliharaan baru',
      price: 250000,
      duration_minutes: 30,
      is_active: true,
    },
    {
      name: 'Pembersihan Gigi',
      description: 'Pembersihan gigi profesional',
      price: 400000,
      duration_minutes: 60,
      is_active: true,
    },
    {
      name: 'Operasi Steril',
      description: 'Operasi steril / kastrasi',
      price: 1200000,
      duration_minutes: 120,
      is_active: true,
    },
    {
      name: 'Grooming Standar',
      description: 'Pemangkasan bulu standar',
      price: 300000,
      duration_minutes: 90,
      is_active: true,
    },
    {
      name: 'Konsultasi Dokter',
      description: 'Konsultasi dengan dokter hewan profesional',
      price: 150000,
      duration_minutes: 30,
      is_active: true,
    },
    {
      name: 'Pemeriksaan Kesehatan',
      description: 'Pemeriksaan kesehatan menyeluruh',
      price: 350000,
      duration_minutes: 45,
      is_active: true,
    },
  ];

  const { data, error } = await supabase
    .from('services')
    .insert(services)
    .select();

  if (error) {
    console.warn(`  ⚠️  Services might already exist: ${error.message}`);
    const { data: existing } = await supabase
      .from('services')
      .select('*');
    return existing || [];
  }

  console.log(`  ✓ Created ${data?.length || 0} services`);
  return data || [];
}

async function seedCustomerAndPets(supabase, ownerProfile) {
  console.log('👥 Seeding customers and pets...');
  
  const customers = [
    {
      full_name: 'Budi Santoso',
      phone: '08123456789',
      address: 'Jl. Merdeka No. 10, Jakarta',
      created_by: ownerProfile.id,
    },
    {
      full_name: 'Siti Nurhaliza',
      phone: '08234567890',
      address: 'Jl. Sudirman No. 20, Jakarta',
      created_by: ownerProfile.id,
    },
    {
      full_name: 'Ahmad Wijaya',
      phone: '08345678901',
      address: 'Jl. Gatot Subroto No. 30, Jakarta',
      created_by: ownerProfile.id,
    },
  ];

  const { data: customersData, error: customersError } = await supabase
    .from('customers')
    .insert(customers)
    .select();

  if (customersError) {
    console.warn(`  ⚠️  Customers might already exist: ${customersError.message}`);
    const { data: existing } = await supabase
      .from('customers')
      .select('*');
    customersData = existing || [];
  }

  console.log(`  ✓ Created ${customersData?.length || 0} customers`);

  // Seed pets
  const pets = [
    {
      customer_id: customersData[0]?.id,
      name: 'Mittens',
      species: 'Kucing',
      breed: 'Persia',
      sex: 'Female',
      birth_date: '2021-06-15',
      weight_kg: 3.5,
      notes: 'Kucing peliharaan kesayangan Budi',
    },
    {
      customer_id: customersData[0]?.id,
      name: 'Max',
      species: 'Anjing',
      breed: 'Golden Retriever',
      sex: 'Male',
      birth_date: '2020-03-20',
      weight_kg: 28.5,
      notes: 'Anjing keluarga yang sangat ramah',
    },
    {
      customer_id: customersData[1]?.id,
      name: 'Whiskers',
      species: 'Kucing',
      breed: 'Siamese',
      sex: 'Female',
      birth_date: '2022-01-10',
      weight_kg: 2.8,
      notes: 'Kucing muda yang aktif dan lincah',
    },
    {
      customer_id: customersData[2]?.id,
      name: 'Rocky',
      species: 'Anjing',
      breed: 'German Shepherd',
      sex: 'Male',
      birth_date: '2019-11-05',
      weight_kg: 32.0,
      notes: 'Anjing penjaga yang loyal',
    },
  ];

  const { data: petsData, error: petsError } = await supabase
    .from('pets')
    .insert(pets)
    .select();

  if (petsError) {
    console.warn(`  ⚠️  Pets might already exist: ${petsError.message}`);
    const { data: existing } = await supabase
      .from('pets')
      .select('*');
    petsData = existing || [];
  }

  console.log(`  ✓ Created ${petsData?.length || 0} pets`);

  return { customers: customersData, pets: petsData };
}

async function main() {
  const envPath = path.resolve(process.cwd(), '.env.development.local');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    loadEnvFile(envPath);
  }

  const supabase = createSupabaseClient();

  console.log('🌱 Starting full data seed...\n');

  // Get owner profile for creating relations
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'owner')
    .limit(1)
    .maybeSingle();

  if (!ownerProfile) {
    throw new Error('Owner profile not found. Run seed-auth-users.js first.');
  }

  // Seed core data
  const categories = await seedProductCategories(supabase);
  const products = await seedProducts(supabase, categories);
  const services = await seedServices(supabase);
  const { customers, pets } = await seedCustomerAndPets(supabase, ownerProfile);

  console.log('\n✅ Seed complete! Data is ready for testing.\n');
  console.log('📊 Summary:');
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Services: ${services.length}`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Pets: ${pets.length}`);
}

main().catch((error) => {
  console.error('❌ Error:', error.message || error);
  process.exit(1);
});
