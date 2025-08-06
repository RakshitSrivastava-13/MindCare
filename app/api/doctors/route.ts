import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const specialization = searchParams.get('specialization')

    console.log('Fetching doctors with specialization:', specialization)

    let querySnapshot
    
    if (specialization) {
      // Create a mapping of disease names to their possible database values
      const specializationMapping: Record<string, string[]> = {
        'Anxiety Disorders': ['anxiety', 'anxiety disorders'],
        'Depression': ['depression'],
        'Bipolar Disorder': ['bipolar', 'bipolar disorder'],
        'OCD': ['ocd'],
        'PTSD': ['ptsd'],
        'ADHD': ['adhd'],
        'Eating Disorders': ['eating disorders', 'eating'],
        'Personality Disorders': ['personality disorders', 'personality'],
        'Substance Abuse': ['substance abuse', 'addiction'],
        'Schizophrenia': ['schizophrenia']
      }

      // Get possible database values for this specialization
      const possibleValues = specializationMapping[specialization] || [specialization.toLowerCase()]
      
      // Get all doctors and filter manually for case-insensitive matching
      querySnapshot = await getDocs(collection(db, 'doctors'))
      const allDoctors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]

      // Filter doctors by specialization (case-insensitive)
      const filteredDoctors = allDoctors.filter(doctor => {
        const doctorSpec = doctor.specialization?.toLowerCase() || ''
        return possibleValues.some(value => 
          doctorSpec === value.toLowerCase() || 
          doctorSpec.includes(value.toLowerCase()) ||
          value.toLowerCase().includes(doctorSpec)
        )
      })

      console.log('Query for specialization:', specialization, 'returned', filteredDoctors.length, 'doctors')
      console.log('Returning doctors:', filteredDoctors)

      return NextResponse.json({ success: true, doctors: filteredDoctors })
    } else {
      // Get all doctors
      querySnapshot = await getDocs(collection(db, 'doctors'))
      console.log('Fetching all doctors, found:', querySnapshot.docs.length)
      
      const doctors = querySnapshot.docs.map(doc => {
        const data = doc.data()
        console.log('Doctor data:', { id: doc.id, specialization: data.specialization, name: data.name })
        return {
          id: doc.id,
          ...data
        }
      })

      console.log('Returning doctors:', doctors)
      return NextResponse.json({ success: true, doctors })
    }
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const doctorData = await request.json()
    
    // Add doctor to Firestore
    const docRef = await addDoc(collection(db, 'doctors'), {
      ...doctorData,
      isAvailable: true,
      createdAt: new Date(),
      rating: 0,
      totalReviews: 0
    })
    
    return NextResponse.json({ 
      success: true, 
      doctorId: docRef.id 
    })
  } catch (error) {
    console.error('Error creating doctor profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create doctor profile' },
      { status: 500 }
    )
  }
}
