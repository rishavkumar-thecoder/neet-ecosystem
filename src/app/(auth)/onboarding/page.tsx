// src/app/(auth)/onboarding/page.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ArrowRight, ArrowLeft, Sparkles, UserCircle, Lock } from 'lucide-react'
import { saveProfile } from './actions'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [dailyHours, setDailyHours] = useState(6)
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: {
      full_name: '',
      target_year: '',
      class_status: '',
      coaching_status: '',
      weak_subject: '',
      daily_hours: 6,
      study_time_pref: '',
      username: '',
      password: '',
      confirmPassword: ''
    }
  })

  const password = watch('password')

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match!')
      setStep(4)
      return
    }

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'confirmPassword') formData.append(key, value as string)
    })

    toast.loading('Setting up your profile...')
    try {
      await saveProfile(formData)
    } catch (error: any) {
      // FIX: Let Next.js handle the internal redirect error
      if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
        throw error
      }
      toast.dismiss()
      toast.error(error.message || 'Failed to save profile')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 py-12">
      <Card className="w-full max-w-lg bg-zinc-900/50 border-zinc-800 text-zinc-50 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Let's personalize your journey</CardTitle>
          <CardDescription className="text-zinc-400">
            Step {step} of 4
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-zinc-200">Full Name</Label>
                      <Input id="full_name" placeholder="Enter your full name" className="bg-zinc-950 border-zinc-800 text-zinc-50" {...register('full_name', { required: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-200">Target NEET Year</Label>
                      <Controller name="target_year" control={control} rules={{ required: true }} render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50"><SelectValue placeholder="Select year" /></SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {['2025', '2026', '2027', '2028'].map((year) => (<SelectItem key={year} value={year} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-50">{year}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      )} />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-zinc-200">Class Status</Label>
                      <Controller name="class_status" control={control} rules={{ required: true }} render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50"><SelectValue placeholder="Select class" /></SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {['11th', '12th', 'Dropper'].map((status) => (<SelectItem key={status} value={status} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-50">{status}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      )} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-200">Are you enrolled in a coaching institute?</Label>
                      <Controller name="coaching_status" control={control} rules={{ required: true }} render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50"><SelectValue placeholder="Select status" /></SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {['Yes', 'No'].map((status) => (<SelectItem key={status} value={status} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-50">{status}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      )} />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-zinc-200">Weak Subject</Label>
                      <Controller name="weak_subject" control={control} rules={{ required: true }} render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50"><SelectValue placeholder="Select subject" /></SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {['Physics', 'Chemistry', 'Biology'].map((subject) => (<SelectItem key={subject} value={subject} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-50">{subject}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      )} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-zinc-200">Daily Study Hours</Label>
                        <span className="text-primary font-semibold">{dailyHours} Hours</span>
                      </div>
                      <Controller
                        name="daily_hours"
                        control={control}
                        render={({ field }) => (
                          <Slider
                            min={2}
                            max={14}
                            step={1}
                            value={[field.value]} 
                            onValueChange={(val: any) => {
                              const newValue = Array.isArray(val) ? val[0] : val
                              field.onChange(newValue)
                              setDailyHours(newValue)
                            }}
                            className="py-4"
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-200">Study Time Preference</Label>
                      <Controller name="study_time_pref" control={control} rules={{ required: true }} render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-50"><SelectValue placeholder="Select time" /></SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (<SelectItem key={time} value={time} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-50">{time}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      )} />
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-zinc-200 flex items-center gap-2"><UserCircle className="w-4 h-4" /> Choose a Username</Label>
                      <Input id="username" placeholder="e.g. rishav_neet" className="bg-zinc-950 border-zinc-800 text-zinc-50" {...register('username', { required: true, minLength: 3 })} />
                      <p className="text-xs text-zinc-500">This must be unique. You will use this to log in next time.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-zinc-200 flex items-center gap-2"><Lock className="w-4 h-4" /> Create Password</Label>
                      <Input id="password" type="password" placeholder="Min 6 characters" className="bg-zinc-950 border-zinc-800 text-zinc-50" {...register('password', { required: true, minLength: 6 })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-zinc-200 flex items-center gap-2"><Lock className="w-4 h-4" /> Confirm Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="Re-enter password" className="bg-zinc-950 border-zinc-800 text-zinc-50" {...register('confirmPassword', { required: true })} />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between gap-4 pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" className="w-1/2 border-zinc-800 text-zinc-200 hover:bg-zinc-800" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              {step < 4 ? (
                <Button type="button" className={`${step === 1 ? 'w-full' : 'w-1/2'} bg-primary hover:bg-primary/90 text-white`} onClick={nextStep}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" className="w-1/2 bg-accent hover:bg-accent/90 text-white">
                  Complete Setup <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}