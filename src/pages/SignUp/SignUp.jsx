import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import logoicon from '../../Assets/logoicon.svg'
import logoword from '../../Assets/logoword.svg'
import iconSee from '../../Assets/see.svg'
import iconBuyer from '../../Assets/buyer.svg'
import iconVendor from '../../Assets/vendor.svg'
import iconGmail from '../../Assets/gmail.svg'
import iconIn from '../../Assets/in.svg'
import iconApple from '../../Assets/apple.svg'
import './SignUp.css'

const SignUp = () => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)

  const isAr = localStorage.getItem('sela_lang') === 'ar'

  const handleSignUp = async () => {
    setError('')
    if (!fullName || !email || !password || !selectedRole) {
      setError(
        isAr
          ? 'يرجى تعبئة الحقول المطلوبة'
          : 'Please fill in all required fields'
      )
      return
    }
    if (password !== confirmPassword) {
      setError(isAr ? 'كلمات المرور غير متطابقة' : 'Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email,
          full_name: fullName,
          phone,
          user_type: selectedRole,
        },
      ])
      if (insertError) {
        setError(insertError.message)
        return
      }
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    {
      id: 'buyer',
      icon: iconBuyer,
      title: isAr ? 'مشترٍ' : 'Buyer',
      description: isAr
        ? 'انشر احتياجاتك وابحث عن الموردين'
        : 'Post needs and find vendors',
    },
    {
      id: 'vendor',
      icon: iconVendor,
      title: isAr ? 'مورّد' : 'Vendor',
      description: isAr
        ? 'تصفح الاحتياجات وقدّم عروضك'
        : 'Browse needs and submit proposals',
    },
  ]

  return (
    <div
      className='signup-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='signup-content'>
        <div className='signup-logo'>
          <img src={logoicon} alt='' className='signup-logo-icon' />
          <img src={logoword} alt='SELA' className='signup-logo-word' />
        </div>

        <h1 className='signup-headline'>
          <span className='signup-headline-white'>
            {isAr ? 'تحدث أقل، ' : 'TALK LESS, '}
          </span>
          <span className='signup-headline-blue'>
            {isAr ? 'تزامن أكثر.' : 'SYNC MORE.'}
          </span>
        </h1>

        <div className='signup-form'>
          <label className='signup-label'>
            {isAr ? 'أنا...' : 'I am a...'}
          </label>

          <div className='signup-roles'>
            {roles.map((role) => (
              <button
                key={role.id}
                type='button'
                className={`signup-role-card ${selectedRole === role.id ? 'signup-role-active' : ''}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <img
                  src={role.icon}
                  alt={role.title}
                  className='signup-role-icon'
                />
                <div className='signup-role-title'>{role.title}</div>
                <div className='signup-role-desc'>{role.description}</div>
              </button>
            ))}
          </div>

          <input
            type='text'
            placeholder={isAr ? 'الاسم الكامل' : 'Ahmed Hassan'}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className='signup-input'
          />
          <input
            type='text'
            placeholder='you@company.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='signup-input'
          />

          <div className='signup-phone-row'>
            <select className='signup-country-select'>
              <option>🇪🇬 +20</option>
              <option>🇸🇦 +966</option>
              <option>🇦🇪 +971</option>
            </select>
            <input
              type='text'
              placeholder={isAr ? 'رقم الهاتف' : 'Phone number'}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className='signup-input signup-phone-input'
            />
          </div>

          <div className='signup-password-wrapper'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={isAr ? 'كلمة المرور' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='signup-input'
            />
            <button
              type='button'
              className='signup-toggle-password'
              onClick={() => setShowPassword(!showPassword)}
            >
              <img src={iconSee} alt='toggle' className='signup-eye-icon' />
            </button>
          </div>

          <div className='signup-password-wrapper'>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='signup-input'
            />
            <button
              type='button'
              className='signup-toggle-password'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <img src={iconSee} alt='toggle' className='signup-eye-icon' />
            </button>
          </div>

          <label className='signup-agree-label'>
            <input
              type='checkbox'
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className='signup-checkbox'
            />
            <span>
              {isAr ? 'أوافق على ' : 'I agree to '}
              <span className='signup-link'>{isAr ? 'الشروط' : 'Terms'}</span>
              {' & '}
              <span className='signup-link'>
                {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </span>
            </span>
          </label>

          {error && <p className='signup-error'>{error}</p>}

          <button
            className='signup-button-primary'
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading
              ? isAr
                ? 'جارٍ الإنشاء...'
                : 'CREATING...'
              : isAr
                ? 'إنشاء حساب'
                : 'CREATE ACCOUNT'}
          </button>

          <button
            className='signup-button-primary'
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(0,167,229,0.3)',
              marginTop: 8,
            }}
            onClick={() => navigate('/browse-needs')}
          >
            SKIP SIGNUP (TEST)
          </button>
        </div>

        <div className='signup-divider'>
          <div className='signup-line' />
          <span className='signup-or-text'>OR</span>
          <div className='signup-line' />
        </div>

        <p className='signup-social-label'>
          {isAr ? 'سجّل بواسطة' : 'Sign up with'}
        </p>

        <div className='signup-social'>
          <button type='button' className='signup-social-button'>
            <img src={iconGmail} alt='Gmail' />
          </button>
          <button type='button' className='signup-social-button'>
            <img src={iconIn} alt='LinkedIn' />
          </button>
          <button type='button' className='signup-social-button'>
            <img src={iconApple} alt='Apple' />
          </button>
        </div>

        <p className='signup-signin-row'>
          <span>{isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?'}</span>
          <button
            type='button'
            className='signup-signin-link'
            onClick={() => navigate('/login')}
          >
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignUp
