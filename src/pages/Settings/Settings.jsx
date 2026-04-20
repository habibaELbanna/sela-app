import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import Preloader from '../../components/Preloader/Preloader'
import './Settings.css'

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000002'

const Settings = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(null)

  const [pushNotifs, setPushNotifs] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(false)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [onlineStatus, setOnlineStatus] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [autoDownload, setAutoDownload] = useState(true)

  const [language, setLanguage] = useState(localStorage.getItem('sela_lang') || 'en')
  const [currency, setCurrency] = useState('EGP')
  const [timeZone, setTimeZone] = useState('Cairo (GMT+2)')
  const [imageQuality, setImageQuality] = useState('High')

  const [projectTypes, setProjectTypes] = useState(['Commercial', 'Office'])
  const [budgetMin, setBudgetMin] = useState(10000)
  const [budgetMax, setBudgetMax] = useState(500000)
  const [regions, setRegions] = useState(['Cairo', 'Giza'])

  const [whoSeesProfile] = useState('Everyone')
  const [whoContacts] = useState('Everyone')

  const isAr = language === 'ar'

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', DEMO_USER_ID)
        .single()
      if (userData) setUser(userData)
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleLanguageChange = (lng) => {
    setLanguage(lng)
    localStorage.setItem('sela_lang', lng)
    setShowModal(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('sela_user_type')
    navigate('/login')
  }

  const handleDeactivate = () => {
    if (window.confirm(isAr ? 'هل أنت متأكد من إلغاء تفعيل الحساب؟' : 'Are you sure you want to deactivate your account?')) {
      navigate('/login')
    }
  }

  const handleDelete = () => {
    if (window.confirm(isAr ? 'هذا الإجراء نهائي. هل أنت متأكد؟' : 'This action is permanent. Are you sure?')) {
      navigate('/login')
    }
  }

  if (loading) return <Preloader />

  const Toggle = ({ value, onChange }) => (
    <button
      className={`st-toggle ${value ? 'st-toggle-on' : ''}`}
      onClick={() => onChange(!value)}
      aria-label='Toggle'
    >
      <span className='st-toggle-thumb' />
    </button>
  )

  const Row = ({ icon, title, subtitle, onClick, rightText, rightBadge, toggle, toggleValue, onToggle, danger }) => (
    <div className={`st-row ${danger ? 'st-row-danger' : ''}`} onClick={toggle ? undefined : onClick}>
      {icon && <div className='st-row-icon'>{icon}</div>}
      <div className='st-row-text'>
        <span className={`st-row-title ${danger ? 'st-row-title-danger' : ''}`}>{title}</span>
        {subtitle && <span className='st-row-subtitle'>{subtitle}</span>}
      </div>
      {rightBadge && <span className='st-row-badge'>{rightBadge}</span>}
      {rightText && <span className='st-row-right'>{rightText}</span>}
      {toggle && <Toggle value={toggleValue} onChange={onToggle} />}
      {!toggle && !rightBadge && onClick && (
        <svg className='st-row-chevron' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <polyline points={isAr ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}/>
        </svg>
      )}
    </div>
  )

  const projectTypeOptions = ['Commercial', 'Residential', 'Office', 'Industrial', 'Retail', 'Hospitality']
  const regionOptions = ['Cairo', 'Giza', 'Alexandria', 'New Cairo', 'Sharm El Sheikh', '6th of October', 'Mansoura']

  const toggleProjectType = (type) => {
    setProjectTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const toggleRegion = (region) => {
    setRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region])
  }

  return (
    <div className='st-container' dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Tajawal, sans-serif' : 'Helvetica, Arial, sans-serif' }}>

      <div className='st-bg'>
        <div className='st-bg-1' />
        <div className='st-bg-2' />
      </div>

      <div className='st-topbar'>
        <button className='st-back' onClick={() => navigate(-1)}>
          <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M19 12H5'/><polyline points='12 19 5 12 12 5'/>
          </svg>
        </button>
        <h1 className='st-topbar-title'>{isAr ? 'الإعدادات' : 'Settings'}</h1>
        <div style={{ width: 22 }} />
      </div>

      <div className='st-scroll'>

        <h2 className='st-section-title'>{isAr ? 'الحساب' : 'Account'}</h2>
        <div className='st-group'>
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>}
            title={isAr ? 'تعديل الملف الشخصي' : 'Edit Profile'}
            subtitle={isAr ? 'الاسم، الشركة، النبذة' : 'Name, company, bio'}
            onClick={() => navigate('/profile/edit')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/><polyline points='22,6 12,13 2,6'/></svg>}
            title={isAr ? 'معلومات الاتصال' : 'Contact Information'}
            subtitle={user?.email || 'ahmed@buildright.com'}
            onClick={() => navigate('/profile/edit')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='11' width='18' height='11' rx='0'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>}
            title={isAr ? 'تغيير كلمة المرور' : 'Change Password'}
            subtitle={isAr ? 'آخر تغيير: منذ شهرين' : 'Last changed 2 months ago'}
            onClick={() => setShowModal('password')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#10B981' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12'/></svg>}
            title={isAr ? 'التحقق من الحساب' : 'Account Verification'}
            subtitle={isAr ? 'الأعمال، الرقم الضريبي' : 'Business, Tax ID'}
            rightBadge={isAr ? 'موثق' : 'Verified'}
            onClick={() => setShowModal('verification')}
          />
        </div>

        <h2 className='st-section-title'>{isAr ? 'الإشعارات' : 'Notifications'}</h2>
        <div className='st-group'>
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#FFA500' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/></svg>}
            title={isAr ? 'إشعارات الدفع' : 'Push Notifications'}
            subtitle={isAr ? 'تلقي الإشعارات على جهازك' : 'Receive notifications on your device'}
            toggle
            toggleValue={pushNotifs}
            onToggle={setPushNotifs}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/><polyline points='22,6 12,13 2,6'/></svg>}
            title={isAr ? 'تنبيهات البريد الإلكتروني' : 'Email Alerts'}
            subtitle={isAr ? 'تحديثات عبر البريد' : 'Get updates via email'}
            toggle
            toggleValue={emailAlerts}
            onToggle={setEmailAlerts}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='5' y='2' width='14' height='20' rx='0'/><line x1='12' y1='18' x2='12.01' y2='18'/></svg>}
            title={isAr ? 'تنبيهات الرسائل النصية' : 'SMS Alerts'}
            subtitle={isAr ? 'تحديثات عاجلة عبر SMS' : 'Urgent updates via SMS'}
            toggle
            toggleValue={smsAlerts}
            onToggle={setSmsAlerts}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='3'/><path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'/></svg>}
            title={isAr ? 'أنواع الإشعارات' : 'Notification Types'}
            onClick={() => setShowModal('notifTypes')}
          />
        </div>

        <h2 className='st-section-title'>{isAr ? 'التفضيلات' : 'Preferences'}</h2>
        <div className='st-group'>
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/></svg>}
            title={isAr ? 'اللغة' : 'Language'}
            rightText={language === 'ar' ? 'العربية' : 'English'}
            onClick={() => setShowModal('language')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#FFA500' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='1' x2='12' y2='23'/><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/></svg>}
            title={isAr ? 'العملة' : 'Currency'}
            rightText={currency}
            onClick={() => setShowModal('currency')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg>}
            title={isAr ? 'المنطقة الزمنية' : 'Time Zone'}
            rightText={timeZone}
            onClick={() => setShowModal('timezone')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'/></svg>}
            title={isAr ? 'الوضع الداكن' : 'Dark Mode'}
            subtitle={darkMode ? (isAr ? 'مفعل دائماً' : 'Always On') : (isAr ? 'متوقف' : 'Off')}
            toggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='3' width='18' height='18' rx='0'/><path d='M3 9h18'/><path d='M9 21V9'/></svg>}
            title={isAr ? 'أنواع المشاريع المفضلة' : 'Preferred Project Types'}
            subtitle={projectTypes.join(' · ')}
            onClick={() => setShowModal('projectTypes')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#10B981' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='1' x2='12' y2='23'/><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/></svg>}
            title={isAr ? 'نطاق الميزانية' : 'Budget Range'}
            subtitle={`EGP ${(budgetMin / 1000).toFixed(0)}K - ${(budgetMax / 1000).toFixed(0)}K`}
            onClick={() => setShowModal('budget')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#EF4444' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>}
            title={isAr ? 'مناطق التسليم' : 'Delivery Regions'}
            subtitle={regions.join(' · ')}
            onClick={() => setShowModal('regions')}
          />
        </div>

        <h2 className='st-section-title'>{isAr ? 'الخصوصية والأمان' : 'Privacy & Security'}</h2>
        <div className='st-group'>
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/><circle cx='12' cy='12' r='3'/></svg>}
            title={isAr ? 'من يمكنه رؤية ملفي' : 'Who can see my profile'}
            rightText={whoSeesProfile}
            onClick={() => setShowModal('whoSees')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z'/></svg>}
            title={isAr ? 'من يمكنه التواصل معي' : 'Who can contact me'}
            rightText={whoContacts}
            onClick={() => setShowModal('whoContacts')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='#10B981' stroke='#10B981' strokeWidth='2'><circle cx='12' cy='12' r='6'/></svg>}
            title={isAr ? 'حالة الاتصال' : 'Online Status'}
            subtitle={isAr ? 'السماح للآخرين برؤية متى تكون نشطاً' : "Let others see when you're active"}
            toggle
            toggleValue={onlineStatus}
            onToggle={setOnlineStatus}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/></svg>}
            title={isAr ? 'إظهار نشاطي' : 'Show My Activity'}
            subtitle={isAr ? 'عرض العروض/الطلبات الأخيرة' : 'Display recent proposals/needs'}
            toggle
            toggleValue={showActivity}
            onToggle={setShowActivity}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#EF4444' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='4.93' y1='4.93' x2='19.07' y2='19.07'/></svg>}
            title={isAr ? 'المستخدمون المحظورون' : 'Blocked Users'}
            subtitle={isAr ? 'إدارة الحسابات المحظورة' : 'Manage blocked accounts'}
            onClick={() => setShowModal('blocked')}
          />
        </div>

        <h2 className='st-section-title'>{isAr ? 'التطبيق' : 'App'}</h2>
        <div className='st-group'>
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'/><polyline points='17 21 17 13 7 13 7 21'/><polyline points='7 3 7 8 15 8'/></svg>}
            title={isAr ? 'التخزين' : 'Storage'}
            subtitle={isAr ? 'ذاكرة مؤقتة: 45 ميجا' : 'Cache: 45 MB'}
            onClick={() => setShowModal('storage')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='3' width='18' height='18' rx='0'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>}
            title={isAr ? 'جودة الصورة' : 'Image Quality'}
            rightText={imageQuality}
            onClick={() => setShowModal('imageQuality')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><polyline points='7 10 12 15 17 10'/><line x1='12' y1='15' x2='12' y2='3'/></svg>}
            title={isAr ? 'تنزيل الوسائط تلقائياً' : 'Auto-Download Media'}
            toggle
            toggleValue={autoDownload}
            onToggle={setAutoDownload}
          />
        </div>

        <h2 className='st-section-title'>{isAr ? 'الدعم' : 'Support'}</h2>
        <div className='st-group'>
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'/><line x1='12' y1='17' x2='12.01' y2='17'/></svg>}
            title={isAr ? 'المساعدة والدعم' : 'Help & Support'}
            onClick={() => setShowModal('help')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#FFA500' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/></svg>}
            title={isAr ? 'الإبلاغ عن مشكلة' : 'Report Issue'}
            onClick={() => setShowModal('report')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/></svg>}
            title={isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}
            onClick={() => setShowModal('terms')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='11' width='18' height='11' rx='0'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>}
            title={isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
            onClick={() => setShowModal('privacy')}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='12' y1='16' x2='12' y2='12'/><line x1='12' y1='8' x2='12.01' y2='8'/></svg>}
            title={isAr ? 'حول سيلا' : 'About Sela'}
            subtitle={isAr ? 'الإصدار 1.0.0' : 'Version 1.0.0'}
            onClick={() => setShowModal('about')}
          />
        </div>

        <h2 className='st-section-title'>{isAr ? 'إجراءات الحساب' : 'Account Actions'}</h2>
        <div className='st-group'>
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#FFA500' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='10' y1='15' x2='10' y2='9'/><line x1='14' y1='15' x2='14' y2='9'/></svg>}
            title={isAr ? 'إلغاء تفعيل الحساب' : 'Deactivate Account'}
            subtitle={isAr ? 'تعطيل حسابك مؤقتاً' : 'Temporarily disable your account'}
            onClick={handleDeactivate}
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#EF4444' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='3 6 5 6 21 6'/><path d='M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/></svg>}
            title={isAr ? 'حذف الحساب' : 'Delete Account'}
            subtitle={isAr ? 'حذف بياناتك نهائياً' : 'Permanently delete your data'}
            onClick={handleDelete}
            danger
          />
          <Row
            icon={<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#b0b0b0' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/><polyline points='16 17 21 12 16 7'/><line x1='21' y1='12' x2='9' y2='12'/></svg>}
            title={isAr ? 'تسجيل الخروج' : 'Logout'}
            onClick={handleLogout}
          />
        </div>

        <div style={{ height: '40px' }} />
      </div>

      {showModal === 'language' && (
        <div className='st-modal-overlay' onClick={() => setShowModal(null)}>
          <div className='st-modal' onClick={(e) => e.stopPropagation()}>
            <div className='st-modal-handle' />
            <h3 className='st-modal-title'>{isAr ? 'اختر اللغة' : 'Choose Language'}</h3>
            <button className={`st-option ${language === 'en' ? 'st-option-active' : ''}`} onClick={() => handleLanguageChange('en')}>
              <span>English</span>
              {language === 'en' && (
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                  <polyline points='20 6 9 17 4 12'/>
                </svg>
              )}
            </button>
            <button className={`st-option ${language === 'ar' ? 'st-option-active' : ''}`} onClick={() => handleLanguageChange('ar')}>
              <span>العربية</span>
              {language === 'ar' && (
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                  <polyline points='20 6 9 17 4 12'/>
                </svg>
              )}
            </button>
            <button className='st-modal-cancel' onClick={() => setShowModal(null)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {showModal === 'projectTypes' && (
        <div className='st-modal-overlay' onClick={() => setShowModal(null)}>
          <div className='st-modal' onClick={(e) => e.stopPropagation()}>
            <div className='st-modal-handle' />
            <h3 className='st-modal-title'>{isAr ? 'أنواع المشاريع المفضلة' : 'Preferred Project Types'}</h3>
            <p className='st-modal-sub'>{isAr ? 'اختر المشاريع التي تهمك' : 'Select project types you care about'}</p>
            {projectTypeOptions.map((t) => {
              const active = projectTypes.includes(t)
              return (
                <button key={t} className={`st-option ${active ? 'st-option-active' : ''}`} onClick={() => toggleProjectType(t)}>
                  <span>{t}</span>
                  {active && (
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <polyline points='20 6 9 17 4 12'/>
                    </svg>
                  )}
                </button>
              )
            })}
            <button className='st-modal-save' onClick={() => setShowModal(null)}>
              {isAr ? 'حفظ' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {showModal === 'regions' && (
        <div className='st-modal-overlay' onClick={() => setShowModal(null)}>
          <div className='st-modal' onClick={(e) => e.stopPropagation()}>
            <div className='st-modal-handle' />
            <h3 className='st-modal-title'>{isAr ? 'مناطق التسليم' : 'Delivery Regions'}</h3>
            <p className='st-modal-sub'>{isAr ? 'اختر المناطق التي تخدمها' : 'Select regions you serve'}</p>
            {regionOptions.map((r) => {
              const active = regions.includes(r)
              return (
                <button key={r} className={`st-option ${active ? 'st-option-active' : ''}`} onClick={() => toggleRegion(r)}>
                  <span>{r}</span>
                  {active && (
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <polyline points='20 6 9 17 4 12'/>
                    </svg>
                  )}
                </button>
              )
            })}
            <button className='st-modal-save' onClick={() => setShowModal(null)}>
              {isAr ? 'حفظ' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {showModal === 'budget' && (
        <div className='st-modal-overlay' onClick={() => setShowModal(null)}>
          <div className='st-modal' onClick={(e) => e.stopPropagation()}>
            <div className='st-modal-handle' />
            <h3 className='st-modal-title'>{isAr ? 'نطاق الميزانية' : 'Budget Range'}</h3>
            <p className='st-modal-sub'>{isAr ? 'المشاريع ضمن هذا النطاق فقط' : 'Only show projects in this range'}</p>
            <div className='st-field'>
              <label className='st-field-label'>{isAr ? 'الحد الأدنى (جنيه)' : 'Minimum (EGP)'}</label>
              <input type='number' className='st-input' value={budgetMin} onChange={(e) => setBudgetMin(Number(e.target.value))} />
            </div>
            <div className='st-field'>
              <label className='st-field-label'>{isAr ? 'الحد الأقصى (جنيه)' : 'Maximum (EGP)'}</label>
              <input type='number' className='st-input' value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value))} />
            </div>
            <button className='st-modal-save' onClick={() => setShowModal(null)}>
              {isAr ? 'حفظ' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {showModal === 'currency' && (
        <div className='st-modal-overlay' onClick={() => setShowModal(null)}>
          <div className='st-modal' onClick={(e) => e.stopPropagation()}>
            <div className='st-modal-handle' />
            <h3 className='st-modal-title'>{isAr ? 'العملة' : 'Currency'}</h3>
            {['EGP', 'USD', 'EUR', 'SAR', 'AED'].map((c) => (
              <button key={c} className={`st-option ${currency === c ? 'st-option-active' : ''}`} onClick={() => { setCurrency(c); setShowModal(null) }}>
                <span>{c}</span>
                {currency === c && (
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                    <polyline points='20 6 9 17 4 12'/>
                  </svg>
                )}
              </button>
            ))}
            <button className='st-modal-cancel' onClick={() => setShowModal(null)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {showModal === 'imageQuality' && (
        <div className='st-modal-overlay' onClick={() => setShowModal(null)}>
          <div className='st-modal' onClick={(e) => e.stopPropagation()}>
            <div className='st-modal-handle' />
            <h3 className='st-modal-title'>{isAr ? 'جودة الصورة' : 'Image Quality'}</h3>
            {['High', 'Medium', 'Low'].map((q) => (
              <button key={q} className={`st-option ${imageQuality === q ? 'st-option-active' : ''}`} onClick={() => { setImageQuality(q); setShowModal(null) }}>
                <span>{q}</span>
                {imageQuality === q && (
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                    <polyline points='20 6 9 17 4 12'/>
                  </svg>
                )}
              </button>
            ))}
            <button className='st-modal-cancel' onClick={() => setShowModal(null)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {showModal && !['language', 'projectTypes', 'regions', 'budget', 'currency', 'imageQuality'].includes(showModal) && (
        <div className='st-modal-overlay' onClick={() => setShowModal(null)}>
          <div className='st-modal' onClick={(e) => e.stopPropagation()}>
            <div className='st-modal-handle' />
            <h3 className='st-modal-title'>{isAr ? 'قريباً' : 'Coming Soon'}</h3>
            <p className='st-modal-sub'>{isAr ? 'هذه الميزة قيد التطوير' : 'This feature is under development'}</p>
            <button className='st-modal-save' onClick={() => setShowModal(null)}>
              {isAr ? 'حسناً' : 'OK'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Settings
