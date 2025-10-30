# Production Deployment Setup Instructions

## 🚀 **URGENT: Apply these fixes before production deployment**

### 1. **Email Confirmation Fix**

**Problem**: Email confirmation links redirect to localhost instead of production URL.

**Solution**: 
1. Create `.env.local` file in your project root:
```env
VITE_APP_URL=https://your-vercel-app.vercel.app
```

2. In Vercel dashboard, add this environment variable:
   - Go to your project settings
   - Add Environment Variable: `VITE_APP_URL` = `https://your-vercel-app.vercel.app`
   - Redeploy the application

### 2. **Database Schema Update (Required for persistent data)**

**Problem**: ATS and Skills data is lost when users log out.

**Solution**: Run this SQL in your Supabase database:

```sql
-- Create user_skill_assessments table
CREATE TABLE IF NOT EXISTS user_skill_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id VARCHAR(255) NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    skill_category VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessment_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- Add ATS persistent storage columns
ALTER TABLE student_details 
ADD COLUMN IF NOT EXISTS ats_analysis_data JSONB,
ADD COLUMN IF NOT EXISTS ats_last_updated TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS skills_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skills_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skills_average_score DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS skills_last_updated TIMESTAMP WITH TIME ZONE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_skill_assessments_user_id ON user_skill_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_assessments_skill_id ON user_skill_assessments(skill_id);

-- Enable RLS
ALTER TABLE user_skill_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own skill assessments" ON user_skill_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill assessments" ON user_skill_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill assessments" ON user_skill_assessments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill assessments" ON user_skill_assessments
    FOR DELETE USING (auth.uid() = user_id);
```

### 3. **Generate New TypeScript Types**

After updating the database schema:

1. In Supabase dashboard, go to API > TypeScript
2. Copy the generated types
3. Replace content in `src/integrations/supabase/types.ts`
4. Redeploy the application

### 4. **Verification Steps**

After deployment, test these scenarios:

✅ **Email Confirmation**: 
- Register new user
- Check email confirmation link points to production URL
- Confirm email redirects to EmailConfirmation page

✅ **Persistent Data**:
- Complete some skills assessments
- Analyze resume (ATS)
- Log out and log back in
- Verify data is still there

✅ **ATS Display**:
- Check ATS Score card in dashboard shows analysis details
- Click ATS Score card to view full analysis

### 5. **Fallback Mechanism**

**Good News**: The code includes automatic fallback to localStorage if database operations fail, so the app will continue working even during the transition period.

### 6. **Migration Process**

When users first log in after the database update, their localStorage data will automatically migrate to the database.

---

## 🎯 **Ready for Production!**

After these steps, your application will have:
- ✅ Proper email confirmation flow
- ✅ Persistent ATS and skills data
- ✅ Enhanced user experience
- ✅ Reliable data storage

**Estimated setup time**: 15-30 minutes