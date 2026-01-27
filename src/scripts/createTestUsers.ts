import { supabase } from '../integrations/supabase/client';

async function createTestUsers() {
  console.log('Creating test users...');

  const testUsers = [
    {
      email: 'admin@simplexsystem.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      birthDay: 1,
      birthMonth: 'January',
      position: 'Engineer'
    },
    {
      email: 'manager@simplexsystem.com',
      password: 'Manager123!',
      firstName: 'Project',
      lastName: 'Manager',
      birthDay: 20,
      birthMonth: 'May',
      position: 'Senior'
    },
    {
      email: 'user@simplexsystem.com',
      password: 'User123!',
      firstName: 'Regular',
      lastName: 'User',
      birthDay: 15,
      birthMonth: 'March',
      position: 'Junior'
    }
  ];

  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            first_name: user.firstName,
            last_name: user.lastName,
            birth_day: user.birthDay,
            birth_month: user.birthMonth,
            position: user.position
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`User ${user.email} already exists, skipping...`);
          continue;
        }
        console.error(`Error creating auth user ${user.email}:`, authError);
        continue;
      }

      if (authData.user) {
        console.log(`Successfully created auth user: ${user.email}`);

        // Insert into web_users table
        const { error: profileError } = await supabase
          .from('web_users')
          .insert({
            user_id: authData.user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            birth_day: user.birthDay,
            birth_month: user.birthMonth,
            position: user.position
          });

        if (profileError) {
          console.error(`Error creating profile for ${user.email}:`, profileError);
        } else {
          console.log(`Successfully created profile for: ${user.email}`);
        }
      }
    } catch (error) {
      console.error(`Unexpected error creating user ${user.email}:`, error);
    }
  }

  console.log('Test users creation completed!');
}

// Run the script
createTestUsers().catch(console.error);
