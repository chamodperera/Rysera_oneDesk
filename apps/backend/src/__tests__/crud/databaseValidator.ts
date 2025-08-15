// Database schema validation and connection testing
import { DatabaseUtils } from '../../utils/supabase';
import { 
  userRepository, 
  departmentRepository, 
  serviceRepository,
  appointmentRepository,
  timeslotRepository
} from '../../models';

export class DatabaseValidator {
  static async validateConnection(): Promise<boolean> {
    try {
      console.log('🔍 Validating database connection...');
      
      const connectionResult = await DatabaseUtils.checkConnection();
      if (!connectionResult.success) {
        console.error('❌ Database connection failed:', connectionResult.error);
        return false;
      }
      
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database validation error:', error);
      return false;
    }
  }

  static async validateTables(): Promise<{
    success: boolean;
    results: Record<string, boolean>;
    errors: string[];
  }> {
    const results: Record<string, boolean> = {};
    const errors: string[] = [];

    console.log('🔍 Validating database tables...');

    // Test each table by attempting a simple query
    const tablesToTest = [
      { name: 'users', repository: userRepository },
      { name: 'departments', repository: departmentRepository },
      { name: 'services', repository: serviceRepository },
      { name: 'appointments', repository: appointmentRepository },
      { name: 'timeslots', repository: timeslotRepository }
    ];

    for (const { name, repository } of tablesToTest) {
      try {
        console.log(`  Testing ${name} table...`);
        
        // Test basic count operation
        const count = await repository.count();
        results[name] = true;
        console.log(`  ✅ ${name}: ${count} records`);
        
      } catch (error) {
        results[name] = false;
        const errorMsg = `${name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.log(`  ❌ ${errorMsg}`);
      }
    }

    const success = Object.values(results).every(Boolean);
    
    if (success) {
      console.log('✅ All database tables validated successfully');
    } else {
      console.log('❌ Some database tables failed validation');
    }

    return { success, results, errors };
  }

  static async validateRelationships(): Promise<{
    success: boolean;
    results: Record<string, boolean>;
    errors: string[];
  }> {
    const results: Record<string, boolean> = {};
    const errors: string[] = [];

    console.log('🔍 Validating database relationships...');

    try {
      // Test if we can query with joins
      console.log('  Testing service-department relationship...');
      const servicesWithDepartments = await serviceRepository.findAllWithDepartments();
      results['service_department'] = true;
      console.log(`  ✅ service-department: ${servicesWithDepartments.length} joined records`);

    } catch (error) {
      results['service_department'] = false;
      const errorMsg = `service-department: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.log(`  ❌ ${errorMsg}`);
    }

    try {
      console.log('  Testing appointment relationships...');
      const appointments = await appointmentRepository.findAll({}, 1); // Just get 1 record
      if (appointments.length > 0) {
        const appointmentDetails = await appointmentRepository.findWithDetails(appointments[0].id);
        results['appointment_relationships'] = !!appointmentDetails;
        console.log('  ✅ appointment relationships: Complex joins working');
      } else {
        results['appointment_relationships'] = true; // No data to test but structure is valid
        console.log('  ✅ appointment relationships: No data to test but structure valid');
      }

    } catch (error) {
      results['appointment_relationships'] = false;
      const errorMsg = `appointment relationships: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.log(`  ❌ ${errorMsg}`);
    }

    const success = Object.values(results).every(Boolean);
    
    if (success) {
      console.log('✅ All database relationships validated successfully');
    } else {
      console.log('❌ Some database relationships failed validation');
    }

    return { success, results, errors };
  }

  static async runFullValidation(): Promise<{
    connectionValid: boolean;
    tablesValid: boolean;
    relationshipsValid: boolean;
    summary: string;
    errors: string[];
  }> {
    console.log('🚀 Starting full database validation...\n');

    const connectionValid = await this.validateConnection();
    console.log('');

    let tablesValid = false;
    let relationshipsValid = false;
    let allErrors: string[] = [];

    if (connectionValid) {
      const tableValidation = await this.validateTables();
      tablesValid = tableValidation.success;
      allErrors.push(...tableValidation.errors);
      console.log('');

      if (tablesValid) {
        const relationshipValidation = await this.validateRelationships();
        relationshipsValid = relationshipValidation.success;
        allErrors.push(...relationshipValidation.errors);
      }
    }

    const allValid = connectionValid && tablesValid && relationshipsValid;
    
    let summary = '';
    if (allValid) {
      summary = '🎉 Database validation completed successfully! All systems ready.';
    } else {
      summary = '⚠️  Database validation completed with issues. Check errors above.';
    }

    console.log('\n' + '='.repeat(60));
    console.log(summary);
    console.log('='.repeat(60));

    return {
      connectionValid,
      tablesValid,
      relationshipsValid,
      summary,
      errors: allErrors
    };
  }
}

// Auto-run validation if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  DatabaseValidator.runFullValidation()
    .then((result) => {
      if (result.connectionValid && result.tablesValid && result.relationshipsValid) {
        process.exit(0);
      } else {
        console.error('\n❌ Validation failed. Errors:');
        result.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Validation crashed:', error);
      process.exit(1);
    });
}
