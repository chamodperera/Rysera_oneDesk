// Script to create persistent test data that stays in the database
import { 
  userRepository, 
  departmentRepository, 
  serviceRepository,
  timeslotRepository 
} from '../../models';
import { UserRole } from '../../types/database';
import { hashPassword } from '../../utils/auth';

export class DatabaseSeeder {
  static async createSampleData(): Promise<void> {
    console.log('🌱 Seeding database with sample data...\n');

    try {
      // 1. Create Departments
      console.log('1️⃣ Creating Departments...');
      const departments = [
        {
          name: 'Department of Motor Traffic',
          description: 'Vehicle registration and licensing services',
          contact_email: 'dmt@gov.lk',
          contact_phone: '+94112123456',
          address: 'Narahenpita, Colombo 05'
        },
        {
          name: 'Registrar General Department',
          description: 'Birth, death, and marriage certificates',
          contact_email: 'rgd@gov.lk', 
          contact_phone: '+94112654321',
          address: 'Independence Square, Colombo 07'
        },
        {
          name: 'Immigration and Emigration Department',
          description: 'Passport and visa services',
          contact_email: 'immigration@gov.lk',
          contact_phone: '+94112987654',
          address: 'Battaramulla'
        }
      ];

      const createdDepartments = [];
      for (const deptData of departments) {
        const dept = await departmentRepository.create(deptData);
        createdDepartments.push(dept);
        console.log(`  ✅ Created: ${dept.name} (ID: ${dept.id})`);
      }

      // 2. Create Services
      console.log('\n2️⃣ Creating Services...');
      const services = [
        // DMT Services
        {
          department_id: createdDepartments[0].id,
          name: 'Driving License Application',
          description: 'Apply for new driving license',
          duration_minutes: 45,
          requirements: 'NIC, Medical Certificate, Photos'
        },
        {
          department_id: createdDepartments[0].id,
          name: 'Vehicle Registration',
          description: 'Register new vehicle',
          duration_minutes: 30,
          requirements: 'Invoice, Insurance, Revenue License'
        },
        // RGD Services
        {
          department_id: createdDepartments[1].id,
          name: 'Birth Certificate',
          description: 'Obtain birth certificate',
          duration_minutes: 20,
          requirements: 'Application form, NIC of parents'
        },
        {
          department_id: createdDepartments[1].id,
          name: 'Marriage Certificate',
          description: 'Obtain marriage certificate',
          duration_minutes: 25,
          requirements: 'Marriage registration, NIC copies'
        },
        // Immigration Services
        {
          department_id: createdDepartments[2].id,
          name: 'Passport Application',
          description: 'Apply for new passport',
          duration_minutes: 60,
          requirements: 'NIC, Birth Certificate, Photos, Guarantor Form'
        }
      ];

      const createdServices = [];
      for (const serviceData of services) {
        const service = await serviceRepository.create(serviceData);
        createdServices.push(service);
        console.log(`  ✅ Created: ${service.name} (ID: ${service.id})`);
      }

      // 3. Create Users
      console.log('\n3️⃣ Creating Users...');
      const users = [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone_number: '+94771234567',
          password_hash: await hashPassword('citizen123'),
          role: UserRole.CITIZEN
        },
        {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          phone_number: '+94777654321',
          password_hash: await hashPassword('citizen123'),
          role: UserRole.CITIZEN
        },
        {
          first_name: 'Officer',
          last_name: 'Johnson',
          email: 'officer@onedesk.gov.lk',
          phone_number: '+94722222222',
          password_hash: await hashPassword('officer123'),
          role: UserRole.OFFICER
        },
        {
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@onedesk.gov.lk',
          phone_number: '+94711111111',
          password_hash: await hashPassword('admin123'),
          role: UserRole.ADMIN
        },
        {
          first_name: 'Super',
          last_name: 'Admin',
          email: 'superadmin@onedesk.gov.lk',
          phone_number: '+94700000000',
          password_hash: await hashPassword('superadmin123'),
          role: UserRole.ADMIN // Use ADMIN instead of SUPERADMIN since enum doesn't support it
        }
      ];

      const createdUsers = [];
      for (const userData of users) {
        const user = await userRepository.create(userData);
        createdUsers.push(user);
        console.log(`  ✅ Created: ${user.first_name} ${user.last_name} (${user.role}) - ID: ${user.id}`);
      }

      // 4. Create Timeslots for next week
      console.log('\n4️⃣ Creating Timeslots...');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      for (let dayOffset = 0; dayOffset < 5; dayOffset++) { // 5 working days
        const currentDate = new Date(tomorrow);
        currentDate.setDate(currentDate.getDate() + dayOffset);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Create morning and afternoon slots for each service
        for (const service of createdServices) {
          const timeslots = [
            {
              service_id: service.id,
              slot_date: dateStr,
              start_time: '09:00:00',
              end_time: '10:00:00',
              capacity: 5,
              slots_available: 5
            },
            {
              service_id: service.id,
              slot_date: dateStr,
              start_time: '10:30:00',
              end_time: '11:30:00',
              capacity: 5,
              slots_available: 5
            },
            {
              service_id: service.id,
              slot_date: dateStr,
              start_time: '14:00:00',
              end_time: '15:00:00',
              capacity: 3,
              slots_available: 3
            },
            {
              service_id: service.id,
              slot_date: dateStr,
              start_time: '15:30:00',
              end_time: '16:30:00',
              capacity: 3,
              slots_available: 3
            }
          ];

          for (const timeslotData of timeslots) {
            const timeslot = await timeslotRepository.create(timeslotData);
            console.log(`  ✅ Created timeslot: ${service.name} - ${dateStr} ${timeslot.start_time}`);
          }
        }
      }

      console.log('\n🎉 Sample data creation completed successfully!');
      
      // 5. Verify data was created
      console.log('\n📊 Verification - Current database counts:');
      const counts = {
        departments: await departmentRepository.count(),
        services: await serviceRepository.count(),
        users: await userRepository.count(),
        timeslots: await timeslotRepository.count()
      };
      
      console.log(`  - Departments: ${counts.departments}`);
      console.log(`  - Services: ${counts.services}`);
      console.log(`  - Users: ${counts.users}`);
      console.log(`  - Timeslots: ${counts.timeslots}`);

      return;

    } catch (error) {
      console.error('\n❌ Sample data creation failed:', error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    console.log('🧹 Clearing all data from database...\n');

    try {
      // Delete in reverse dependency order
      const timeslots = await timeslotRepository.findAll();
      for (const timeslot of timeslots) {
        await timeslotRepository.delete(timeslot.id);
      }
      console.log(`✅ Deleted ${timeslots.length} timeslots`);

      const users = await userRepository.findAll();
      for (const user of users) {
        await userRepository.delete(user.id);
      }
      console.log(`✅ Deleted ${users.length} users`);

      const services = await serviceRepository.findAll();
      for (const service of services) {
        await serviceRepository.delete(service.id);
      }
      console.log(`✅ Deleted ${services.length} services`);

      const departments = await departmentRepository.findAll();
      for (const department of departments) {
        await departmentRepository.delete(department.id);
      }
      console.log(`✅ Deleted ${departments.length} departments`);

      console.log('\n🎉 All data cleared successfully!');

    } catch (error) {
      console.error('\n❌ Data clearing failed:', error);
      throw error;
    }
  }

  static async showCurrentData(): Promise<void> {
    console.log('📋 Current Database Contents:\n');

    try {
      // Show departments with services
      const departments = await departmentRepository.findAll();
      console.log(`📁 Departments (${departments.length}):`);
      for (const dept of departments) {
        console.log(`  ${dept.id}. ${dept.name}`);
        const services = await serviceRepository.findByDepartment(dept.id);
        for (const service of services) {
          console.log(`     └── ${service.id}. ${service.name}`);
        }
      }

      // Show users by role
      const users = await userRepository.findAll();
      console.log(`\n👥 Users (${users.length}):`);
      const usersByRole = users.reduce((acc, user) => {
        acc[user.role] = acc[user.role] || [];
        acc[user.role].push(user);
        return acc;
      }, {} as Record<string, typeof users>);

      Object.entries(usersByRole).forEach(([role, roleUsers]) => {
        console.log(`  ${role.toUpperCase()}:`);
        roleUsers.forEach(user => {
          console.log(`    ${user.id}. ${user.first_name} ${user.last_name} (${user.email})`);
        });
      });

      // Show timeslot summary
      const timeslots = await timeslotRepository.findAll();
      console.log(`\n⏰ Timeslots (${timeslots.length}):`);
      const slotsByDate = timeslots.reduce((acc, slot) => {
        acc[slot.slot_date] = acc[slot.slot_date] || [];
        acc[slot.slot_date].push(slot);
        return acc;
      }, {} as Record<string, typeof timeslots>);

      Object.entries(slotsByDate).forEach(([date, dateSlots]) => {
        console.log(`  ${date}: ${dateSlots.length} slots`);
      });

    } catch (error) {
      console.error('\n❌ Failed to show data:', error);
      throw error;
    }
  }
}

// CLI interface
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const action = process.argv[2];

if (process.argv[1] === __filename) {
  switch (action) {
    case 'seed':
      DatabaseSeeder.createSampleData()
        .then(() => {
          console.log('\n✅ Database seeded successfully!');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Seeding failed:', error);
          process.exit(1);
        });
      break;

    case 'clear':
      DatabaseSeeder.clearAllData()
        .then(() => {
          console.log('\n✅ Database cleared successfully!');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Clearing failed:', error);
          process.exit(1);
        });
      break;

    case 'show':
      DatabaseSeeder.showCurrentData()
        .then(() => {
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Show failed:', error);
          process.exit(1);
        });
      break;

    default:
      console.log('Usage:');
      console.log('  npx tsx src/utils/databaseSeeder.ts seed  - Create sample data');
      console.log('  npx tsx src/utils/databaseSeeder.ts clear - Clear all data');
      console.log('  npx tsx src/utils/databaseSeeder.ts show  - Show current data');
      process.exit(1);
  }
}
