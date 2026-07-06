// src/app/(dashboard)/settings/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, Trash2, Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { deleteAccount } from './actions'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Password reset state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/login')
    router.refresh()
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    setIsUpdating(true)
    try {
      // Supabase automatically updates the password for the currently logged-in user
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      
      if (error) throw error
      
      toast.success('Password updated successfully! You can now use it to log in.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you absolutely sure? This will permanently delete your account, all your study data, your username, and password. You cannot undo this.")
    
    if (!confirmDelete) return

    setIsDeleting(true)
    try {
      await deleteAccount()
    } catch (error: any) {
      setIsDeleting(false)
      toast.error(error.message || 'Failed to delete account')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-zinc-400 mt-2">Manage your account preferences and security.</p>
      </div>

      {/* NEW: Security / Change Password Card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Forgot your password? Set a new one here. You can use this password to log in with your Username next time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-zinc-200">New Password</Label>
            <Input 
              id="new_password" 
              type="password" 
              placeholder="Enter new password (min 6 characters)" 
              className="bg-zinc-950 border-zinc-800 text-zinc-50"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-zinc-200">Confirm New Password</Label>
            <Input 
              id="confirm_password" 
              type="password" 
              placeholder="Re-enter new password" 
              className="bg-zinc-950 border-zinc-800 text-zinc-50"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleUpdatePassword} disabled={isUpdating} className="bg-primary hover:bg-primary/90 text-white">
            {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Session</CardTitle>
          <CardDescription className="text-zinc-400">Log out of your current device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignOut} variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-white">
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-destructive/5 border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription className="text-zinc-400">
            Permanently delete your account and all associated data. If you log in via OTP again, you will be treated as a brand new user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDeleteAccount} disabled={isDeleting} variant="destructive">
            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete My Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}