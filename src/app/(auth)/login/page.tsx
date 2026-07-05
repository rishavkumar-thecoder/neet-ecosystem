// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { GraduationCap } from 'lucide-react'

const phoneSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number')
})

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits')
})

type PhoneForm = z.infer<typeof phoneSchema>
type OtpForm = z.infer<typeof otpSchema>

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const router = useRouter()

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' }
  })

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  })

  const onPhoneSubmit = async (data: PhoneForm) => {
    try {
      toast.loading('Sending OTP...')
      
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone })
      })

      const result = await response.json()

      toast.dismiss()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP')
      }
      
      setPhoneNumber(data.phone)
      setStep('otp')
      toast.success('OTP sent to your phone!')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to send OTP')
    }
  }

  const onOtpSubmit = async (data: OtpForm) => {
    try {
      toast.loading('Verifying OTP...')
      
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp: data.otp })
      })

      const result = await response.json()
      toast.dismiss()

      if (!response.ok) {
        throw new Error(result.error || 'Invalid OTP')
      }

      toast.success('Login successful!')

      // Redirect based on whether user is new or existing
      if (result.isNewUser) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Invalid OTP')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800 text-zinc-50 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">NEET Ecosystem</CardTitle>
          <CardDescription className="text-zinc-400">
            {step === 'phone' ? 'Enter your phone number to login' : 'Enter the OTP sent to your phone'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-200">Phone Number</Label>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center h-10 px-3 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-400 text-sm">
                    +91
                  </div>
                  <Input 
                    id="phone" 
                    placeholder="10 digit number" 
                    className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-500"
                    {...phoneForm.register('phone')}
                    maxLength={10}
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="text-xs text-destructive">{phoneForm.formState.errors.phone.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-zinc-200">OTP</Label>
                <Input 
                  id="otp" 
                  placeholder="Enter 6-digit OTP" 
                  className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 text-center text-2xl tracking-widest"
                  {...otpForm.register('otp')}
                  maxLength={6}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-xs text-destructive">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                Verify & Login
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                onClick={() => setStep('phone')}
              >
                Change Number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}