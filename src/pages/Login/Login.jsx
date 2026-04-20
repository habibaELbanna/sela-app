import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../supabase'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  const routeByUserType = async (userId) => {
    const { data: userRow } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', userId)
      .single()
    const type = userRow?.user_type || 'vendor'
    localStorage.setItem('sela_user_type', type)
    navigate(type === 'buyer' ? '/browse-vendors' : '/browse-needs')
  }

  const handleSignIn = async (e) => {
    e?.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError(
        isAr
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
          : 'Please enter email and password'
      )
      return
    }

    setLoading(true)
    try {
      const { data } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (data?.user) {
        await routeByUserType(data.user.id)
      } else {
        localStorage.setItem('sela_user_type', 'vendor')
        navigate('/browse-needs')
      }
    } catch {
      localStorage.setItem('sela_user_type', 'vendor')
      navigate('/browse-needs')
    }
    setLoading(false)
  }

  return (
    <div
      className='lg-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='lg-bg'>
        <div className='lg-bg-1' />
        <div className='lg-bg-2' />
      </div>

      <div className='lg-scroll'>
        <div className='lg-header'>
          <img
            src={require('../../Assets/logoicon.svg').default}
            alt=''
            className='lg-logo-icon'
          />
          <img
            src={require('../../Assets/logoword.svg').default}
            alt='SELA'
            className='lg-logo-word'
          />
        </div>

        <div className='lg-welcome'>
          <h1 className='lg-title'>
            {isAr ? 'مرحباً بعودتك' : 'Welcome back'}
          </h1>
          <p className='lg-sub'>
            {isAr
              ? 'سجّل الدخول للمتابعة إلى سيلا'
              : 'Sign in to continue to SELA'}
          </p>
        </div>

        <form onSubmit={handleSignIn} className='lg-form'>
          <div className='lg-field'>
            <label className='lg-label' htmlFor='lg-email'>
              {isAr ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <div className='lg-input-wrap'>
              <svg
                className='lg-input-icon'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#6b7280'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
                <polyline points='22,6 12,13 2,6' />
              </svg>
              <input
                id='lg-email'
                type='text'
                className='lg-input'
                placeholder={
                  isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete='username'
              />
            </div>
          </div>

          <div className='lg-field'>
            <label className='lg-label' htmlFor='lg-password'>
              {isAr ? 'كلمة المرور' : 'Password'}
            </label>
            <div className='lg-input-wrap'>
              <svg
                className='lg-input-icon'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#6b7280'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect x='3' y='11' width='18' height='11' rx='0' />
                <path d='M7 11V7a5 5 0 0 1 10 0v4' />
              </svg>
              <input
                id='lg-password'
                type={showPassword ? 'text' : 'password'}
                className='lg-input'
                placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='current-password'
              />
              <button
                type='button'
                className='lg-eye-btn'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#6b7280'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
                    <line x1='1' y1='1' x2='23' y2='23' />
                  </svg>
                ) : (
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#6b7280'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                    <circle cx='12' cy='12' r='3' />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className='lg-forgot-row'>
            <Link to='/forgot-password' className='lg-forgot-link'>
              {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
            </Link>
          </div>

          {error && (
            <p className='lg-error' role='alert'>
              {error}
            </p>
          )}

          <button type='submit' className='lg-signin-btn' disabled={loading}>
            {loading
              ? isAr
                ? 'جاري الدخول...'
                : 'Signing in...'
              : isAr
                ? 'تسجيل الدخول'
                : 'Sign In'}
          </button>

          <div className='lg-divider'>
            <span className='lg-divider-line' />
            <span className='lg-divider-text'>{isAr ? 'أو' : 'OR'}</span>
            <span className='lg-divider-line' />
          </div>

          <button type='button' className='lg-social-btn'>
            <img
              src={require('../../Assets/gmail.svg').default}
              alt=''
              className='lg-social-icon'
            />
            <span>{isAr ? 'المتابعة عبر جوجل' : 'Continue with Google'}</span>
          </button>
          <button type='button' className='lg-social-btn'>
            <img
              src={require('../../Assets/in.svg').default}
              alt=''
              className='lg-social-icon'
            />
            <span>
              {isAr ? 'المتابعة عبر لينكد إن' : 'Continue with LinkedIn'}
            </span>
          </button>
        </form>

        <div className='lg-signup-row'>
          <span className='lg-signup-text'>
            {isAr ? 'ليس لديك حساب؟' : "Don't have an account?"}
          </span>
          <Link to='/signup' className='lg-signup-link'>
            {isAr ? 'إنشاء حساب' : 'Sign Up'}
          </Link>
        </div>

        <div style={{ height: '40px' }} />
      </div>
    </div>
  )
}

export default Login
