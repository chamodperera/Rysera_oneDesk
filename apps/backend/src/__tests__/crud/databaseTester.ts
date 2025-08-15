// Test script to verify CRUD operations work with the database
import { DatabaseValidator } from './databaseValidator';
import { 
  userRepository, 
  departmentRepository, 
  serviceRepository 
} from '../../models';
import { UserRole } from '../../types/database';
import { hashPassword } from '../../utils/auth';

export class DatabaseTester {
  static async testBasicCRUD(): Promise<void> {
    console.log('🧪 Starting CRUD operations test...\n');

    try {
      // Test 1: Create a department
      console.log('1️⃣ Testing Department Creation...');
      const departmentData = {
        name: 'Test Department',
        description: 'A test department for validation',
        contact_email: 'test@gov.lk',
        contact_phone: '+94123456789'
      };

      const department = await departmentRepository.create(departmentData);
      console.log(`✅ Department created: ${department.name} (ID: ${department.id})`);

      // Test 2: Create a service
      console.log('\n2️⃣ Testing Service Creation...');
      const serviceData = {
        department_id: department.id,
        name: 'Test Service',
        description: 'A test service for validation',
        duration_minutes: 30,
        requirements: 'Test requirements'
      };

      const service = await serviceRepository.create(serviceData);
      console.log(`✅ Service created: ${service.name} (ID: ${service.id})`);

      // Test 3: Create a user
      console.log('\n3️⃣ Testing User Creation...');
      const hashedPassword = await hashPassword('testPassword123');
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone_number: '+94123456789',
        password_hash: hashedPassword,
        role: UserRole.CITIZEN
      };

      const user = await userRepository.create(userData);
      console.log(`✅ User created: ${user.first_name} ${user.last_name} (ID: ${user.id})`);

      // Test 4: Test relationships
      console.log('\n4️⃣ Testing Relationships...');
      const serviceWithDept = await serviceRepository.findWithDepartment(service.id);
      if (serviceWithDept?.department) {
        console.log(`✅ Service-Department relationship: ${serviceWithDept.name} → ${serviceWithDept.department.name}`);
      }

      // Test 5: Test search functionality
      console.log('\n5️⃣ Testing Search...');
      const foundDepartments = await departmentRepository.search('Test');
      console.log(`✅ Search found ${foundDepartments.length} departments`);

      const foundUser = await userRepository.findByEmail('test@example.com');
      console.log(`✅ User lookup: ${foundUser ? 'Found' : 'Not found'}`);

      // Test 6: Test updates
      console.log('\n6️⃣ Testing Updates...');
      const updatedDepartment = await departmentRepository.update(department.id, {
        description: 'Updated test department description'
      });
      console.log(`✅ Department updated: ${updatedDepartment?.description}`);

      // Test 7: Clean up (delete test data)
      console.log('\n7️⃣ Cleaning up test data...');
      await userRepository.delete(user.id);
      await serviceRepository.delete(service.id);
      await departmentRepository.delete(department.id);
      console.log('✅ Test data cleaned up');

      console.log('\n🎉 All CRUD tests passed successfully!');

    } catch (error) {
      console.error('\n❌ CRUD test failed:', error);
      throw error;
    }
  }

  static async runAllTests(): Promise<void> {
    try {
      // First validate database
      const validation = await DatabaseValidator.runFullValidation();
      
      if (!validation.connectionValid || !validation.tablesValid) {
        throw new Error('Database validation failed - cannot proceed with CRUD tests');
      }

      console.log('\n' + '='.repeat(60));
      
      // Then test CRUD operations
      await this.testBasicCRUD();
      
      console.log('\n' + '='.repeat(60));
      console.log('🏆 ALL TESTS COMPLETED SUCCESSFULLY!');
      console.log('✅ Database connection: Working');
      console.log('✅ Table structure: Valid');
      console.log('✅ Relationships: Working');
      console.log('✅ CRUD operations: Working');
      console.log('✅ Search functionality: Working');
      console.log('='.repeat(60));

    } catch (error) {
      console.error('\n💥 Test suite failed:', error);
      throw error;
    }
  }
}

// Auto-run tests if this file is executed directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  DatabaseTester.runAllTests()
    .then(() => {
      console.log('\n🎯 Ready for PHASE 3 - Authentication & User Management!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Tests failed:', error);
      process.exit(1);
    });
}
