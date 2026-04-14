type CaptchaResponse = {
  success: boolean;
};

export async function verifyCaptchaToken(token?: string): Promise<boolean> {
  const secret = process.env.CAPTCHA_SECRET;

  // In local/dev environments you can omit CAPTCHA_SECRET to disable verification.
  if (!secret) {
    return true;
  }

  if (!token) {
    return false;
  }

  const body = new URLSearchParams();
  body.append('secret', secret);
  body.append('response', token);

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as CaptchaResponse;
    return Boolean(data.success);
  } catch {
    return false;
  }
}
