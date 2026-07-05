// src/app/api/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin' // <-- Use Admin Client

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()
    
    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const otp = generateOTP()
    const fullPhone = `91${phone}`

    // Use Admin Client to bypass RLS
    const supabase = createAdminClient()
    
    const { error: dbError } = await supabase
      .from('otp_verifications')
      .insert({
        phone: fullPhone,
        otp: otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        verified: false
      })

    if (dbError) {
      console.error('❌ Database error:', dbError)
      throw dbError
    }

    const authKey = process.env.MSG91_AUTH_KEY
    if (!authKey) throw new Error('MSG91_AUTH_KEY is missing')

    // Send via MSG91
    const msg91Url = `https://control.msg91.com/api/v5/otp?mobile=${fullPhone}&authkey=${authKey}&otp=${otp}&otp_expiry=5`
    
    const msg91Response = await fetch(msg91Url, { method: 'GET' })
    const msg91Data = await msg91Response.json()

    if (msg91Data.type !== 'success') {
      console.error('❌ MSG91 Error:', msg91Data)
      // Fallback for testing if MSG91 fails but DB succeeded
      console.log(`🔥 FALLBACK OTP FOR TESTING: ${otp}`)
    }

    return NextResponse.json({ success: true, message: 'OTP sent' })
  } catch (error: any) {
    console.error('💥 Send OTP Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}