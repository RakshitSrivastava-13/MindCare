import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PatientDashboardStats } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    // Get mood entries for average calculation
    const moodQuery = query(
      collection(db, 'moodEntries'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    )
    const moodSnapshot = await getDocs(moodQuery)
    const moodEntries = moodSnapshot.docs.map(doc => doc.data())
    
    const averageMood = moodEntries.length > 0 
      ? moodEntries.reduce((sum: number, entry: any) => sum + entry.value, 0) / moodEntries.length
      : 0

    // Get chat sessions count
    const chatQuery = query(
      collection(db, 'chatSessions'),
      where('patientId', '==', patientId)
    )
    const chatSnapshot = await getDocs(chatQuery)
    const chatSessions = chatSnapshot.size

    // Get completed appointments
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      where('status', '==', 'completed')
    )
    const appointmentsSnapshot = await getDocs(appointmentsQuery)
    const completedAppointments = appointmentsSnapshot.size

    // Calculate progress percentage (simplified)
    const progressPercentage = Math.min(85, (averageMood / 10) * 100)

    // Generate mood data for chart (last 7 days)
    const moodData = moodEntries.slice(0, 7).map((entry: any) => ({
      date: entry.date,
      value: entry.value
    })).reverse()

    // Generate progress data
    const progressData = [
      { name: 'Anxiety', value: 65 },
      { name: 'Depression', value: 45 },
      { name: 'Sleep', value: 80 },
      { name: 'Stress', value: 55 }
    ]

    const stats: PatientDashboardStats = {
      averageMood: Math.round(averageMood * 10) / 10,
      chatSessions,
      completedAppointments,
      progressPercentage,
      moodData,
      progressData
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Error fetching patient dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
