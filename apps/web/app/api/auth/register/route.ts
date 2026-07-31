import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { hashPassword, validateEmail, validatePassword, generateVerificationToken } from '@/lib/auth';
import { RegisterRequest, UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body: RegisterRequest = await request.json();
    
    // Validate input
    if (!body.email || !body.password || !body.full_name || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email
    if (!validateEmail(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(body.password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'Password is too weak. ' + passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = ['student', 'worker', 'employer', 'factory_admin'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(body.password);

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: body.email,
        password_hash: passwordHash,
        full_name: body.full_name,
        role: body.role,
        is_verified: body.role === 'worker' ? false : true, // Workers need admin verification
      })
      .select()
      .single();

    if (userError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create role-specific profile
    if (body.role === 'student') {
      await supabase.from('student_profiles').insert({
        user_id: newUser.id,
      });
    } else if (body.role === 'worker') {
      await supabase.from('worker_profiles').insert({
        user_id: newUser.id,
        phone: '', // Will be filled in later
      });
    } else if (body.role === 'employer') {
      // Employers will create a company later
    } else if (body.role === 'factory_admin') {
      // Factory admins will create a factory later
    }

    // Generate and store email verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await supabase.from('email_verification_tokens').insert({
      user_id: newUser.id,
      token: verificationToken,
      expires_at: expiresAt.toISOString(),
    });

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: newUser.id,
      action: 'user_registered',
      resource_type: 'user',
      resource_id: newUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          is_verified: newUser.is_verified,
          is_email_verified: false,
        },
        message: 'Registration successful. Please verify your email.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
