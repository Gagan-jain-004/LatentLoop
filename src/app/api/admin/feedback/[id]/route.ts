import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Feedback } from '@/models';
import { verifyAdminFromRequest } from '@/lib/admin-auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminFromRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    await Feedback.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
