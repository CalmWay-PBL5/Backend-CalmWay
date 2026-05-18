import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { FullDatasetSeeder } from "./seeders/full-dataset.seeder";

const databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("PRISMA_DATABASE_URL or DATABASE_URL is required to run seed.");
}

const databaseSchema = new URL(databaseUrl).searchParams.get("schema") || "public";
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool, { schema: databaseSchema });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 BẮT ĐẦU QUÁ TRÌNH SEED DATABASE...\n");

  try {
    const fullSeeder = new FullDatasetSeeder(prisma);
    await fullSeeder.run();

    console.log("\n🎉 HOÀN TẤT SEED DATABASE THÀNH CÔNG!");
  } catch (error) {
    console.error("\n❌ CÓ LỖI XẢY RA TRONG QUÁ TRÌNH SEED:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
