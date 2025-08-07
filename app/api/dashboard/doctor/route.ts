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

    // Get today's confirmed appointments only - handle timezone properly
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0]
    
    const todayConfirmedAppointments = allAppointments.filter(apt => {
      // Normalize the appointment date for comparison
      const aptDate = apt.date.includes('T') ? apt.date.split('T')[0] : apt.date
      const isToday = aptDate === today
      const isConfirmed = apt.status === 'confirmed'
      return isToday && isConfirmed
    })
    const todayAppointments = todayConfirmedAppointments.length

    // Get pending messages
    const pendingMessagesQuery = query(
      collection(db, 'messages'),
      where('receiverId', '==', doctorId),
      where('isRead', '==', false)
    )
    const pendingMessagesSnapshot = await getDocs(pendingMessagesQuery)
    const pendingMessages = pendingMessagesSnapshot.size

    // Generate dynamic monthly appointments data for the last 6 months + current + next month
    const monthlyAppointments = []
    const currentDate = new Date()
    
    // Get current month and extend range to include future months
    for (let i = 5; i >= -1; i--) { // Include 5 past months + current + 1 future month
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()
      
      // Get month name
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })
      
      // Filter appointments for this specific month and year
      const monthAppointments = allAppointments.filter(apt => {
        if (!apt.date) return false
        
        // Handle different date formats more robustly
        let aptDate
        if (apt.date instanceof Date) {
          aptDate = apt.date
        } else if (typeof apt.date === 'string') {
          // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss" formats
          aptDate = new Date(apt.date)
        } else if (apt.date?.toDate && typeof apt.date.toDate === 'function') {
          // Handle Firestore Timestamp
          aptDate = apt.date.toDate()
        } else {
          return false
        }
        
        // Check if date parsing was successful
        if (isNaN(aptDate.getTime())) return false
        
        const aptYear = aptDate.getFullYear()
        const aptMonth = aptDate.getMonth()
        
        return aptYear === year && 
               aptMonth === month &&
               (apt.status === 'confirmed' || apt.status === 'completed' || apt.status === 'pending')
      })
      
      monthlyAppointments.push({
        month: monthName,
        count: monthAppointments.length,
        year: year
      })
    }

    console.log('Monthly appointments data for doctor', doctorId, ':', monthlyAppointments)

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
      weeklyAppointments: monthlyAppointments,
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
