import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { VerifyEmailRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body: VerifyEmailRequest = await request.json();

    if (!body.email || !body.token) {
      return NextResponse.json(
        { success: false, error: 'Email and token are required' },
        { status: 400 }
      );
    }

    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check verification token
    const { data: tokenData } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('token', body.token)
      .single();

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Update user
    await supabase
      .from('users')
      .update({
        is_email_verified: true,
        email_verified_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Delete token
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('user_id', user.id);

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'email_verified',
      resource_type: 'user',
      resource_id: user.id,
    });

    return NextResponse.json(
      { success: true, message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
