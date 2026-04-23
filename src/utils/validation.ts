export function sanitizeInput(input: string, maxLength: number = 500): string {
  return input
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, maxLength);
}

export function validatePostContent(content: string, allowEmpty: boolean = false): { valid: boolean; error?: string } {
  if ((content === undefined || content === null || typeof content !== 'string') && !allowEmpty) {
    return { valid: false, error: 'Content is required' };
  }

  if (typeof content !== 'string') {
    return { valid: false, error: 'Invalid content format' };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    if (allowEmpty) {
      return { valid: true };
    }

    return { valid: false, error: 'Content cannot be empty' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Content must be 500 characters or less' };
  }

  return { valid: true };
}

export function validateFeedback(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > 1000) {
    return { valid: false, error: 'Message must be 1000 characters or less' };
  }

  return { valid: true };
}

export function validateCommentContent(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Comment is required' };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Comment cannot be empty' };
  }

  if (trimmed.length > 300) {
    return { valid: false, error: 'Comment must be 300 characters or less' };
  }

  return { valid: true };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

export function getPostScore(upvotes: number, downvotes: number): number {
  return upvotes - downvotes;
}

export function getRelativeTime(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';

  return Math.floor(seconds) + 's ago';
}

export function calculateExpiryDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + parseInt(process.env.NEXT_PUBLIC_POST_TTL_DAYS || '30'));
  return date;
}
