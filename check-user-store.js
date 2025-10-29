// Script to check if user has a store in database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserStore() {
    try {
        // Get all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
            }
        });

        console.log('\n📋 All Users:');
        console.log('─'.repeat(80));
        for (const user of users) {
            console.log(`\nUser ID: ${user.id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Username: ${user.username}`);
            console.log(`Role: ${user.role}`);

            // Check if user has store
            const store = await prisma.store.findFirst({
                where: {
                    userId: user.id,
                    deletedAt: null
                }
            });

            if (store) {
                console.log(`✅ Has Store: YES`);
                console.log(`   Store Name: ${store.storeName}`);
                console.log(`   Store ID: ${store.id}`);
            } else {
                console.log(`❌ Has Store: NO`);
            }
        }

        console.log('\n' + '─'.repeat(80));
        
        // Count stores
        const storeCount = await prisma.store.count({
            where: { deletedAt: null }
        });
        
        console.log(`\n📊 Total Stores: ${storeCount}`);
        console.log(`👥 Total Users: ${users.length}`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserStore();
