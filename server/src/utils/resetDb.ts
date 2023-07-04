import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.role.createMany({
        data: [
            {
                title: 'user',
            },
            {
                title: 'admin',
            },
        ],
    });
    await prisma.authProvider.createMany({
        data: [
            {
                providerName: 'local',
            },
            {
                providerName: 'google',
            },
            {
                providerName: 'facebook',
            },
        ],
    });
}

main();
