import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import logoicon from '../../Assets/logoicon.svg'
import logoword from '../../Assets/logoword.svg'
import bgImage from '../../Assets/onboarding-bg.svg'
import iconSee from '../../Assets/see.svg'
import iconGmail from '../../Assets/gmail.svg'
import iconIn from '../../Assets/in.svg'
import iconApple from '../../Assets/apple.svg'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAr = localStorage.getItem('sela_lang') === 'ar'

  const routeByUserType = (userType) => {
    localStorage.setItem('sela_user_type', userType)
    if (userType === 'buyer') {
      navigate('/browse-vendors')
    } else {
      navigate('/browse-needs')
    }
  }

  const handleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })
      if (authError) {
        setError(authError.message)
        return
      }

      const userId = authData?.user?.id
      if (!userId) {
        setError(isAr ? 'خطأ في المصادقة' : 'Authentication error')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', userId)
        .single()

      const userType = userData?.user_type || 'vendor'
      routeByUserType(userType)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const skipAs = (userType) => {
    routeByUserType(userType)
  }

  return (
    <div
      className='login-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <img src={bgImage} alt='' className='login-bg' />
      <div className='login-content'>
        <div className='login-logo'>
          <img src={logoword} alt='SELA' className='login-logo-word' />
          <img src={logoicon} alt='' className='login-logo-icon' />
        </div>

        <div className='login-header'>
          <h1 className='login-title'>
            {isAr ? 'مرحباً بعودتك' : 'Welcome Back'}
          </h1>
          <p className='login-subtitle'>
            {isAr ? 'سجّل دخولك للمتابعة' : 'Sign in to continue'}
          </p>
        </div>

        <div className='login-form'>
          <input
            type='text'
            placeholder='you@company.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='login-input'
          />

          <div className='login-password-wrapper'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={isAr ? 'كلمة المرور' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='login-input'
            />
            <button
              type='button'
              className='login-toggle-password'
              onClick={() => setShowPassword(!showPassword)}
            >
              <img src={iconSee} alt='toggle' className='login-eye-icon' />
            </button>
          </div>

          <div className='login-checkbox-row'>
            <label className='login-checkbox-label'>
              <input
                type='checkbox'
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className='login-checkbox'
              />
              <span>{isAr ? 'تذكرني' : 'Remember me'}</span>
            </label>
            <button
              type='button'
              className='login-forgot-link'
              onClick={() => navigate('/forgot-password')}
            >
              {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
            </button>
          </div>

          {error && <p className='login-error'>{error}</p>}

          <button
            className='login-button-primary'
            onClick={handleSignIn}
            disabled={loading}
          >
            {loading
              ? isAr
                ? 'جارٍ تسجيل الدخول...'
                : 'SIGNING IN...'
              : isAr
                ? 'تسجيل الدخول'
                : 'SIGN IN'}
          </button>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className='login-button-primary'
              style={{
                flex: 1,
                background: '#1a1a1a',
                border: '1px solid rgba(0,167,229,0.3)',
                fontSize: 11,
              }}
              onClick={() => skipAs('vendor')}
            >
              SKIP AS VENDOR
            </button>
            <button
              className='login-button-primary'
              style={{
                flex: 1,
                background: '#1a1a1a',
                border: '1px solid rgba(0,167,229,0.3)',
                fontSize: 11,
              }}
              onClick={() => skipAs('buyer')}
            >
              SKIP AS BUYER
            </button>
          </div>
        </div>

        <div className='login-divider'>
          <div className='login-line' />
          <span className='login-or-text'>OR</span>
          <div className='login-line' />
        </div>

        <div className='login-social'>
          <button className='login-social-button'>
            <img src={iconGmail} alt='Gmail' />
          </button>
          <button className='login-social-button'>
            <img src={iconIn} alt='LinkedIn' />
          </button>
          <button className='login-social-button'>
            <img src={iconApple} alt='Apple' />
          </button>
        </div>

        <p className='login-signup-row'>
          <span>{isAr ? 'ليس لديك حساب؟' : "Don't have an account?"}</span>
          <button
            type='button'
            className='login-signup-link'
            onClick={() => navigate('/signup')}
          >
            {isAr ? 'إنشاء حساب' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
