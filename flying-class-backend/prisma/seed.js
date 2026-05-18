"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const connectionString = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in the environment variables.');
}
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Start seeding...');
    const adminEmail = 'admin@flyingclass.com';
    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash: 'hashed_password_placeholder',
            role: 'ADMIN',
            isVerified: true,
            profile: {
                create: {
                    fullName: 'System Administrator',
                },
            },
        },
    });
    console.log(`Admin user seeded with ID: ${adminUser.id}`);
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English'];
    for (const name of subjects) {
        await prisma.subject.upsert({
            where: { name },
            update: {},
            create: { name, description: `Standard ${name} curriculum` },
        });
    }
    console.log('Subjects seeded successfully.');
}
main()
    .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map