// apps/api/prisma/seed.ts
/* eslint-disable */
import 'dotenv/config'; // Loads your .env file
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// 1. Set up the connection just like we did in the app
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);

// 2. Give the adapter to Prisma
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // 1. Create the Roles
  const roles = ['ADMIN', 'LANDLORD', 'MANAGER', 'TENANT'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }
  console.log('✅ Roles created!');

  // 2. Create a default Admin user
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  
  if (adminRole) {
    const hash = await bcrypt.hash('Admin@123', 10);
    
    await prisma.user.upsert({
      where: { email: 'admin@mogitech.com' },
      update: {},
      create: {
        email: 'admin@mogitech.com',
        password_hash: hash,
        role_id: adminRole.id,
      },
    });
    console.log('✅ Default admin user created!');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Close the database connection
  });