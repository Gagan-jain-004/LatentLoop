import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Feedback } from '@/models';
import { sanitizeInput, validateFeedback } from '@/utils/validation';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { message } = await request.json();

    const validation = validateFeedback(message);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const sanitized = sanitizeInput(message);

    const feedback = await Feedback.create({ message: sanitized });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
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
