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
import { GraduationCap, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const phoneSchema = z.object({ phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number') })
const otpSchema = z.object({ otp: z.string().length(6, 'OTP must be 6 digits') })
const passwordSchema = z.object({
  username: z.string().min(3, 'Enter a valid username'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type PhoneForm = z.infer<typeof phoneSchema>
type OtpForm = z.infer<typeof otpSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function LoginPage() {
  const [step, setStep] = useState<'main' | 'otp'>('main')
  const [phoneNumber, setPhoneNumber] = useState('')
  const router = useRouter()

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema), defaultValues: { phone: '' } })
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema), defaultValues: { otp: '' } })
  const pwdForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema), defaultValues: { username: '', password: '' } })

  const onPhoneSubmit = async (data: PhoneForm) => {
    try {
      toast.loading('Sending OTP...')
      const response = await fetch('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: data.phone }) })
      const result = await response.json()
      toast.dismiss()
      if (!response.ok) throw new Error(result.error || 'Failed to send OTP')
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
      const response = await fetch('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: phoneNumber, otp: data.otp }) })
      const result = await response.json()
      toast.dismiss()
      if (!response.ok) throw new Error(result.error || 'Invalid OTP')
      toast.success('Login successful!')
      if (result.isNewUser) router.push('/onboarding')
      else router.push('/dashboard')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Invalid OTP')
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      toast.loading('Logging in...')
      const supabase = createClient()
      
      // FIX: Directly attempt to sign in with the pseudo-email format
      const { error } = await supabase.auth.signInWithPassword({
        email: `${data.username.toLowerCase()}@neetecosystem.local`,
        password: data.password
      })

      toast.dismiss()
      if (error) throw new Error('Invalid username or password')
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800 text-zinc-50 shadow-2xl backdrop-blur-xl z-10">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">NEET Ecosystem</CardTitle>
          <CardDescription className="text-zinc-400">Your ultimate NEET prep companion</CardDescription>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {step === 'main' && (
                <div className="space-y-6">
                  {/* Phone OTP Section */}
                  <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-zinc-200">Login with Phone</Label>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center h-10 px-3 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-400 text-sm">+91</div>
                        <Input id="phone" placeholder="10 digit number" className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-500" {...phoneForm.register('phone')} maxLength={10} />
                      </div>
                      {phoneForm.formState.errors.phone && (<p className="text-xs text-destructive">{phoneForm.formState.errors.phone.message}</p>)}
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">Send OTP</Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-zinc-900 px-2 text-zinc-500">Or Login with Username</span>
                    </div>
                  </div>

                  {/* Password Section */}
                  <form onSubmit={pwdForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-zinc-200">Username</Label>
                      <Input id="username" placeholder="Enter your username" className="bg-zinc-950 border-zinc-800 text-zinc-50" {...pwdForm.register('username')} />
                      {pwdForm.formState.errors.username && (<p className="text-xs text-destructive">{pwdForm.formState.errors.username.message}</p>)}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-zinc-200">Password</Label>
                      <Input id="password" type="password" placeholder="Enter your password" className="bg-zinc-950 border-zinc-800 text-zinc-50" {...pwdForm.register('password')} />
                      {pwdForm.formState.errors.password && (<p className="text-xs text-destructive">{pwdForm.formState.errors.password.message}</p>)}
                    </div>
                    <Button type="submit" variant="outline" className="w-full bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-white">Login with Password</Button>
                  </form>
                </div>
              )}

              {step === 'otp' && (
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-zinc-200">Enter OTP</Label>
                    <Input id="otp" placeholder="6-digit OTP" className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 text-center text-2xl tracking-widest" {...otpForm.register('otp')} maxLength={6} />
                    {otpForm.formState.errors.otp && (<p className="text-xs text-destructive">{otpForm.formState.errors.otp.message}</p>)}
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">Verify & Login</Button>
                  <Button type="button" variant="ghost" className="w-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800" onClick={() => setStep('main')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Change Number
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}