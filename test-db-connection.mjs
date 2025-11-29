/**
 * Test Supabase Connection
 * Run with: node test-db-connection.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waiapkypnkhhnxmuexls.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhaWFwa3lwbmtoaG54bXVleGxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM2NzczNCwiZXhwIjoyMDc5OTQzNzM0fQ.D1MWkYb8d6Vu_ly0YC3wXsG6Mfe3h6Uvv00c85XSHOQ';

async function testConnection() {
  console.log('🧪 Testing Supabase Connection...\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Supabase client created');
    console.log(`📍 URL: ${supabaseUrl}\n`);
    
    // Test 1: Check if tables exist
    console.log('📊 Checking for database tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('interview_prep_sessions')
      .select('*')
      .limit(0);
    
    if (tablesError) {
      if (tablesError.message.includes('relation') && tablesError.message.includes('does not exist')) {
        console.log('⚠️  Tables not found - you need to run the schema.sql');
        console.log('\n📝 Next Steps:');
        console.log('1. Go to https://waiapkypnkhhnxmuexls.supabase.co');
        console.log('2. Click "SQL Editor" in the left sidebar');
        console.log('3. Click "New Query"');
        console.log('4. Copy and paste contents of database/schema.sql');
        console.log('5. Click "Run" button');
        console.log('6. Run this test again\n');
        return;
      }
      throw tablesError;
    }
    
    console.log('✅ Table "interview_prep_sessions" exists!');
    
    // Test 2: Try to insert and read a test record
    console.log('\n🧪 Testing database operations...');
    const testSession = {
      company_name: 'Test Company',
      role_name: 'Test Role',
      technologies: ['JavaScript', 'TypeScript'],
      status: 'processing',
    };
    
    const { data: inserted, error: insertError } = await supabase
      .from('interview_prep_sessions')
      .insert(testSession)
      .select()
      .single();
    
    if (insertError) {
      throw insertError;
    }
    
    console.log('✅ Insert successful! Session ID:', inserted.id);
    
    // Read it back
    const { data: fetched, error: fetchError } = await supabase
      .from('interview_prep_sessions')
      .select('*')
      .eq('id', inserted.id)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log('✅ Read successful!');
    console.log('   Company:', fetched.company_name);
    console.log('   Role:', fetched.role_name);
    console.log('   Technologies:', fetched.technologies.join(', '));
    
    // Clean up test data
    await supabase
      .from('interview_prep_sessions')
      .delete()
      .eq('id', inserted.id);
    
    console.log('✅ Delete successful!');
    
    console.log('\n🎉 All tests passed! Database is ready to use.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
