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
  const [countryCode, setCountryCode] = useState('+20')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)

  const isAr = localStorage.getItem('sela_lang') === 'ar'

  const handleSignUp = async (e) => {
    e?.preventDefault()
    setError('')

    if (!selectedRole) {
      setError(
        isAr ? 'يرجى اختيار نوع الحساب' : 'Please select Buyer or Vendor'
      )
      return
    }
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields')
      return
    }
    if (!agreed) {
      setError(isAr ? 'يرجى الموافقة على الشروط' : 'Please agree to the Terms')
      return
    }

    setLoading(true)
    try {
      const fullPhone = phone
        ? `${countryCode}${phone.replace(/^0+/, '')}`
        : null

      const { data } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (data?.user) {
        await supabase.from('users').insert([
          {
            id: data.user.id,
            email: email.trim(),
            full_name: fullName.trim(),
            phone: fullPhone,
            user_type: selectedRole,
          },
        ])
      }

      localStorage.setItem('sela_user_type', selectedRole)
      navigate(selectedRole === 'buyer' ? '/browse-vendors' : '/browse-needs')
    } catch {
      localStorage.setItem('sela_user_type', selectedRole)
      navigate(selectedRole === 'buyer' ? '/browse-vendors' : '/browse-needs')
    }
    setLoading(false)
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
          <img src={logoword} alt='SELA' className='signup-logo-word' />
          <img src={logoicon} alt='' className='signup-logo-icon' />
        </div>

        <h1 className='signup-headline'>
          <span className='signup-headline-white'>
            {isAr ? 'تحدث أقل، ' : 'TALK LESS, '}
          </span>
          <span className='signup-headline-blue'>
            {isAr ? 'تزامن أكثر.' : 'SYNC MORE.'}
          </span>
        </h1>

        <form onSubmit={handleSignUp} className='signup-form' noValidate>
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
                aria-pressed={selectedRole === role.id}
              >
                <img src={role.icon} alt='' className='signup-role-icon' />
                <div className='signup-role-title'>{role.title}</div>
                <div className='signup-role-desc'>{role.description}</div>
              </button>
            ))}
          </div>

          <input
            type='text'
            placeholder={isAr ? 'الاسم الكامل' : 'Full name'}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className='signup-input'
            autoComplete='name'
          />
          <input
            type='text'
            placeholder={isAr ? 'البريد الإلكتروني' : 'Email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='signup-input'
            autoComplete='email'
          />

          <div className='signup-phone-row'>
            <select
              className='signup-country-select'
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              aria-label={isAr ? 'رمز الدولة' : 'Country code'}
            >
              <option value='+20'>🇪🇬 +20</option>
              <option value='+966'>🇸🇦 +966</option>
              <option value='+971'>🇦🇪 +971</option>
            </select>
            <input
              type='tel'
              placeholder={isAr ? 'رقم الهاتف' : 'Phone number'}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              className='signup-input signup-phone-input'
              autoComplete='tel'
            />
          </div>

          <div className='signup-password-wrapper'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={isAr ? 'كلمة المرور' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='signup-input'
              autoComplete='new-password'
            />
            <button
              type='button'
              className='signup-toggle-password'
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <img src={iconSee} alt='' className='signup-eye-icon' />
            </button>
          </div>

          <div className='signup-password-wrapper'>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='signup-input'
              autoComplete='new-password'
            />
            <button
              type='button'
              className='signup-toggle-password'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              <img src={iconSee} alt='' className='signup-eye-icon' />
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

          {error && (
            <p className='signup-error' role='alert'>
              {error}
            </p>
          )}

          <button
            type='submit'
            className='signup-button-primary'
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
        </form>

        <div className='signup-divider'>
          <div className='signup-line' />
          <span className='signup-or-text'>{isAr ? 'أو' : 'OR'}</span>
          <div className='signup-line' />
        </div>

        <p className='signup-social-label'>
          {isAr ? 'سجّل بواسطة' : 'Sign up with'}
        </p>

        <div className='signup-social'>
          <button
            type='button'
            className='signup-social-button'
            aria-label='Sign up with Google'
          >
            <img src={iconGmail} alt='' />
          </button>
          <button
            type='button'
            className='signup-social-button'
            aria-label='Sign up with LinkedIn'
          >
            <img src={iconIn} alt='' />
          </button>
          <button
            type='button'
            className='signup-social-button'
            aria-label='Sign up with Apple'
          >
            <img src={iconApple} alt='' />
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
