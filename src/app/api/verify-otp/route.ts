// src/app/api/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()
    const fullPhone = `91${phone.replace('+91', '')}`

    const supabaseAdmin = createAdminClient()
    
    // 1. Find and verify OTP
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('phone', fullPhone)
      .eq('otp', otp)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !otpRecord) {
      console.error('❌ OTP not found or invalid:', fetchError)
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 })
    }

    // 2. Mark OTP as verified
    await supabaseAdmin
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', otpRecord.id)

    // 3. Create a unique pseudo-email and password for this phone number
    const pseudoEmail = `user_${fullPhone}@neetecosystem.local`
    const pseudoPassword = `secure_auth_${fullPhone}`

    let isNewUser = false

    // 4. Try to create the user using the Admin client
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: pseudoEmail,
      password: pseudoPassword,
      email_confirm: true, // Auto-confirm the pseudo-email
      user_metadata: {
        phone: fullPhone,
        auth_method: 'otp'
      }
    })

    if (createError) {
      // If the error is "User already registered", we safely ignore it and proceed to sign in.
      // If it's a different error, we log it but still try to sign in (signIn will catch actual auth failures).
      console.log('ℹ️ createUser note (likely user exists):', createError.message)
    } else {
      isNewUser = true
    }

    // 5. Sign in the user to establish the browser session (sets the cookies)
    // We use the standard client here so Next.js handles the cookie setting correctly
    const supabaseClient = await createClient()
    
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
      email: pseudoEmail,
      password: pseudoPassword
    })

    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      return NextResponse.json({ 
        error: 'Failed to establish session' 
      }, { status: 500 })
    }

    const userId = sessionData.user.id

    // 6. Check if the profile exists in the public.profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    // If they are new to Auth OR they haven't finished onboarding, send to onboarding
    const needsOnboarding = isNewUser || !profile

    console.log('✅ User authenticated successfully!')

    return NextResponse.json({
      success: true,
      user: sessionData.user,
      isNewUser: needsOnboarding
    })

  } catch (error: any) {
    console.error('💥 Verify OTP Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}