// JavaScript function to add ATS columns to Supabase
// Run this in your browser console when on your app page

async function addATSColumns() {
  try {
    console.log('🔧 Adding ATS columns to student_details table...');
    
    // This uses your existing supabase client from the page
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add ats_score column if it doesn't exist
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'student_details' 
                AND column_name = 'ats_score'
            ) THEN
                ALTER TABLE student_details ADD COLUMN ats_score NUMERIC;
                RAISE NOTICE 'Added ats_score column';
            END IF;

            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'student_details' 
                AND column_name = 'ats_analysis'
            ) THEN
                ALTER TABLE student_details ADD COLUMN ats_analysis JSONB;
                RAISE NOTICE 'Added ats_analysis column';
            END IF;
        END $$;
      `
    });

    if (error) {
      console.error('❌ Error adding columns:', error);
      alert('Error adding columns. You need to add them manually in Supabase dashboard.');
    } else {
      console.log('✅ Columns added successfully!');
      alert('ATS columns added successfully! You can now try the ATS analysis again.');
    }
  } catch (error) {
    console.error('❌ Function error:', error);
    alert('Unable to add columns automatically. Please add them manually.');
  }
}

// Instructions for manual addition via Supabase Dashboard
console.log(`
📋 MANUAL INSTRUCTIONS:

If the automatic function doesn't work, add the columns manually:

1. Go to https://app.supabase.com
2. Select your project
3. Go to Table Editor
4. Find the 'student_details' table
5. Click "Add Column" and add:
   
   Column 1:
   - Name: ats_score
   - Type: numeric
   - Nullable: Yes
   
   Column 2:
   - Name: ats_analysis
   - Type: jsonb
   - Nullable: Yes

6. Save the changes

Then refresh your app and try the ATS analysis again.
`);

// Call the function
// addATSColumns();