import { NextRequest, NextResponse } from 'next/server'

// Pre-defined diseases and their associated doctors
const DISEASES_DATA = [
  {
    id: 'anxiety',
    name: 'Anxiety Disorders',
    description: 'Generalized Anxiety, Panic Disorders, Social Anxiety',
    category: 'Mental Health'
  },
  {
    id: 'depression',
    name: 'Depression',
    description: 'Major Depressive Disorder, Persistent Depressive Disorder',
    category: 'Mental Health'
  },
  {
    id: 'bipolar',
    name: 'Bipolar Disorder',
    description: 'Bipolar I, Bipolar II, Cyclothymic Disorder',
    category: 'Mood Disorders'
  },
  {
    id: 'ptsd',
    name: 'PTSD & Trauma',
    description: 'Post-Traumatic Stress Disorder, Acute Stress Disorder',
    category: 'Trauma Related'
  },
  {
    id: 'adhd',
    name: 'ADHD',
    description: 'Attention-Deficit/Hyperactivity Disorder',
    category: 'Neurodevelopmental'
  },
  {
    id: 'eating',
    name: 'Eating Disorders',
    description: 'Anorexia, Bulimia, Binge Eating Disorder',
    category: 'Eating Disorders'
  },
  {
    id: 'ocd',
    name: 'OCD',
    description: 'Obsessive-Compulsive Disorder',
    category: 'Anxiety Related'
  },
  {
    id: 'addiction',
    name: 'Substance Abuse',
    description: 'Drug and Alcohol Addiction, Behavioral Addictions',
    category: 'Addiction'
  }
]

const DOCTORS_DATA = [
  {
    id: 'dr001',
    name: 'Dr. Sarah Johnson',
    specialization: 'Anxiety & Depression Specialist',
    experience: 8,
    qualifications: ['MD Psychiatry', 'CBT Certified'],
    diseases: ['anxiety', 'depression', 'ptsd'],
    avatar: 'https://ui-avatars.com/api/?name=Dr+Sarah+Johnson&background=1a2f1a&color=fff',
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
    }
  },
  {
    id: 'dr002',
    name: 'Dr. Michael Chen',
    specialization: 'Mood Disorders & Bipolar Specialist',
    experience: 12,
    qualifications: ['MD Psychiatry', 'Mood Disorder Specialist'],
    diseases: ['bipolar', 'depression', 'anxiety'],
    avatar: 'https://ui-avatars.com/api/?name=Dr+Michael+Chen&background=1a2f1a&color=fff',
    availability: {
      days: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00']
    }
  },
  {
    id: 'dr003',
    name: 'Dr. Emily Rodriguez',
    specialization: 'Trauma & PTSD Specialist',
    experience: 10,
    qualifications: ['MD Psychiatry', 'EMDR Certified', 'Trauma Specialist'],
    diseases: ['ptsd', 'anxiety', 'depression'],
    avatar: 'https://ui-avatars.com/api/?name=Dr+Emily+Rodriguez&background=1a2f1a&color=fff',
    availability: {
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00']
    }
  },
  {
    id: 'dr004',
    name: 'Dr. David Kim',
    specialization: 'ADHD & Neurodevelopmental Disorders',
    experience: 7,
    qualifications: ['MD Psychiatry', 'ADHD Specialist', 'Child Psychology'],
    diseases: ['adhd', 'anxiety'],
    avatar: 'https://ui-avatars.com/api/?name=Dr+David+Kim&background=1a2f1a&color=fff',
    availability: {
      days: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00']
    }
  },
  {
    id: 'dr005',
    name: 'Dr. Lisa Thompson',
    specialization: 'Eating Disorders & Body Image',
    experience: 9,
    qualifications: ['MD Psychiatry', 'Eating Disorder Specialist', 'DBT Trained'],
    diseases: ['eating', 'anxiety', 'depression'],
    avatar: 'https://ui-avatars.com/api/?name=Dr+Lisa+Thompson&background=1a2f1a&color=fff',
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
      timeSlots: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
    }
  },
  {
    id: 'dr006',
    name: 'Dr. Robert Wilson',
    specialization: 'OCD & Anxiety Disorders',
    experience: 11,
    qualifications: ['MD Psychiatry', 'OCD Specialist', 'ERP Therapy'],
    diseases: ['ocd', 'anxiety'],
    avatar: 'https://ui-avatars.com/api/?name=Dr+Robert+Wilson&background=1a2f1a&color=fff',
    availability: {
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
    }
  },
  {
    id: 'dr007',
    name: 'Dr. Amanda Foster',
    specialization: 'Addiction & Substance Abuse',
    experience: 15,
    qualifications: ['MD Psychiatry', 'Addiction Medicine', 'MAT Certified'],
    diseases: ['addiction', 'depression', 'anxiety'],
    avatar: 'https://ui-avatars.com/api/?name=Dr+Amanda+Foster&background=1a2f1a&color=fff',
    availability: {
      days: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00']
    }
  }
]

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      diseases: DISEASES_DATA,
      doctors: DOCTORS_DATA
    })
  } catch (error) {
    console.error('Error fetching diseases and doctors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
