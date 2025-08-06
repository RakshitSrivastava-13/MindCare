import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Generate all 24-hour time slots
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    const timeString = `${hour.toString().padStart(2, '0')}:00`
    const displayTime = hour < 12 
      ? `${hour === 0 ? 12 : hour}:00 AM`
      : `${hour === 12 ? 12 : hour - 12}:00 PM`
    
    slots.push({
      value: timeString,
      label: displayTime,
      hour: hour
    })
  }
  return slots
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const doctorId = searchParams.get('doctorId')
    const date = searchParams.get('date')

    if (!doctorId || !date) {
      return NextResponse.json(
        { success: false, error: 'Doctor ID and date are required' },
        { status: 400 }
      )
    }

    // Get all appointments for the doctor on the specified date
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      where('date', '==', date)
    )
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery)
    const bookedSlots = appointmentsSnapshot.docs.map(doc => {
      const data = doc.data()
      return data.time
    })

    // Generate all available time slots
    const allSlots = generateTimeSlots()
    
    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => {
      // Convert 24-hour format to check against booked slots
      const hour = slot.hour
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      const bookedFormat = `${displayHour}:00 ${ampm}`
      
      return !bookedSlots.includes(bookedFormat) && !bookedSlots.includes(slot.label)
    })

    return NextResponse.json({ 
      success: true, 
      availableSlots,
      bookedSlots,
      totalSlots: allSlots.length,
      availableCount: availableSlots.length
    })
  } catch (error) {
    console.error('Error fetching available slots:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}
