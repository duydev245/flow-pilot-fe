import logoFlowpilot from '@/app/assets/LogoFlowPilot.png'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form'
import { Input } from '@/app/components/ui/input'
import { PATH } from '@/app/routes/path'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { object, string } from 'yup'
import { useLogin } from './hooks/useLogin'
import type { LoginForm } from './models/LoginFormInterface'

const loginFormSchema = object({
  email: string().email('Invalid email address').required('Email is required'),
  password: string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters')
    // .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .required('Password is required')
})

function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const loginMutation = useLogin()
  const isLoading = loginMutation.status === 'pending'
  const navigate = useNavigate()
  const form = useForm<LoginForm>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: ''
    },
    resolver: yupResolver(loginFormSchema)
  })

  const { control, handleSubmit } = form

  const onSubmit: SubmitHandler<LoginForm> = (data) => {
    const payload = {
      email: data.email.trim(),
      password: data.password.trim()
    }
    loginMutation.mutate(payload)
  }

  return (
    <div
      className='min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300'
      style={{ backgroundAttachment: 'fixed' }}
    >
      <Card className='w-full max-w-md bg-white/90 rounded-2xl shadow-2xl flex flex-col items-center p-10 border-0 relative'>
        <CardContent className='w-full flex flex-col items-center p-0 '>
          <button
            className='absolute left-8 top-8 flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium px-2 py-1 rounded-md z-10'
            onClick={() => navigate(PATH.LANDING_PAGE)}
            aria-label='Back'
          >
            <svg width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            Back
          </button>
          <div className='flex flex-col items-center mb-8'>
            <img className='w-28 h-28 object-contain drop-shadow-lg' src={logoFlowpilot} alt='flow-pilot-logo' />
            <p className='text-gray-400 text-sm'>Welcome to FlowPilot</p>
          </div>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='w-full flex flex-col items-center gap-4'>
              <FormField
                control={control}
                name='email'
                render={({ field }) => (
                  <FormItem className='w-full max-w-sm'>
                    <FormLabel className='text-base font-medium text-gray-700'>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type='email' placeholder='Enter your email' autoComplete='email' />
                    </FormControl>
                    <FormMessage className='text-red-500 text-xs mt-1' />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='password'
                render={({ field }) => (
                  <FormItem className='w-full max-w-sm'>
                    <FormLabel className='text-base font-medium text-gray-700'>Password</FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Enter your password'
                          autoComplete='current-password'
                          className='pr-10'
                        />
                      </FormControl>
                      <button
                        type='button'
                        tabIndex={-1}
                        className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 focus:outline-none'
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            strokeWidth={1.5}
                            stroke='currentColor'
                            className='w-5 h-5'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='M3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.807 6.07 6.75 9.75 6.75 1.563 0 3.06-.362 4.396-1.01M6.228 6.228A10.45 10.45 0 0 1 12 5.25c3.68 0 7.714 2.943 9.75 6.75a10.48 10.48 0 0 1-4.293 4.736M6.228 6.228l11.544 11.544M6.228 6.228 3 3m0 0l18 18'
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            strokeWidth={1.5}
                            stroke='currentColor'
                            className='w-5 h-5'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='M2.25 12S5.25 5.25 12 5.25 21.75 12 21.75 12 18.75 18.75 12 18.75 2.25 12 2.25 12z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <FormMessage className='text-red-500 text-xs mt-1' />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='w-full max-w-sm bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 rounded-full text-lg transition mb-4 border-0 shadow-md'
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Log In'}
              </Button>
            </form>
          </Form>
          <div className='flex flex-col gap-2 w-full text-sm text-gray-500 mt-2'>
            <span className='text-center'>
              Forgot password?{' '}
              <Link to={PATH.FORGOT_PASSWORD} className='text-blue-500 hover:underline font-medium'>
                Click here
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
