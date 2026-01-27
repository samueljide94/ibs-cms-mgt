import { createClient } from '@supabase/supabase-js';

// Use environment variables directly
const SUPABASE_URL = 'https://tzkvkxzppxkksqwxuxlk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_25zxOQtYFJSq-VlAvzhZHQ_hPk9rZpr';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

interface TestUser {
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  firstName: string;
  lastName: string;
}

const testUsers: TestUser[] = [
  {
    email: 'admin@simplexsystem.com',
    password: 'Admin123!',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User'
  },
  {
    email: 'manager@simplexsystem.com',
    password: 'Manager123!',
    role: 'manager',
    firstName: 'Manager',
    lastName: 'User'
  },
  {
    email: 'user@simplexsystem.com',
    password: 'User123!',
    role: 'user',
    firstName: 'Regular',
    lastName: 'User'
  }
];

async function createTestUsers() {
  console.log('Creating test user accounts...');

  for (const user of testUsers) {
    try {
      console.log(`Creating account for ${user.email}...`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role
          }
        }
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError.message);
        continue;
      }

      if (!authData.user) {
        console.error(`No user data returned for ${user.email}`);
        continue;
      }

      // Create profile in web_users table
      const { error: profileError } = await supabase
        .from('web_users')
        .insert({
          id: authData.user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError.message);
        continue;
      }

      console.log(`✓ Successfully created account for ${user.email}`);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Unexpected error for ${user.email}:`, error);
    }
  }

  console.log('\nTest user creation completed!');
  console.log('\nLogin credentials:');
  testUsers.forEach(user => {
    console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
  });
}

// Run the script
createTestUsers().catch(console.error);
