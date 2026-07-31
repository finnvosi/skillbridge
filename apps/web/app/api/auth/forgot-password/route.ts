import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { generateResetToken } from '@/lib/auth';
import { ResetPasswordRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body: ResetPasswordRequest = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email)
      .single();

    // For security, always return success even if user doesn't exist
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If the email exists, a reset link has been sent' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store reset token
    await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt.toISOString(),
    });

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'password_reset_requested',
      resource_type: 'user',
      resource_id: user.id,
    });

    // TODO: Send email with reset link
    // Format: /auth/reset-password?email={email}&token={resetToken}
    console.log(
      'Password reset token generated (in production, send via email):',
      resetToken
    );

    return NextResponse.json(
      { success: true, message: 'If the email exists, a reset link has been sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
