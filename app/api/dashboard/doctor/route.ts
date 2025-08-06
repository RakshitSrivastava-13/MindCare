import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { DashboardStats } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const doctorId = searchParams.get('doctorId')

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    // Get all appointments for this doctor first
    const allAppointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId)
    )
    const allAppointmentsSnapshot = await getDocs(allAppointmentsQuery)
    const allAppointments = allAppointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]

    // Get total patients for this doctor - only count patients with confirmed appointments
    const confirmedAppointments = allAppointments.filter(apt => apt.status === 'confirmed')
    const uniquePatientIds = new Set(confirmedAppointments.map(apt => apt.patientId))
    const totalPatients = uniquePatientIds.size

    // Get active patients (those with confirmed appointments in the last 30 days)
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - 30) // Last 30 days
    const recentDateString = recentDate.toISOString().split('T')[0]
    
    const recentConfirmedAppointments = allAppointments.filter(apt => 
      apt.status === 'confirmed' && apt.date >= recentDateString
    )
    const uniqueActivePatients = new Set(
      recentConfirmedAppointments.map(apt => apt.patientId)
    )
    const activePatients = uniqueActivePatients.size

    // Get today's confirmed appointments only
    const today = new Date().toISOString().split('T')[0]
    const todayConfirmedAppointments = allAppointments.filter(apt => 
      apt.date === today && apt.status === 'confirmed'
    )
    const todayAppointments = todayConfirmedAppointments.length

    // Get pending messages
    const pendingMessagesQuery = query(
      collection(db, 'messages'),
      where('receiverId', '==', doctorId),
      where('isRead', '==', false)
    )
    const pendingMessagesSnapshot = await getDocs(pendingMessagesQuery)
    const pendingMessages = pendingMessagesSnapshot.size

    // Generate sample weekly appointments data (would be calculated from actual data)
    const weeklyAppointments = [
      { month: 'Sep', count: 85 },
      { month: 'Oct', count: 92 },
      { month: 'Nov', count: 78 },
      { month: 'Dec', count: 95 },
      { month: 'Jan', count: 88 }
    ]

    // Generate sample patient progress data
    const patientProgress = [
      { week: 'W1', improved: 15, stable: 12, declined: 5 },
      { week: 'W2', improved: 18, stable: 10, declined: 4 },
      { week: 'W3', improved: 20, stable: 8, declined: 4 },
      { week: 'W4', improved: 22, stable: 7, declined: 3 }
    ]

    const stats: DashboardStats = {
      totalPatients,
      activePatients,
      todayAppointments,
      pendingMessages,
      weeklyAppointments,
      patientProgress
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
