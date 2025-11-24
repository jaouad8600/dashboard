import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data (development only!)
    if (process.env.NODE_ENV !== 'production') {
        console.log('🗑️  Clearing existing data...');
        await prisma.restorativeTalk.deleteMany();
        await prisma.materialUsage.deleteMany();
        await prisma.material.deleteMany();
        await prisma.sportIndication.deleteMany();
        await prisma.sportMutation.deleteMany();
        await prisma.report.deleteMany();
        await prisma.note.deleteMany();
        await prisma.extraSportMoment.deleteMany();
        await prisma.incident.deleteMany();
        await prisma.youth.deleteMany();
        await prisma.group.deleteMany();
        await prisma.user.deleteMany();
    }

    // Create users
    console.log('👥 Creating users...');
    const users = await Promise.all([
        prisma.user.create({
            data: {
                name: 'Jan de Vries',
                email: 'jan@sportdash.local',
                role: 'SPORTDOCENT',
            },
        }),
        prisma.user.create({
            data: {
                name: 'Maria Jansen',
                email: 'maria@sportdash.local',
                role: 'BEGELEIDER',
            },
        }),
    ]);

    // Create groups
    console.log('🏃 Creating groups...');
    const groups = await Promise.all([
        prisma.group.create({
            data: {
                name: 'De Vliet',
                color: 'GROEN',
                department: 'Noord',
                youthCount: 8,
            },
        }),
        prisma.group.create({
            data: {
                name: 'Parkzicht',
                color: 'GEEL',
                department: 'Zuid',
                youthCount: 6,
            },
        }),
        prisma.group.create({
            data: {
                name: 'Bergweg',
                color: 'ORANJE',
                department: 'Oost',
                youthCount: 10,
            },
        }),
        prisma.group.create({
            data: {
                name: 'Centrum',
                color: 'ROOD',
                department: 'Centrum',
                youthCount: 12,
            },
        }),
    ]);

    // Create youths
    console.log('👦👧 Creating youths...');
    const youthNames = [
        { first: 'Ahmed', last: 'Hassan' },
        { first: 'Lisa', last: 'de Jong' },
        { first: 'Mohammed', last: 'Ali' },
        { first: 'Emma', last: 'van den Berg' },
        { first: 'Youssef', last: 'El Amrani' },
        { first: 'Sophie', last: 'Bakker' },
        { first: 'Omar', last: 'Khalil' },
        { first: 'Nina', last: 'Visser' },
    ];

    for (const group of groups) {
        const groupYouths = youthNames.slice(0, Math.min(group.youthCount, youthNames.length));
        for (const { first, last } of groupYouths) {
            await prisma.youth.create({
                data: {
                    firstName: first,
                    lastName: last,
                    groupId: group.id,
                },
            });
        }
    }

    // Create notes
    console.log('📝 Creating notes...');
    await prisma.note.create({
        data: {
            content: 'Groep draait goed, positieve sfeer tijdens sportactiviteiten.',
            groupId: groups[0].id,
            authorId: users[0].id,
        },
    });

    await prisma.note.create({
        data: {
            content: 'Extra aandacht nodig voor teambuilding. Enkele conflicten deze week.',
            groupId: groups[3].id,
            authorId: users[1].id,
            archived: false,
        },
    });

    // Create reports
    console.log('📄 Creating reports...');
    await prisma.report.create({
        data: {
            groupId: groups[0].id,
            date: new Date(),
            type: 'SESSION',
            cleanedText: 'Voetbaltraining met 8 jongeren. Goede samenwerking.',
            sessionSummary: 'Voetbal - Positief',
            authorId: users[0].id,
        },
    });

    // Create materials
    console.log('⚽ Creating materials...');
    await Promise.all([
        prisma.material.create({
            data: {
                name: 'Voetballen',
                category: 'BALLEN',
                quantityTotal: 20,
                quantityUsable: 18,
                location: 'Magazijn A',
                conditionStatus: 'GOED',
            },
        }),
        prisma.material.create({
            data: {
                name: 'Basketballen',
                category: 'BALLEN',
                quantityTotal: 15,
                quantityUsable: 12,
                location: 'Magazijn A',
                conditionStatus: 'LICHT_BESCHADIGD',
            },
        }),
        prisma.material.create({
            data: {
                name: 'Yogamatten',
                category: 'MATTEN',
                quantityTotal: 25,
                quantityUsable: 25,
                location: 'Magazijn B',
                conditionStatus: 'GOED',
            },
        }),
    ]);

    // Create restorative talks
    console.log('💬 Creating restorative talks...');
    await prisma.restorativeTalk.create({
        data: {
            groupId: groups[3].id,
            youthName: 'Ahmed H.',
            status: 'PENDING',
            createdBy: users[1].id,
        },
    });

    console.log('✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${groups.length} groups created`);
    console.log(`   - Multiple youths, notes, reports, and materials created`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
