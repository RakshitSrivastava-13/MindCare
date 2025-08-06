import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'doctors'))
    const doctors = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    console.log('All doctors in database:', doctors)
    
    return NextResponse.json({ 
      success: true, 
      doctors,
      count: doctors.length 
    })
  } catch (error) {
    console.error('Error fetching all doctors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}
