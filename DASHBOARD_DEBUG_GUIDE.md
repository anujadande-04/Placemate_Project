# 🔍 Dashboard Debug Guide

## Current Issue: Cards Not Showing Correct Information

### 🧪 **Debug Steps to Follow:**

1. **Open Browser DevTools** (F12) and check Console tab
2. **Login to your account** and go to Student Dashboard
3. **Look for these debug messages:**

#### Expected Console Output:
```
🔍 Loading skill assessment data for user: [your-user-id]
📊 Loaded skill assessments: X assessments found
📋 Assessment details: [array of your completed assessments]
🧪 Test - User ID: [your-user-id]
🧪 Test - Student Details: {hasStudentDetails: true, cgpa: X, technologies: Y, ...}
🧪 Test - Assessments loaded: X
🔄 Initializing metrics with data: {hasStudentDetails: true, ...}
✅ Metrics initialized: {placementScore: X, skillsCompleted: Y, ...}
```

### 🎯 **What Each Card Should Show:**

#### If You Have Completed 2 Skill Assessments:
- **Skills Completed Card**: Should show "2/X assessments" with percentage
- **Placement Score Card**: Should show calculated score based on your profile
- **ATS Score Card**: Depends on if you've uploaded resume
- **Certifications Card**: Depends on uploaded certificates  
- **CGPA Card**: Should show your CGPA if entered

### 🐛 **Common Issues & Solutions:**

#### Issue 1: All Cards Show Zero/Default Values
**Cause**: Metrics not initializing properly
**Solution**: Check console for error messages, ensure user is logged in

#### Issue 2: Skills Card Shows "0 assessments" Despite Completing Assessments
**Cause**: Skill assessment data not loading from localStorage
**Check**: Console should show "📊 Loaded skill assessments: 2 assessments found"
**Solution**: If not found, data might be stored under different user ID

#### Issue 3: Cards Show "N/A" or Empty Values
**Cause**: Student profile data incomplete
**Solution**: 
1. Go to Profile tab
2. Click "Edit Profile" 
3. Fill in CGPA, technologies, etc.
4. Save changes

#### Issue 4: ATS Card Shows "Not analyzed"
**Expected**: This is correct if you haven't uploaded resume yet
**Solution**: Upload resume in Profile tab for ATS analysis

### 🔧 **Manual Data Check:**

Open Browser DevTools Console and run:
```javascript
// Check localStorage for your skill assessment data
const userId = 'your-user-id-here'; // Replace with actual ID from console
const key = `skill_assessments_${userId}`;
const data = localStorage.getItem(key);
console.log('Stored assessments:', JSON.parse(data || '[]'));
```

### 📊 **Expected vs Actual Results:**

| Card | Expected (2 assessments completed) | What you see |
|------|-----------------------------------|--------------|
| Skills | "2/X assessments, Y% complete" | ? |
| Placement | "X% (colored based on score)" | ? |
| ATS | "Score% or 'Upload resume'" | ? |
| Certificates | "Count or 'None'" | ? |
| CGPA | "Your CGPA or 'Not set'" | ? |

### 🎯 **Next Steps Based on Console Output:**

1. **If assessments are found but cards show 0**: Metrics calculation issue
2. **If assessments show 0 in console**: Data persistence issue  
3. **If no debug messages appear**: Component loading issue
4. **If errors in console**: Technical issue to fix

### 💡 **Quick Test:**
1. Complete one more skill assessment
2. Watch console for real-time updates
3. Check if cards update immediately

Please share what you see in the console so I can help diagnose the specific issue! 🚀