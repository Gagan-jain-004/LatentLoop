import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Feedback } from '@/models';
import { verifyAdminFromRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminFromRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Feedback.countDocuments();

    return NextResponse.json({
      feedbacks,
      total,
      page,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminFromRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { feedbackId } = await request.json();

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    await Feedback.findByIdAndDelete(feedbackId);

    return NextResponse.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
