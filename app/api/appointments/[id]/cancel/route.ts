import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reason, patientId } = await request.json()
    const appointmentId = params.id

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // Get the appointment first to verify it exists and belongs to the patient
    const appointmentRef = doc(db, 'appointments', appointmentId)
    const appointmentDoc = await getDoc(appointmentRef)

    if (!appointmentDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    const appointmentData = appointmentDoc.data()

    // Verify the appointment belongs to the requesting patient
    if (appointmentData.patientId !== patientId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to cancel this appointment' },
        { status: 403 }
      )
    }

    // Check if appointment can be cancelled (not already completed or cancelled)
    if (appointmentData.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel a completed appointment' },
        { status: 400 }
      )
    }

    if (appointmentData.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Appointment is already cancelled' },
        { status: 400 }
      )
    }

    // Check if cancellation is allowed (e.g., at least 24 hours before appointment)
    const appointmentDateTime = new Date(`${appointmentData.date} ${appointmentData.time}`)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilAppointment < 24) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Appointments can only be cancelled at least 24 hours in advance',
          warning: 'For urgent cancellations, please contact your doctor directly'
        },
        { status: 400 }
      )
    }

    // Update the appointment status to cancelled
    await updateDoc(appointmentRef, {
      status: 'cancelled',
      cancellationReason: reason || 'No reason provided',
      cancelledAt: new Date().toISOString(),
      cancelledBy: 'patient',
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cancel appointment' },
      { status: 500 }
    )
  }
}
