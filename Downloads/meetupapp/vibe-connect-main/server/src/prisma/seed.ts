import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Check if we should skip seeding (to preserve existing data)
  const skipSeed = process.env.SKIP_SEED === 'true' || process.env.NODE_ENV === 'production';
  if (skipSeed) {
    console.log('⏭️  Skipping seed (SKIP_SEED=true or production mode)');
    console.log('💡 To seed anyway, set SKIP_SEED=false');
    return;
  }

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
      isVerified: true,
      latitude: 40.7128,
      longitude: -74.0060, // New York
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      displayName: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      isVerified: true,
      latitude: 40.7580,
      longitude: -73.9855, // New York
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'user3@example.com' },
    update: {},
    create: {
      email: 'user3@example.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Johnson',
      displayName: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      isVerified: true,
      latitude: 40.7614,
      longitude: -73.9776,
    },
  });

  console.log('✅ Created users');

  // Create venues
  const venue1 = await prisma.venue.upsert({
    where: { id: 'venue-1' },
    update: {},
    create: {
      id: 'venue-1',
      name: 'Panther Coffee',
      description: 'A popular coffee shop in Wynwood known for its excellent coffee and vibrant atmosphere',
      address: '2390 NW 2nd Ave',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      zipCode: '33127',
      latitude: 25.8014,
      longitude: -80.1994,
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
      website: 'https://panthercoffee.com',
      phone: '+1-305-677-3952',
      capacity: 50,
      amenities: ['WiFi', 'Outdoor Seating', 'Parking'],
    },
  });

  const venue2 = await prisma.venue.upsert({
    where: { id: 'venue-2' },
    update: {},
    create: {
      id: 'venue-2',
      name: 'Miami Tennis Club',
      description: 'Premier tennis facility with professional courts and coaching',
      address: '7300 Crandon Blvd',
      city: 'Key Biscayne',
      state: 'FL',
      country: 'USA',
      zipCode: '33149',
      latitude: 25.6931,
      longitude: -80.1620,
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
      website: 'https://miamitennisclub.com',
      phone: '+1-305-361-5253',
      capacity: 100,
      amenities: ['Parking', 'Pro Shop', 'Locker Rooms', 'Restaurant'],
    },
  });

  const venue3 = await prisma.venue.upsert({
    where: { id: 'venue-3' },
    update: {},
    create: {
      id: 'venue-3',
      name: 'Equinox South Beach',
      description: 'Luxury fitness and wellness center',
      address: '1685 Collins Ave',
      city: 'Miami Beach',
      state: 'FL',
      country: 'USA',
      zipCode: '33139',
      latitude: 25.7907,
      longitude: -80.1300,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      website: 'https://equinox.com',
      phone: '+1-305-538-7866',
      capacity: 200,
      amenities: ['Parking', 'Spa', 'Pool', 'Cafe'],
    },
  });

  const venue4 = await prisma.venue.upsert({
    where: { id: 'venue-4' },
    update: {},
    create: {
      id: 'venue-4',
      name: 'Zuma Miami',
      description: 'Contemporary Japanese restaurant',
      address: '270 Biscayne Blvd Way',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      zipCode: '33131',
      latitude: 25.7743,
      longitude: -80.1900,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      website: 'https://zumarestaurant.com',
      phone: '+1-305-577-0277',
      capacity: 150,
      amenities: ['Valet Parking', 'Private Dining', 'Bar'],
    },
  });

  console.log('✅ Created venues');

  // Create meetups
  const meetup1 = await prisma.meetup.create({
    data: {
      title: 'Saturday Morning Coffee & Chat',
      description: 'Join us for a relaxed coffee meetup! Great for networking and making new friends. All welcome!',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      maxAttendees: 12,
      category: 'Coffee',
      tags: ['coffee', 'networking', 'social'],
      creatorId: user1.id,
      venueId: venue1.id,
      latitude: 25.8014,
      longitude: -80.1994,
    },
  });

  const meetup2 = await prisma.meetup.create({
    data: {
      title: 'Kids Playdate at the Park',
      description: 'Family-friendly playdate for kids and parents. Bring snacks and toys!',
      image: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800',
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      maxAttendees: 15,
      category: 'Playdate',
      tags: ['family', 'kids', 'outdoor'],
      creatorId: user2.id,
      latitude: 25.7907,
      longitude: -80.1300,
    },
  });

  const meetup3 = await prisma.meetup.create({
    data: {
      title: 'Tennis Doubles Match',
      description: 'Looking for tennis partners for doubles. Intermediate level preferred.',
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      maxAttendees: 4,
      category: 'Sports',
      tags: ['tennis', 'sports', 'fitness'],
      creatorId: user3.id,
      venueId: venue2.id,
      latitude: 25.6931,
      longitude: -80.1620,
    },
  });

  console.log('✅ Created meetups');

  // Create classes
  const class1 = await prisma.class.create({
    data: {
      title: 'Beginner Tennis Class',
      description: 'Learn the fundamentals of tennis in a fun, supportive environment. Perfect for beginners! We\'ll cover basic strokes, footwork, and court positioning.',
      skill: 'Tennis',
      category: 'Sports',
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours
      maxStudents: 12,
      price: 50,
      schedule: 'Every Saturday 10:00 AM - 12:00 PM',
      venueId: venue2.id,
      latitude: 25.6931,
      longitude: -80.1620,
    },
  });

  const class2 = await prisma.class.create({
    data: {
      title: 'Vinyasa Flow Yoga',
      description: 'Join us for an energizing vinyasa flow class suitable for all levels. Improve flexibility, strength, and mindfulness.',
      skill: 'Yoga',
      category: 'Wellness',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000), // 75 minutes
      maxStudents: 20,
      price: 25,
      schedule: 'Every Monday, Wednesday, Friday 6:00 PM - 7:15 PM',
      venueId: venue3.id,
      latitude: 25.7907,
      longitude: -80.1300,
    },
  });

  const class3 = await prisma.class.create({
    data: {
      title: 'Sushi Making Workshop',
      description: 'Learn to make authentic Japanese sushi from professional chefs. Includes all ingredients and take-home recipes.',
      skill: 'Cooking',
      category: 'Culinary',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
      startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours
      maxStudents: 8,
      price: 85,
      schedule: 'Monthly on first Saturday',
      venueId: venue4.id,
      latitude: 25.7743,
      longitude: -80.1900,
    },
  });

  const class4 = await prisma.class.create({
    data: {
      title: 'Piano Lessons for Beginners',
      description: 'Start your musical journey! Learn piano basics, reading music, and play your first songs. All ages welcome.',
      skill: 'Piano',
      category: 'Music',
      image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800',
      startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour
      maxStudents: 6,
      price: 40,
      schedule: 'Every Sunday 2:00 PM - 3:00 PM',
      venueId: venue1.id,
      latitude: 25.8014,
      longitude: -80.1994,
    },
  });

  console.log('✅ Created classes');

  // Create enrollments
  await prisma.classEnrollment.create({
    data: {
      classId: class1.id,
      userId: user1.id,
      status: 'enrolled',
    },
  });

  await prisma.classEnrollment.create({
    data: {
      classId: class1.id,
      userId: user2.id,
      status: 'enrolled',
    },
  });

  await prisma.classEnrollment.create({
    data: {
      classId: class2.id,
      userId: user1.id,
      status: 'enrolled',
    },
  });

  console.log('✅ Created class enrollments');

  // Create meetup members
  await prisma.meetupMember.create({
    data: {
      meetupId: meetup1.id,
      userId: user2.id,
      status: 'going',
    },
  });

  await prisma.meetupMember.create({
    data: {
      meetupId: meetup1.id,
      userId: user3.id,
      status: 'going',
    },
  });

  await prisma.meetupMember.create({
    data: {
      meetupId: meetup2.id,
      userId: user1.id,
      status: 'going',
    },
  });

  console.log('✅ Created meetup members');

  console.log('🎉 Seeding completed!');
  console.log('\n📝 Test Credentials:');
  console.log('  User 1: user1@example.com / password123');
  console.log('  User 2: user2@example.com / password123');
  console.log('  User 3: user3@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
