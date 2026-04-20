import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import logoicon from '../../Assets/logoicon.svg'
import logoword from '../../Assets/logoword.svg'
import bgImage from '../../Assets/onboarding-bg.svg'
import iconForgot from '../../Assets/forgot.svg'
import './ForgotPassword.css'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const isAr = localStorage.getItem('sela_lang') === 'ar'

  const handleResetPassword = async () => {
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email)

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className='forgot-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <img src={bgImage} alt='' className='forgot-bg' />

      <div className='forgot-content'>
        <div className='forgot-topbar'>
          <button className='forgot-back' onClick={() => navigate('/login')}>
            ←
          </button>

          <div className='forgot-logo'>
            <img src={logoword} alt='SELA' className='forgot-logo-word' />
            <img src={logoicon} alt='' className='forgot-logo-icon' />
          </div>

          <div className='forgot-topbar-spacer' />
        </div>

        <div className='forgot-form-container'>
          <div className='forgot-lock-icon'>
            <img src={iconForgot} alt='lock' className='forgot-icon' />
          </div>

          <h1 className='forgot-title'>Forgot Password?</h1>
          <p className='forgot-description'>
            Enter your email and we'll send you a reset link
          </p>

          <div className='forgot-form'>
            <input
              type='email'
              placeholder='you@company.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='forgot-input'
            />

            {success && (
              <p className='forgot-success'>
                Reset link sent! Check your inbox.
              </p>
            )}

            {error && <p className='forgot-error'>{error}</p>}

            <button
              className='forgot-button-primary'
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </div>

          <p className='forgot-or-text'>or reset via</p>

          <button className='forgot-button-secondary'>Reset via SMS</button>

          <p className='forgot-signin-link'>
            Remember password?{' '}
            <button
              type='button'
              className='forgot-signin-button'
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
