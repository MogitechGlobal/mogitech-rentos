// packages/database/prisma/seed.ts
/* eslint-disable */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = ['ADMIN', 'LANDLORD', 'MANAGER', 'TENANT'];
  
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  // Create default admin
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const hash = await bcrypt.hash('Admin@123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@mogitech.com' },
    update: {},
    create: {
      email: 'admin@mogitech.com',
      password_hash: hash,
      role_id: adminRole!.id,
    },
  });
}

main().finally(() => prisma.$disconnect());