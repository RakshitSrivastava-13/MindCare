# Firebase Migration Guide

This project has been migrated from NextAuth to Firebase Authentication with Firestore database.

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new Firebase project or select existing one
3. Enable Authentication and Firestore Database
4. In Authentication, enable "Email/Password" sign-in method
5. Copy your Firebase configuration

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Firestore Security Rules

Deploy the security rules from `firestore.rules` to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

## User Schema

The user documents in Firestore follow this schema:

```typescript
interface UserProfile {
  email: string
  name: string
  userType: 'doctor' | 'patient'
  phone?: string
  specialization?: string  // Required for doctors
  licenseNumber?: string   // Required for doctors
}
```

## Changes Made

### 1. Authentication System
- ✅ Removed NextAuth dependencies
- ✅ Added Firebase Authentication
- ✅ Created AuthContext for state management
- ✅ Updated all authentication flows

### 2. Components Updated
- ✅ `/app/auth/page.tsx` - Login/Registration forms
- ✅ `/app/components/Navigation.tsx` - Navigation with Firebase auth
- ✅ `/app/providers.tsx` - Firebase auth provider
- ✅ `/app/patient/dashboard/page.tsx` - Patient dashboard
- ✅ `/app/doctor/dashboard/page.tsx` - Doctor dashboard  
- ✅ `/app/chat/page.tsx` - Chat interface

### 3. New Components
- ✅ `/lib/firebase.ts` - Firebase configuration
- ✅ `/contexts/AuthContext.tsx` - Authentication context
- ✅ `/components/ProtectedRoute.tsx` - Route protection
- ✅ `/hooks/useFirestore.ts` - Firestore operations hook

### 4. Removed Files
- ❌ `/app/api/auth/` - NextAuth API routes
- ❌ `/types/next-auth.d.ts` - NextAuth type definitions

## Usage

### Authentication
```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, userProfile, signIn, signUp, signOut } = useAuth()
  
  // User is authenticated when user && userProfile exist
  if (user && userProfile) {
    return <div>Welcome {userProfile.name}!</div>
  }
  
  return <div>Please log in</div>
}
```

### Protected Routes
```typescript
import ProtectedRoute from '@/components/ProtectedRoute'

function DoctorPage() {
  return (
    <ProtectedRoute allowedUserTypes={['doctor']}>
      <div>Doctor-only content</div>
    </ProtectedRoute>
  )
}
```

### Firestore Operations
```typescript
import { useFirestore } from '@/hooks/useFirestore'

function MyComponent() {
  const { documents, loading, addDocument } = useFirestore('appointments')
  
  const createAppointment = async () => {
    await addDocument({
      patientId: 'patient-id',
      doctorId: 'doctor-id',
      date: new Date(),
      status: 'scheduled'
    })
  }
}
```

## Database Structure

### Users Collection
```
users/{userId}
├── email: string
├── name: string  
├── userType: 'doctor' | 'patient'
├── phone?: string
├── specialization?: string (doctors only)
└── licenseNumber?: string (doctors only)
```

### Appointments Collection
```
appointments/{appointmentId}
├── patientId: string
├── doctorId: string
├── date: timestamp
├── status: 'scheduled' | 'completed' | 'cancelled'
└── notes?: string
```

### Chat Sessions Collection
```
chatSessions/{sessionId}
├── patientId: string
├── doctorId?: string
├── messages: array
├── createdAt: timestamp
└── updatedAt: timestamp
```

## Next Steps

1. Set up Firebase project and configure environment variables
2. Deploy Firestore security rules
3. Test user registration and authentication
4. Implement remaining features (appointments, messaging, etc.)
5. Add error handling and loading states
6. Configure Firebase hosting (optional)

## Security Notes

- All routes are protected by Firebase Auth
- Firestore security rules prevent unauthorized access
- User data is encrypted in transit and at rest
- Passwords are handled securely by Firebase Auth
