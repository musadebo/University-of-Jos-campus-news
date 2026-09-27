# 🔥 Firebase + Supabase Hybrid Authentication Setup

## ✅ **Current Implementation**

### **Architecture**
- 🔥 **Firebase**: Google Sign-in ONLY
- 🐘 **Supabase**: Email/password authentication + Database storage
- 🔄 **Hybrid**: Firebase users are created/synced in Supabase database

### **How It Works**
1. **Google Sign-in**: Firebase handles OAuth → User created in Supabase
2. **Email/Password**: Direct Supabase authentication  
3. **Database**: Everything stored in Supabase (profiles, events, etc.)

## 🛠️ **Required Configuration**

### 1. 📧 **Fix Email Sending (Supabase)**
**URL**: https://app.supabase.com/project/wsyvoooczaqhfbuimqbs/auth/settings

**Settings to update:**
```
Site URL: https://synapse-campus-news.vercel.app

Redirect URLs:
- https://synapse-campus-news.vercel.app/auth/callback
- http://localhost:8080/auth/callback

SMTP Settings:
- Enable custom SMTP or use Supabase's built-in service
- Configure sender email and credentials
```

### 2. 🔥 **Firebase Domain Configuration**
**URL**: https://console.firebase.google.com/project/campus-events-uj/authentication/settings

**Add Authorized Domains:**
```
- synapse-campus-news.vercel.app  
- localhost (already configured)
```

### 3. 🌐 **Production Environment**
Already configured in `.env`:
```env
VITE_APP_DOMAIN="https://synapse-campus-news.vercel.app"
```

## 🧪 **Testing Authentication**

### **Google Sign-in Flow:**
1. User clicks "Continue with Google"
2. Firebase handles Google OAuth
3. User data synced to Supabase database
4. Profile created in Supabase profiles table

### **Email/Password Flow:**
1. User registers with email/password in Supabase
2. Email confirmation sent (after SMTP config)
3. User logs in directly with Supabase

## 👤 **Making chinexzy37@gmail.com an Organizer**

### **Option 1: Google Sign-up**
1. Have them visit: https://synapse-campus-news.vercel.app/register
2. Click "Continue with Google"
3. Sign in with chinexzy37@gmail.com
4. User automatically created in Supabase

### **Option 2: Email/Password** (after SMTP config)
1. Have them register with chinexzy37@gmail.com + password
2. Complete email verification
3. Account created in Supabase

### **Add Organizer Role** (Either Option)
1. Go to: https://app.supabase.com/project/wsyvoooczaqhfbuimqbs/auth/users
2. Find user by email: chinexzy37@gmail.com
3. Copy their User ID (UUID)
4. Go to: Table Editor → `user_roles`
5. Insert: `user_id` = [UUID], `role` = "organizer"

## 📱 **App URLs**

- **Development**: http://localhost:8080/
- **Production**: https://synapse-campus-news.vercel.app/

## 🎯 **Status Summary**

### ✅ **Working**
- Firebase Google authentication
- Supabase database integration
- User profile creation
- Event management system
- Hybrid authentication flow

### ⚠️ **Needs Configuration**
- Supabase SMTP for email sending
- Firebase authorized domains for production
- Email verification workflow

### 🚀 **Ready for Production**
- Authentication system is functional
- Database is properly configured
- chinexzy37@gmail.com can sign up with Google immediately!

---

**Next Step**: Configure SMTP in Supabase settings and Firebase domains, then test both authentication methods!
