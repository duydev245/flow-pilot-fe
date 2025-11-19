import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { UserSuperAdminAPI } from '@/app/apis/AUTH/user.api'
import type { IProfile } from '@/app/models'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Label } from '@/app/components/ui/label'
import { Separator } from '@/app/components/ui/separator'
import { Badge } from '@/app/components/ui/badge'
import { Edit, User, Upload, X } from 'lucide-react'
import { setLocalStorage } from '@/app/utils'

const roleDisplayMap: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  projectmanager: 'Project Manager',
  'project manager': 'Project Manager',
  PROJECTMANAGER: 'Project Manager',
  employee: 'Employee',
  EMPLOYEE: 'Employee'
}

interface FormData {
  name: string
  phone: string
  address: string
  bio: string
  nickname: string
}

interface FormErrors {
  name?: string
  phone?: string
  address?: string
  bio?: string
  nickname?: string
}

function AdminSettings() {
  const [profile, setProfile] = useState<IProfile | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    address: '',
    bio: '',
    nickname: ''
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const profileData = await UserSuperAdminAPI.getMe()
        setProfile(profileData)

        // Reset form with profile data
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          bio: profileData.bio || '',
          nickname: profileData.nickname || ''
        })
      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Can not load profile information')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Name must not exceed 50 characters'
    }

    // Phone validation
    if (formData.phone.trim() && formData.phone.trim().length > 0) {
      if (!/^[0-9+\-\s()]+$/.test(formData.phone.trim())) {
        errors.phone = 'Phone number is invalid'
      } else if (formData.phone.trim().length < 10) {
        errors.phone = 'Phone number must be at least 10 digits'
      }
    }

    // Address validation
    if (formData.address.trim().length > 200) {
      errors.address = 'Address must not exceed 200 characters'
    }

    // Bio validation
    if (formData.bio.trim().length > 500) {
      errors.bio = 'Bio must not exceed 500 characters'
    }

    // Nickname validation
    if (formData.nickname.trim() && formData.nickname.trim().length > 0) {
      if (formData.nickname.trim().length < 2 || formData.nickname.trim().length > 30) {
        errors.nickname = 'Nickname must be 2-30 characters long'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle avatar file selection
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (20MB limit)
    const maxSize = 20 * 1024 * 1024 // 20MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must not exceed 20MB')
      return
    }

    setAvatarFile(file)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
  }

  // Remove selected avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Toggle edit mode
  const handleToggleEditMode = () => {
    if (isEditMode) {
      // Reset form when canceling edit
      setFormData({
        name: profile?.name || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        bio: profile?.bio || '',
        nickname: profile?.nickname || ''
      })
      setFormErrors({})
      handleRemoveAvatar()
    }
    setIsEditMode(!isEditMode)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const submitFormData = new FormData()

      // Add form fields
      submitFormData.append('name', formData.name.trim())
      if (formData.phone.trim()) submitFormData.append('phone', formData.phone.trim())
      if (formData.address.trim()) submitFormData.append('address', formData.address.trim())
      if (formData.bio.trim()) submitFormData.append('bio', formData.bio.trim())
      if (formData.nickname.trim()) submitFormData.append('nickname', formData.nickname.trim())
      if (profile?.avatar_url) submitFormData.append('avatar_url', profile.avatar_url)

      // Add avatar file if selected
      if (avatarFile) {
        submitFormData.append('avatar', avatarFile)
      }

      await UserSuperAdminAPI.updateProfile(submitFormData)

      // Reload profile data
      const updatedProfile = await UserSuperAdminAPI.getMe()
      setProfile(updatedProfile)
      setLocalStorage('profile', updatedProfile)

      setIsEditMode(false)
      handleRemoveAvatar()
      toast.success('Update profile successfully!')
      window.location.reload()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Update profile failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading information...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-muted-foreground'>Cannot load profile information</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-6 max-w-4xl'>
      <Card>
        <CardHeader className='pb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2 text-2xl'>
                <User className='h-6 w-6' />
                Account Settings
              </CardTitle>
              <p className='text-muted-foreground mt-2'>Manage your personal information and account settings</p>
            </div>
            <Button
              onClick={handleToggleEditMode}
              variant={isEditMode ? 'outline' : 'default'}
              className='min-w-[120px]'
            >
              {isEditMode ? (
                <>
                  <X className='h-4 w-4 mr-2' />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className='h-4 w-4 mr-2' />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Avatar Section */}
            <div className='flex flex-col items-center space-y-4'>
              <div className='relative'>
                <Avatar className='h-24 w-24'>
                  <AvatarImage src={avatarPreview || profile.avatar_url || undefined} alt={profile.name} />
                  <AvatarFallback className='text-lg'>{profile.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                {isEditMode && (
                  <Button
                    type='button'
                    size='icon'
                    variant='secondary'
                    className='absolute -bottom-2 -right-2 h-8 w-8 rounded-full'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className='h-4 w-4' />
                  </Button>
                )}
              </div>

              {isEditMode && (
                <>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleAvatarChange}
                    className='hidden'
                  />
                  <div className='text-center'>
                    <p className='text-sm text-muted-foreground'>Select a new avatar image (max 20MB)</p>
                    {avatarFile && (
                      <div className='flex items-center justify-center gap-2 mt-2'>
                        <span className='text-sm text-green-600'>{avatarFile.name}</span>
                        <Button type='button' size='sm' variant='ghost' onClick={handleRemoveAvatar}>
                          <X className='h-3 w-3' />
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Profile Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Name Field */}
              <div className='space-y-2'>
                <Label htmlFor='name'>Full Name *</Label>
                <Input
                  id='name'
                  placeholder='Enter full name'
                  disabled={!isEditMode}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={formErrors.name ? 'border-destructive' : ''}
                />
                {formErrors.name && <p className='text-sm text-destructive'>{formErrors.name}</p>}
              </div>

              {/* Email Field (Read-only) */}
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' value={profile.email} disabled className='bg-muted' />
                <p className='text-xs text-muted-foreground'>Email cannot be changed</p>
              </div>

              {/* Phone Field */}
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  placeholder='Enter phone number'
                  disabled={!isEditMode}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={formErrors.phone ? 'border-destructive' : ''}
                />
                {formErrors.phone && <p className='text-sm text-destructive'>{formErrors.phone}</p>}
              </div>

              {/* Nickname Field */}
              <div className='space-y-2'>
                <Label htmlFor='nickname'>Nickname</Label>
                <Input
                  id='nickname'
                  placeholder='Enter nickname'
                  disabled={!isEditMode}
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  className={formErrors.nickname ? 'border-destructive' : ''}
                />
                {formErrors.nickname && <p className='text-sm text-destructive'>{formErrors.nickname}</p>}
              </div>
            </div>

            {/* Address Field */}
            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              <Input
                id='address'
                placeholder='Enter address'
                disabled={!isEditMode}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={formErrors.address ? 'border-destructive' : ''}
              />
              {formErrors.address && <p className='text-sm text-destructive'>{formErrors.address}</p>}
            </div>

            {/* Bio Field */}
            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio</Label>
              <Textarea
                id='bio'
                placeholder='Write a few lines about yourself...'
                disabled={!isEditMode}
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className={formErrors.bio ? 'border-destructive' : ''}
              />
              {formErrors.bio && <p className='text-sm text-destructive'>{formErrors.bio}</p>}
            </div>

            <Separator />

            {/* Additional Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Role</p>
                <Badge variant='secondary' className='mt-1'>
                  {roleDisplayMap[(profile.role?.role || '').toLowerCase()] || (profile.role?.role || 'N/A')}
                </Badge>
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Status</p>
                <Badge
                  className={`mt-1 ${profile.status === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                >
                  {profile.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Created At</p>
                <p className='text-sm mt-1'>{new Date(profile.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            {/* Submit Button */}
            {isEditMode && (
              <div className='flex justify-end pt-4'>
                <Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
                  {isSubmitting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminSettings
