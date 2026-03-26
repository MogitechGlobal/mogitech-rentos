// apps/api/src/prisma/prisma.service.ts
/* eslint-disable */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Create a connection pool to PostgreSQL
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL 
    });
    
    // 2. Pass that pool into Prisma's new Postgres Adapter
    const adapter = new PrismaPg(pool as any);
    
    // 3. Initialize the Prisma Client with the adapter
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}