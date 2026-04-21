// apps/api/prisma/seed.ts
/* eslint-disable */
import 'dotenv/config'; 
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');
  
  // 1. Create the Roles
  const roles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE', 'SUPPORT', 'LANDLORD', 'TENANT'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }
  console.log('✅ Roles created!');

  // 2. Safely grab credentials from the .env file
  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('⚠️ WARNING: SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD missing in .env. Skipping admin creation.');
    return;
  }

  // 3. Create the default Super Admin user
  const adminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  
  if (adminRole) {
    const hash = await bcrypt.hash(adminPassword, 10);
    
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {}, // We don't overwrite the password if the user already exists!
      create: {
        email: adminEmail,
        password_hash: hash,
        role_id: adminRole.id,
        first_name: 'System',
        last_name: 'Admin',
        is_active: true,
      },
    });
    console.log(`✅ Default admin user created: ${adminEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });