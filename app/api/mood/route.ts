import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { MoodEntry } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    let q = query(
      collection(db, 'moodEntries'), 
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    )

    const querySnapshot = await getDocs(q)
    let moodEntries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (MoodEntry & { id: string })[]

    // Filter by date range if provided
    if (startDate && endDate) {
      moodEntries = moodEntries.filter(entry => 
        entry.date >= startDate && entry.date <= endDate
      )
    }

    return NextResponse.json({ success: true, moodEntries })
  } catch (error) {
    console.error('Error fetching mood entries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mood entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const moodData = await request.json()
    
    const moodEntry: Omit<MoodEntry, 'id'> = {
      ...moodData,
      createdAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'moodEntries'), moodEntry)
    
    return NextResponse.json({ 
      success: true, 
      moodEntryId: docRef.id,
      moodEntry: { id: docRef.id, ...moodEntry }
    })
  } catch (error) {
    console.error('Error creating mood entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create mood entry' },
      { status: 500 }
    )
  }
}
