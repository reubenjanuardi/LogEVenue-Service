/**
 * Seed Mock Data for LOGe Venue Provider
 * 
 * Run this script to populate the database with mock venues, rooms, and sample reservations
 * 
 * Usage:
 *   node seed-data.js
 */

const db = require('./config/database');
const Venue = require('./models/Venue');
const Room = require('./models/Room');
const Reservation = require('./models/Reservation');

// ==============================================
// Mock Data
// ==============================================

const venuesData = [
  {
    name: 'Aula Utama Kampus',
    address: 'Gedung A Lantai 1, Kampus Utama',
    description: 'Aula besar dengan kapasitas hingga 500 orang, dilengkapi dengan sound system profesional dan proyektor HD. Cocok untuk seminar, wisuda, dan acara besar lainnya.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
  },
  {
    name: 'Gedung Seminar',
    address: 'Gedung B Lantai 2-4, Kampus Utama',
    description: 'Gedung khusus seminar dengan 6 ruangan berkapasitas berbeda. Setiap ruangan dilengkapi dengan fasilitas presentasi modern.',
    imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
  },
  {
    name: 'Gedung Olahraga',
    address: 'Area Olahraga Kampus',
    description: 'Fasilitas olahraga indoor dan outdoor untuk berbagai jenis kegiatan atletik dan kompetisi.',
    imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800'
  },
  {
    name: 'Gedung Rektorat',
    address: 'Gedung Rektorat Lantai 3-5',
    description: 'Ruang rapat eksekutif dan ruang konferensi untuk pertemuan formal dan acara resmi.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
  },
  {
    name: 'Student Center',
    address: 'Gedung Student Center',
    description: 'Pusat kegiatan mahasiswa dengan berbagai ruang pertemuan dan area kreativitas.',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800'
  }
];

const roomsData = [
  // Aula Utama Kampus
  {
    venueName: 'Aula Utama Kampus',
    rooms: [
      {
        name: 'Aula Lantai 1',
        capacity: 500,
        facilities: ['Sound System Profesional', 'Proyektor 4K', 'AC Central', 'WiFi 1Gbps', 'Panggung', 'Lighting System', 'Kursi Auditorium']
      },
      {
        name: 'Ruang Persiapan Aula',
        capacity: 50,
        facilities: ['AC', 'WiFi', 'Meja Makeup', 'Cermin Besar', 'Sofa']
      }
    ]
  },
  // Gedung Seminar
  {
    venueName: 'Gedung Seminar',
    rooms: [
      {
        name: 'Ruang Seminar A',
        capacity: 100,
        facilities: ['Proyektor HD', 'AC', 'WiFi', 'Whiteboard', 'Sound System', 'Kursi Lipat']
      },
      {
        name: 'Ruang Seminar B',
        capacity: 80,
        facilities: ['Proyektor HD', 'AC', 'WiFi', 'Whiteboard', 'Sound System', 'Kursi Lipat']
      },
      {
        name: 'Ruang Seminar C',
        capacity: 60,
        facilities: ['Proyektor', 'AC', 'WiFi', 'Whiteboard', 'Kursi Lipat']
      },
      {
        name: 'Ruang Workshop',
        capacity: 40,
        facilities: ['Proyektor', 'AC', 'WiFi', 'Meja Kerja', 'Whiteboard', 'Flipchart']
      },
      {
        name: 'Ruang Diskusi 1',
        capacity: 25,
        facilities: ['TV LED', 'AC', 'WiFi', 'Whiteboard', 'Meja Bundar']
      },
      {
        name: 'Ruang Diskusi 2',
        capacity: 25,
        facilities: ['TV LED', 'AC', 'WiFi', 'Whiteboard', 'Meja Bundar']
      }
    ]
  },
  // Gedung Olahraga
  {
    venueName: 'Gedung Olahraga',
    rooms: [
      {
        name: 'Lapangan Basket Indoor',
        capacity: 200,
        facilities: ['Lapangan Basket Standar', 'Tribun Penonton', 'Lighting', 'Scoreboard Digital', 'Ruang Ganti']
      },
      {
        name: 'Lapangan Futsal',
        capacity: 150,
        facilities: ['Lapangan Futsal Standar', 'Tribun Penonton', 'Lighting', 'Ruang Ganti']
      },
      {
        name: 'Lapangan Badminton',
        capacity: 100,
        facilities: ['4 Lapangan Badminton', 'Tribun Penonton', 'Lighting', 'Ruang Ganti']
      },
      {
        name: 'Fitness Center',
        capacity: 50,
        facilities: ['Alat Fitness Lengkap', 'AC', 'Loker', 'Shower', 'Sound System']
      }
    ]
  },
  // Gedung Rektorat
  {
    venueName: 'Gedung Rektorat',
    rooms: [
      {
        name: 'Ruang Rapat Eksekutif',
        capacity: 20,
        facilities: ['Video Conference System', 'AC', 'WiFi Premium', 'Meja Konferensi', 'Proyektor', 'Catering Support', 'Kursi Eksekutif']
      },
      {
        name: 'Ruang Konferensi',
        capacity: 50,
        facilities: ['Video Conference System', 'AC', 'WiFi', 'Proyektor', 'Sound System', 'Kursi Auditorium']
      },
      {
        name: 'Ruang Senat',
        capacity: 30,
        facilities: ['AC', 'WiFi', 'Proyektor', 'Sound System', 'Meja U-Shape']
      }
    ]
  },
  // Student Center
  {
    venueName: 'Student Center',
    rooms: [
      {
        name: 'Ruang Organisasi A',
        capacity: 30,
        facilities: ['AC', 'WiFi', 'Whiteboard', 'Meja Kerja', 'Printer']
      },
      {
        name: 'Ruang Organisasi B',
        capacity: 30,
        facilities: ['AC', 'WiFi', 'Whiteboard', 'Meja Kerja', 'Printer']
      },
      {
        name: 'Creative Space',
        capacity: 40,
        facilities: ['AC', 'WiFi', 'Whiteboard Besar', 'Bean Bags', 'Meja Kolaborasi', 'Colokan Banyak']
      },
      {
        name: 'Music Room',
        capacity: 20,
        facilities: ['Soundproof', 'AC', 'Drum Set', 'Amplifier', 'Keyboard', 'Microphone']
      },
      {
        name: 'Gaming Room',
        capacity: 25,
        facilities: ['Gaming PCs', 'PlayStation 5', 'AC', 'WiFi Gaming', 'Comfortable Chairs', 'Projector']
      }
    ]
  }
];

// Sample reservations for testing (upcoming dates)
const getUpcomingDate = (daysFromNow, hour) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const createSampleReservations = (roomIds) => {
  // Only create reservations for first few rooms
  const reservations = [];
  
  if (roomIds.length > 0) {
    // Tomorrow morning - Aula
    reservations.push({
      roomId: roomIds[0],
      userId: 1,
      startTime: getUpcomingDate(1, 9),
      endTime: getUpcomingDate(1, 12),
      status: 'confirmed'
    });
    
    // Tomorrow afternoon - Aula
    reservations.push({
      roomId: roomIds[0],
      userId: 2,
      startTime: getUpcomingDate(1, 14),
      endTime: getUpcomingDate(1, 17),
      status: 'confirmed'
    });
  }
  
  if (roomIds.length > 2) {
    // Day after tomorrow - Seminar A
    reservations.push({
      roomId: roomIds[2],
      userId: 1,
      startTime: getUpcomingDate(2, 10),
      endTime: getUpcomingDate(2, 13),
      status: 'confirmed'
    });
    
    // Next week - Seminar B
    reservations.push({
      roomId: roomIds[3],
      userId: 3,
      startTime: getUpcomingDate(7, 9),
      endTime: getUpcomingDate(7, 11),
      status: 'confirmed'
    });
  }
  
  if (roomIds.length > 8) {
    // Basketball court - next weekend
    reservations.push({
      roomId: roomIds[8],
      userId: 4,
      startTime: getUpcomingDate(6, 16),
      endTime: getUpcomingDate(6, 18),
      status: 'confirmed'
    });
  }
  
  return reservations;
};

// ==============================================
// Seed Function
// ==============================================

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    await db.authenticate();
    console.log('✅ Database connected\n');
    
    // Sync database (drop existing tables and recreate)
    console.log('🔄 Syncing database schema...');
    await db.sync({ force: true });
    console.log('✅ Database schema synced\n');
    
    // Create venues
    console.log('📍 Creating venues...');
    const createdVenues = [];
    
    for (const venueData of venuesData) {
      const venue = await Venue.create(venueData);
      createdVenues.push(venue);
      console.log(`   ✓ Created: ${venue.name}`);
    }
    console.log(`✅ ${createdVenues.length} venues created\n`);
    
    // Create rooms
    console.log('🚪 Creating rooms...');
    const createdRoomIds = [];
    let totalRooms = 0;
    
    for (const roomGroup of roomsData) {
      const venue = createdVenues.find(v => v.name === roomGroup.venueName);
      
      if (!venue) {
        console.log(`   ⚠️ Venue not found: ${roomGroup.venueName}`);
        continue;
      }
      
      console.log(`\n   ${venue.name}:`);
      
      for (const roomData of roomGroup.rooms) {
        const room = await Room.create({
          venueId: venue.id,
          name: roomData.name,
          capacity: roomData.capacity,
          facilities: roomData.facilities
        });
        
        createdRoomIds.push(room.id);
        totalRooms++;
        console.log(`      ✓ ${room.name} (Capacity: ${room.capacity})`);
      }
    }
    console.log(`\n✅ ${totalRooms} rooms created\n`);
    
    // Create sample reservations
    console.log('📅 Creating sample reservations...');
    const reservations = createSampleReservations(createdRoomIds);
    
    for (const resData of reservations) {
      const reservation = await Reservation.create(resData);
      const room = await Room.findByPk(reservation.roomId);
      const venue = await Venue.findByPk(room.venueId);
      
      console.log(`   ✓ ${venue.name} - ${room.name}`);
      console.log(`      ${reservation.startTime.toLocaleString()} - ${reservation.endTime.toLocaleString()}`);
    }
    console.log(`✅ ${reservations.length} reservations created\n`);
    
    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 Database seeding completed!');
    console.log('═══════════════════════════════════════');
    console.log(`   Venues:       ${createdVenues.length}`);
    console.log(`   Rooms:        ${totalRooms}`);
    console.log(`   Reservations: ${reservations.length}`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('💡 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Test GraphQL: http://localhost:4002/graphql');
    console.log('   3. Query venues: http://localhost:4002/graphql\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// ==============================================
// Run Seeder
// ==============================================

seedDatabase();