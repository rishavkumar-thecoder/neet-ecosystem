// src/components/layout/user-nav.tsx
'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger, 
  DropdownMenuGroup 
} from '@/components/ui/dropdown-menu'
import { User, Settings, Camera } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export function UserNav() {
  const [userName, setUserName] = useState<string>('User')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const email = user.email || ''
        const namePart = email.split('@')[0]
        if (!namePart.includes('user_91')) {
           setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1))
        }
        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url)
        }
      }
    }
    fetchUser()
  }, [supabase])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    toast.loading('Uploading photo...')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}_${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })
      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      toast.dismiss()
      toast.success('Profile photo updated!')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to upload. Did you create an "avatars" bucket in Supabase?')
    }
    event.target.value = ''
  }

  const initials = userName.substring(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-800 transition-colors outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring/50">
        <div className="relative w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden">
          {avatarUrl ? <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" /> : initials}
        </div>
        <div className="flex-1 text-left hidden md:block">
          <p className="text-sm font-medium text-zinc-50 truncate">{userName}</p>
          <p className="text-xs text-zinc-400">Student</p>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-50">
        <DropdownMenuGroup>
          <div className="flex flex-col items-center gap-2 py-4 px-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-2xl overflow-hidden">
                {avatarUrl ? <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" /> : initials}
              </div>
              <button onClick={handleUploadClick} className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-zinc-900 text-white hover:bg-primary/90 transition-colors" title="Add/Change photo">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <DropdownMenuLabel className="text-sm font-medium text-zinc-50 pt-1">{userName}</DropdownMenuLabel>
          </div>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-zinc-800" />
        
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer" onClick={() => router.push('/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </DropdownMenu>
  )
}