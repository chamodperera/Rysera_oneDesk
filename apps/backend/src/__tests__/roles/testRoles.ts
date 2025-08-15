// Quick script to test what user roles are actually supported in the database
import { userRepository } from '../../models';
import { hashPassword } from '../../utils/auth';

async function testUserRoles() {
  console.log('🔍 Testing supported user roles...\n');

  const testRoles = ['citizen', 'officer', 'admin', 'superadmin', 'super_admin'];
  
  for (const role of testRoles) {
    try {
      console.log(`Testing role: "${role}"`);
      
      const testUser = await userRepository.create({
        first_name: 'Test',
        last_name: `Role${role}`,
        email: `test-${role}@example.com`,
        phone_number: `+947${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        password_hash: await hashPassword('test123'),
        role: role as any
      });
      
      console.log(`  ✅ "${role}" - SUCCESS (ID: ${testUser.id})`);
      
      // Clean up
      await userRepository.delete(testUser.id);
      
    } catch (error: any) {
      console.log(`  ❌ "${role}" - FAILED: ${error.message}`);
    }
  }
}

testUserRoles().then(() => {
  console.log('\n✅ Role testing completed');
}).catch(console.error);
