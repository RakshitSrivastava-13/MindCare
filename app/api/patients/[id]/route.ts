import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'patients', params.id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      patient: { id: docSnap.id, ...docSnap.data() }
    })
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json()
    const docRef = doc(db, 'patients', params.id)
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update patient' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'patients', params.id)
    await deleteDoc(docRef)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete patient' },
      { status: 500 }
    )
  }
}
