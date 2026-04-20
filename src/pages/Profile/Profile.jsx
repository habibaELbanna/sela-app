import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import BottomNav from '../../components/BottomNav/BottomNav'
import Preloader from '../../components/Preloader/Preloader'
import { getAvatar, DEFAULT_AVATAR } from '../../Avatars'
import ProfileChart from '../../components/ProfileChart/ProfileChart'
import './Profile.css'

const VENDOR_DEMO_ID = 'a0000000-0000-0000-0000-000000000002'
const BUYER_DEMO_ID = 'a0000000-0000-0000-0000-000000000001'

const Profile = () => {
  const navigate = useNavigate()
  const storedRole = localStorage.getItem('sela_user_type') || 'vendor'
  const isBuyer = storedRole === 'buyer'
  const DEMO_USER_ID = isBuyer ? BUYER_DEMO_ID : VENDOR_DEMO_ID

  const [activeTab, setActiveTab] = useState('overview')
  const [activityFilter, setActivityFilter] = useState('all')
  const [savedFilter, setSavedFilter] = useState('all')
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [vendorProfile, setVendorProfile] = useState(null)
  const [savedItems, setSavedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', DEMO_USER_ID)
          .maybeSingle()
        setUser(userData)

        if (userData?.company_id) {
          const { data: companyData } = await supabase
            .from('companies')
            .select(
              '*, governorates(name_en, name_ar), categories(name_en, name_ar)'
            )
            .eq('id', userData.company_id)
            .maybeSingle()
          setCompany(companyData)

          if (!isBuyer) {
            const { data: vpData } = await supabase
              .from('vendor_profiles')
              .select('*')
              .eq('company_id', userData.company_id)
              .maybeSingle()
            setVendorProfile(vpData)
          }
        }

        const savedType = isBuyer ? 'vendor' : 'need'
        const { data: savedRows } = await supabase
          .from('saved_items')
          .select('*')
          .eq('user_id', DEMO_USER_ID)
          .eq('entity_type', savedType)
          .order('created_at', { ascending: false })

        if (savedRows && savedRows.length > 0) {
          const ids = savedRows.map((s) => s.entity_id)
          if (isBuyer) {
            const { data: vendorsData } = await supabase
              .from('companies')
              .select('id, name_en, name_ar, logo_url, is_verified')
              .in('id', ids)
            const vendorMap = {}
            ;(vendorsData || []).forEach((v) => {
              vendorMap[v.id] = v
            })
            setSavedItems(
              savedRows
                .map((s) => ({ ...s, vendor: vendorMap[s.entity_id] || null }))
                .filter((s) => s.vendor !== null)
            )
          } else {
            const { data: needsData } = await supabase
              .from('needs')
              .select('*')
              .in('id', ids)
            const companyIds = [
              ...new Set(
                (needsData || []).map((n) => n.buyer_company_id).filter(Boolean)
              ),
            ]
            let companiesData = []
            if (companyIds.length > 0) {
              const { data: cData } = await supabase
                .from('companies')
                .select('id, name_en, name_ar, logo_url')
                .in('id', companyIds)
              companiesData = cData || []
            }
            const companiesMap = {}
            companiesData.forEach((c) => {
              companiesMap[c.id] = c
            })
            const needsMap = {}
            ;(needsData || []).forEach((n) => {
              needsMap[n.id] = {
                ...n,
                companies: companiesMap[n.buyer_company_id] || null,
              }
            })
            setSavedItems(
              savedRows
                .map((s) => ({ ...s, needs: needsMap[s.entity_id] || null }))
                .filter((s) => s.needs !== null)
            )
          }
        }
      } catch (err) {
        console.log('Profile fetch fallback:', err?.message)
      }
      setLoading(false)
    }
    fetchAll()
  }, [isBuyer, DEMO_USER_ID])

  const fallbackVendorActivities = [
    {
      id: 1,
      type: 'accepted',
      title_en: 'Proposal accepted for Office Renovation',
      title_ar: 'تم قبول العرض لتجديد المكتب',
      sub_en: 'By NileTech Solutions',
      sub_ar: 'من NileTech Solutions',
      time_en: '2 hours ago',
      time_ar: 'منذ ساعتين',
    },
    {
      id: 2,
      type: 'submitted',
      title_en: 'Submitted proposal to Marketing Campaign',
      title_ar: 'تم تقديم عرض لحملة تسويقية',
      sub_en: 'To El-Fanar Suppliers',
      sub_ar: 'إلى El-Fanar Suppliers',
      time_en: '1 day ago',
      time_ar: 'منذ يوم',
    },
    {
      id: 3,
      type: 'review',
      title_en: 'Received 5-star review from Delta Engineering',
      title_ar: 'تلقيت تقييم 5 نجوم من Delta Engineering',
      sub_en: 'For IT Services project',
      sub_ar: 'لمشروع خدمات تقنية المعلومات',
      time_en: '2 days ago',
      time_ar: 'منذ يومين',
    },
    {
      id: 4,
      type: 'payment',
      title_en: 'Payment received: EGP 4,500',
      title_ar: 'تم استلام الدفعة: 4,500 جنيه',
      sub_en: 'Project completed',
      sub_ar: 'اكتمل المشروع',
      time_en: '3 days ago',
      time_ar: 'منذ 3 أيام',
    },
    {
      id: 5,
      type: 'message',
      title_en: 'New message from Misr Textiles',
      title_ar: 'رسالة جديدة من Misr Textiles',
      sub_en: 'About Catering proposal',
      sub_ar: 'بخصوص عرض تقديم الطعام',
      time_en: '5 days ago',
      time_ar: 'منذ 5 أيام',
    },
  ]

  const fallbackBuyerActivities = [
    {
      id: 1,
      type: 'submitted',
      title_en: 'New proposal received for Office Furniture',
      title_ar: 'عرض جديد لأثاث المكاتب',
      sub_en: 'From BuildRight Construction',
      sub_ar: 'من BuildRight Construction',
      time_en: '2 hours ago',
      time_ar: 'منذ ساعتين',
    },
    {
      id: 2,
      type: 'accepted',
      title_en: 'Accepted proposal from NileTech',
      title_ar: 'تم قبول عرض من NileTech',
      sub_en: 'For IT Infrastructure project',
      sub_ar: 'لمشروع البنية التحتية',
      time_en: '1 day ago',
      time_ar: 'منذ يوم',
    },
    {
      id: 3,
      type: 'message',
      title_en: 'New message from Pyramid Foods',
      title_ar: 'رسالة جديدة من Pyramid Foods',
      sub_en: 'About Conference Catering',
      sub_ar: 'بخصوص تقديم المؤتمر',
      time_en: '2 days ago',
      time_ar: 'منذ يومين',
    },
    {
      id: 4,
      type: 'submitted',
      title_en: 'Posted new need: Warehouse Renovation',
      title_ar: 'نشر طلب جديد: تجديد مستودع',
      sub_en: '5 proposals received so far',
      sub_ar: 'تم استلام 5 عروض حتى الآن',
      time_en: '4 days ago',
      time_ar: 'منذ 4 أيام',
    },
    {
      id: 5,
      type: 'review',
      title_en: 'Rated Delta Engineering 5 stars',
      title_ar: 'قيمت Delta Engineering بـ 5 نجوم',
      sub_en: 'For completed Office Fit-out',
      sub_ar: 'لتجهيز المكاتب المكتمل',
      time_en: '1 week ago',
      time_ar: 'منذ أسبوع',
    },
  ]

  const displayActivities = isBuyer
    ? fallbackBuyerActivities
    : fallbackVendorActivities

  const handleRemoveSaved = async (savedId) => {
    await supabase.from('saved_items').delete().eq('id', savedId)
    setSavedItems((prev) => prev.filter((s) => s.id !== savedId))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('sela_user_type')
    navigate('/login')
  }

  const getDaysAgo = (date) => {
    const diff = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24)
    if (diff < 1) return isAr ? 'اليوم' : 'today'
    if (diff < 2) return isAr ? 'منذ يوم' : '1 day ago'
    if (diff < 7)
      return isAr
        ? `منذ ${Math.floor(diff)} أيام`
        : `${Math.floor(diff)} days ago`
    if (diff < 14) return isAr ? 'منذ أسبوع' : '1 week ago'
    if (diff < 30)
      return isAr
        ? `منذ ${Math.floor(diff / 7)} أسابيع`
        : `${Math.floor(diff / 7)} weeks ago`
    return isAr
      ? `منذ ${Math.floor(diff / 30)} شهر`
      : `${Math.floor(diff / 30)} months ago`
  }

  if (loading) return <Preloader />

  const fullName =
    user?.full_name || (isBuyer ? 'Sara Ibrahim' : 'Ahmed Hassan')
  const position =
    user?.job_title ||
    user?.position ||
    (isBuyer
      ? isAr
        ? 'مدير المشتريات'
        : 'Procurement Manager'
      : isAr
        ? 'مدير مشروع أول'
        : 'Senior Project Manager')
  const companyName =
    (isAr ? company?.name_ar : company?.name_en) ||
    (isBuyer ? 'NileTech Solutions' : 'BuildRight Construction')
  const companyLocation =
    (isAr ? company?.governorates?.name_ar : company?.governorates?.name_en) ||
    (isAr ? 'القاهرة, مصر' : 'Cairo, Egypt')
  const companyIndustry =
    (isAr ? company?.categories?.name_ar : company?.categories?.name_en) ||
    (isBuyer
      ? isAr
        ? 'تقنية المعلومات'
        : 'IT & Technology'
      : isAr
        ? 'البناء'
        : 'Construction & Building')
  const email =
    user?.email || (isBuyer ? 'sara@niletech.com' : 'ahmed@buildright.com')
  const phone = user?.phone || '+20 2 1234 5678'
  const avatarSrc =
    user?.avatar_url || getAvatar(fullName, isBuyer ? 'female' : 'male')
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
        month: 'short',
        year: 'numeric',
      })
    : isAr
      ? 'يناير 2024'
      : 'Jan 2024'

  const vendorStats = {
    activeProposals: vendorProfile?.active_proposals_count ?? 24,
    winRate: vendorProfile?.win_rate_percentage ?? 68,
    revenueMtd: vendorProfile?.revenue_mtd_egp ?? 45000,
    avgRating: vendorProfile?.avg_rating ?? 4.8,
  }
  const buyerStatsData = {
    needsPosted: 12,
    proposalsReceived: 47,
    activeProjects: 3,
    totalSpent: 285000,
  }

  const filteredActivities = () => {
    if (activityFilter === 'all') return displayActivities
    if (activityFilter === 'week') return displayActivities.slice(0, 3)
    return displayActivities
  }

  const filteredSaved = () =>
    savedFilter === 'recent' ? [...savedItems].slice(0, 3) : savedItems

  const renderActivityIcon = (type) => {
    if (type === 'accepted')
      return (
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#10B981'
          strokeWidth='2.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <polyline points='20 6 9 17 4 12' />
        </svg>
      )
    if (type === 'submitted')
      return (
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#00a7e5'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
          <polyline points='14 2 14 8 20 8' />
        </svg>
      )
    if (type === 'review')
      return (
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='#FFA500'
          stroke='#FFA500'
          strokeWidth='1'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
        </svg>
      )
    if (type === 'payment')
      return (
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#10B981'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <line x1='12' y1='1' x2='12' y2='23' />
          <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
        </svg>
      )
    if (type === 'message')
      return (
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#00a7e5'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
        </svg>
      )
    return null
  }

  return (
    <div
      className='pf-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='pf-bg'>
        <div className='pf-bg-1' />
        <div className='pf-bg-2' />
      </div>

      <div className='pf-scroll'>
        <div className='pf-topbar'>
          <h1 className='pf-topbar-title'>
            {isAr ? 'الملف الشخصي' : 'Profile'}
          </h1>
          <div className='pf-topbar-actions'>
            <button
              className='pf-icon-btn'
              aria-label='Notifications'
              onClick={() => navigate('/profile/notifications')}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
                <path d='M13.73 21a2 2 0 0 1-3.46 0' />
              </svg>
            </button>
            <button
              className='pf-icon-btn'
              aria-label='Edit Profile'
              onClick={() => navigate('/profile/edit')}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
              </svg>
            </button>
            <button
              className='pf-icon-btn'
              aria-label='Settings'
              onClick={() => navigate('/profile/settings')}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle cx='12' cy='12' r='3' />
                <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' />
              </svg>
            </button>
          </div>
        </div>

        <div className='pf-user-card'>
          <div className='pf-avatar-wrap'>
            <img
              src={avatarSrc}
              alt={fullName}
              className='pf-avatar'
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR
              }}
            />
            <button
              className='pf-avatar-edit'
              aria-label='Change avatar'
              onClick={() => navigate('/profile/edit')}
            >
              <svg
                width='10'
                height='10'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#ffffff'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
              </svg>
            </button>
          </div>
          <div className='pf-user-info'>
            <div className='pf-name-row'>
              <span className='pf-name'>{fullName}</span>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
                <circle cx='12' cy='12' r='10' fill='#00a7e5' />
                <path
                  d='M8 12l3 3 5-6'
                  stroke='#ffffff'
                  strokeWidth='2.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  fill='none'
                />
              </svg>
            </div>
            <span className='pf-vendor-tag'>
              {isBuyer ? (isAr ? 'مشتري' : 'Buyer') : isAr ? 'مورد' : 'Vendor'}
            </span>
            <span className='pf-position'>{position}</span>
            <span className='pf-company'>{companyName}</span>
            <span className='pf-joined'>
              {isAr ? 'انضم' : 'Joined'} {joinedDate}
            </span>
          </div>
        </div>

        <button
          className='pf-edit-btn'
          onClick={() => navigate('/profile/edit')}
        >
          {isAr ? 'تعديل الملف الشخصي' : 'Edit Profile'}
        </button>

        <div className='pf-tabs'>
          <button
            className={`pf-tab ${activeTab === 'overview' ? 'pf-tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {isAr ? 'نظرة عامة' : 'Overview'}
          </button>
          <button
            className={`pf-tab ${activeTab === 'activity' ? 'pf-tab-active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            {isAr ? 'النشاط' : 'Activity'}
          </button>
          <button
            className={`pf-tab ${activeTab === 'saved' ? 'pf-tab-active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            {isAr ? 'المحفوظة' : 'Saved'}
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className='pf-tab-content'>
            <ProfileChart isBuyer={isBuyer} isAr={isAr} />

            <h2 className='pf-section-title'>
              {isAr ? 'إحصائياتك' : 'Your Stats'}
            </h2>
            <div className='pf-stats-grid'>
              {isBuyer ? (
                <>
                  <div
                    className='pf-stat-card'
                    onClick={() => navigate('/my-needs')}
                  >
                    <div className='pf-stat-icon'>
                      <svg
                        width='22'
                        height='22'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#00a7e5'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                        <polyline points='14 2 14 8 20 8' />
                      </svg>
                    </div>
                    <span className='pf-stat-value'>
                      {buyerStatsData.needsPosted}
                    </span>
                    <span className='pf-stat-label'>
                      {isAr ? 'طلبات منشورة' : 'Needs Posted'}
                    </span>
                  </div>
                  <div className='pf-stat-card'>
                    <div className='pf-stat-icon'>
                      <svg
                        width='22'
                        height='22'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#00a7e5'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
                      </svg>
                    </div>
                    <span className='pf-stat-value'>
                      {buyerStatsData.proposalsReceived}
                    </span>
                    <span className='pf-stat-label'>
                      {isAr ? 'عروض مستلمة' : 'Proposals Received'}
                    </span>
                  </div>
                  <div className='pf-stat-card'>
                    <div className='pf-stat-icon'>
                      <svg
                        width='22'
                        height='22'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#10B981'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M9 11l3 3L22 4' />
                        <path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' />
                      </svg>
                    </div>
                    <span className='pf-stat-value'>
                      {buyerStatsData.activeProjects}
                    </span>
                    <span className='pf-stat-label'>
                      {isAr ? 'مشاريع نشطة' : 'Active Projects'}
                    </span>
                  </div>
                  <div className='pf-stat-card'>
                    <div className='pf-stat-icon'>
                      <svg
                        width='22'
                        height='22'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#FFA500'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <line x1='12' y1='1' x2='12' y2='23' />
                        <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                      </svg>
                    </div>
                    <span className='pf-stat-value'>
                      {buyerStatsData.totalSpent >= 1000
                        ? `EGP ${(buyerStatsData.totalSpent / 1000).toFixed(0)}K`
                        : `EGP ${buyerStatsData.totalSpent}`}
                    </span>
                    <span className='pf-stat-label'>
                      {isAr ? 'إجمالي المنفق' : 'Total Spent'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className='pf-stat-card'
                    onClick={() => navigate('/my-proposals')}
                  >
                    <div className='pf-stat-icon'>
                      <svg
                        width='22'
                        height='22'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#00a7e5'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <line x1='18' y1='20' x2='18' y2='10' />
                        <line x1='12' y1='20' x2='12' y2='4' />
                        <line x1='6' y1='20' x2='6' y2='14' />
                      </svg>
                    </div>
                    <span className='pf-stat-value'>
                      {vendorStats.activeProposals}
                    </span>
                    <span className='pf-stat-label'>
                      {isAr ? 'عروض نشطة' : 'Active Proposals'}
                    </span>
                  </div>
                  <div className='pf-stat-card'>
                    <div className='pf-stat-icon'>
                      <svg
                        width='22'
                        height='22'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#FFA500'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6' />
                        <path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18' />
                        <path d='M4 22h16' />
                        <path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' />
                        <path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' />
                        <path d='M18 2H6v7a6 6 0 0 0 12 0V2Z' />
                      </svg>
                    </div>
                    <span className='pf-stat-value'>
                      {vendorStats.winRate}%
                    </span>
                    <span className='pf-stat-label'>
                      {isAr ? 'معدل الفوز' : 'Win Rate'}
                    </span>
                  </div>
                  <div className='pf-stat-card'>
                    <div className='pf-stat-icon'>
                      <svg
                        width='22'
                        height='22'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#10B981'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <line x1='12' y1='1' x2='12' y2='23' />
                        <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                      </svg>
                    </div>
                    <span className='pf-stat-value'>
                      {vendorStats.revenueMtd >= 1000
                        ? `EGP ${(vendorStats.revenueMtd / 1000).toFixed(0)}K`
                        : `EGP ${vendorStats.revenueMtd}`}
                    </span>
                    <span className='pf-stat-label'>
                      {isAr ? 'الإيرادات (الشهر)' : 'Revenue (MTD)'}
                    </span>
                  </div>
                  <div className='pf-stat-card'>
                    <div className='pf-stat-icon'>
                      <svg
                        width='22'
                        height='22'
                        viewBox='0 0 24 24'
                        fill='#FFA500'
                        stroke='#FFA500'
                        strokeWidth='1'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                      </svg>
                    </div>
                    <span className='pf-stat-value'>
                      {vendorStats.avgRating}
                    </span>
                    <span className='pf-stat-label'>
                      {isAr ? 'متوسط التقييم' : 'Avg Rating'}
                    </span>
                  </div>
                </>
              )}
            </div>

            <h2 className='pf-section-title'>
              {isAr ? 'إجراءات سريعة' : 'Quick Actions'}
            </h2>
            <div className='pf-actions-grid'>
              <button
                className='pf-action-card'
                onClick={() =>
                  navigate(isBuyer ? '/browse-vendors' : '/browse-needs')
                }
              >
                <div className='pf-action-icon'>
                  <svg
                    width='22'
                    height='22'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#00a7e5'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <circle cx='11' cy='11' r='8' />
                    <path d='m21 21-4.35-4.35' />
                  </svg>
                </div>
                <span className='pf-action-label'>
                  {isBuyer
                    ? isAr
                      ? 'تصفح الموردين'
                      : 'Browse Vendors'
                    : isAr
                      ? 'تصفح الطلبات'
                      : 'Browse Needs'}
                </span>
              </button>
              <button
                className='pf-action-card'
                onClick={() =>
                  navigate(isBuyer ? '/my-needs' : '/my-proposals')
                }
              >
                <div className='pf-action-icon'>
                  <svg
                    width='22'
                    height='22'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#00a7e5'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                    <polyline points='14 2 14 8 20 8' />
                  </svg>
                </div>
                <span className='pf-action-label'>
                  {isBuyer
                    ? isAr
                      ? 'طلباتي'
                      : 'My Needs'
                    : isAr
                      ? 'عروضي'
                      : 'My Proposals'}
                </span>
              </button>
              <button
                className='pf-action-card'
                onClick={() =>
                  navigate(isBuyer ? '/discover-vendors' : '/discover-needs')
                }
              >
                <div className='pf-action-icon'>
                  <svg
                    width='22'
                    height='22'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#00a7e5'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
                  </svg>
                </div>
                <span className='pf-action-label'>
                  {isAr ? 'اكتشف' : 'Discover'}
                </span>
              </button>
              <button
                className='pf-action-card'
                onClick={() => navigate('/messages')}
              >
                <div className='pf-action-icon'>
                  <svg
                    width='22'
                    height='22'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#00a7e5'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
                  </svg>
                </div>
                <span className='pf-action-label'>
                  {isAr ? 'الرسائل' : 'Messages'}
                </span>
              </button>
            </div>

            <h2 className='pf-section-title'>
              {isAr ? 'معلومات الحساب' : 'Account Information'}
            </h2>
            <div className='pf-info-list'>
              <div
                className='pf-info-row'
                onClick={() => navigate('/profile/edit')}
              >
                <div className='pf-info-icon-wrap'>
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#00a7e5'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
                    <polyline points='22,6 12,13 2,6' />
                  </svg>
                </div>
                <div className='pf-info-text'>
                  <span className='pf-info-label'>
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
                  </span>
                  <span className='pf-info-value'>{email}</span>
                </div>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#6b7280'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='9 18 15 12 9 6' />
                </svg>
              </div>
              <div
                className='pf-info-row'
                onClick={() => navigate('/profile/edit')}
              >
                <div className='pf-info-icon-wrap'>
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#00a7e5'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' />
                  </svg>
                </div>
                <div className='pf-info-text'>
                  <span className='pf-info-label'>
                    {isAr ? 'الهاتف' : 'Phone'}
                  </span>
                  <span className='pf-info-value'>{phone}</span>
                </div>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#6b7280'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='9 18 15 12 9 6' />
                </svg>
              </div>
              <div
                className='pf-info-row'
                onClick={() => navigate('/profile/edit')}
              >
                <div className='pf-info-icon-wrap'>
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#EF4444'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
                    <circle cx='12' cy='10' r='3' />
                  </svg>
                </div>
                <div className='pf-info-text'>
                  <span className='pf-info-label'>
                    {isAr ? 'الموقع' : 'Location'}
                  </span>
                  <span className='pf-info-value'>{companyLocation}</span>
                </div>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#6b7280'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='9 18 15 12 9 6' />
                </svg>
              </div>
              <div
                className='pf-info-row'
                onClick={() => navigate('/profile/edit')}
              >
                <div className='pf-info-icon-wrap'>
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#00a7e5'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M3 21h18' />
                    <path d='M5 21V7l8-4v18' />
                    <path d='M19 21V11l-6-4' />
                  </svg>
                </div>
                <div className='pf-info-text'>
                  <span className='pf-info-label'>
                    {isAr ? 'الشركة' : 'Company'}
                  </span>
                  <span className='pf-info-value'>{companyName}</span>
                </div>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#6b7280'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='9 18 15 12 9 6' />
                </svg>
              </div>
              <div
                className='pf-info-row'
                onClick={() => navigate('/profile/edit')}
              >
                <div className='pf-info-icon-wrap'>
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#00a7e5'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <rect x='2' y='7' width='20' height='14' rx='0' />
                    <path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' />
                  </svg>
                </div>
                <div className='pf-info-text'>
                  <span className='pf-info-label'>
                    {isAr ? 'الصناعة' : 'Industry'}
                  </span>
                  <span className='pf-info-value'>{companyIndustry}</span>
                </div>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#6b7280'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='9 18 15 12 9 6' />
                </svg>
              </div>
            </div>

            <h2 className='pf-section-title'>
              {isAr ? 'التحقق' : 'Verification'}
            </h2>
            <div className='pf-verify-box'>
              <div className='pf-verify-row'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                  <circle cx='12' cy='12' r='10' fill='#10B981' />
                  <path
                    d='M8 12l3 3 5-6'
                    stroke='#ffffff'
                    strokeWidth='2.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    fill='none'
                  />
                </svg>
                <span className='pf-verify-text'>
                  {isAr ? 'البريد الإلكتروني موثق' : 'Email verified'}
                </span>
              </div>
              <div className='pf-verify-row'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                  <circle cx='12' cy='12' r='10' fill='#10B981' />
                  <path
                    d='M8 12l3 3 5-6'
                    stroke='#ffffff'
                    strokeWidth='2.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    fill='none'
                  />
                </svg>
                <span className='pf-verify-text'>
                  {isAr ? 'الهاتف موثق' : 'Phone verified'}
                </span>
              </div>
              <div className='pf-verify-row'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                  <circle cx='12' cy='12' r='10' fill='#10B981' />
                  <path
                    d='M8 12l3 3 5-6'
                    stroke='#ffffff'
                    strokeWidth='2.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    fill='none'
                  />
                </svg>
                <span className='pf-verify-text'>
                  {isAr ? 'الشركة موثقة' : 'Business verified'}
                </span>
              </div>
              <div className='pf-verify-row pf-verify-pending'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                  <circle cx='12' cy='12' r='10' fill='#FFA500' />
                  <line
                    x1='12'
                    y1='8'
                    x2='12'
                    y2='13'
                    stroke='#ffffff'
                    strokeWidth='2.2'
                    strokeLinecap='round'
                  />
                  <circle cx='12' cy='16.5' r='1.1' fill='#ffffff' />
                </svg>
                <span className='pf-verify-text'>
                  {isAr ? 'الرقم الضريبي قيد المراجعة' : 'Tax ID pending'}
                </span>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#6b7280'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='9 18 15 12 9 6' />
                </svg>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className='pf-tab-content'>
            <h2 className='pf-section-title'>
              {isAr ? 'النشاط الأخير' : 'Recent Activity'}
            </h2>
            <div className='pf-chips'>
              <button
                className={`pf-chip ${activityFilter === 'all' ? 'pf-chip-active' : ''}`}
                onClick={() => setActivityFilter('all')}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                className={`pf-chip ${activityFilter === 'week' ? 'pf-chip-active' : ''}`}
                onClick={() => setActivityFilter('week')}
              >
                {isAr ? 'هذا الأسبوع' : 'This Week'}
              </button>
              <button
                className={`pf-chip ${activityFilter === 'month' ? 'pf-chip-active' : ''}`}
                onClick={() => setActivityFilter('month')}
              >
                {isAr ? 'هذا الشهر' : 'This Month'}
              </button>
            </div>
            <div className='pf-activity-list'>
              {filteredActivities().map((a) => (
                <div key={a.id} className='pf-activity-row'>
                  <div className='pf-activity-icon'>
                    {renderActivityIcon(a.type)}
                  </div>
                  <div className='pf-activity-text'>
                    <span className='pf-activity-title'>
                      {isAr ? a.title_ar : a.title_en}
                    </span>
                    <span className='pf-activity-sub'>
                      {isAr ? a.sub_ar : a.sub_en}
                    </span>
                    <span className='pf-activity-time'>
                      {isAr ? a.time_ar : a.time_en}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className='pf-load-more'>
              {isAr ? 'تحميل المزيد' : 'Load More'}
            </button>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className='pf-tab-content'>
            <h2 className='pf-section-title'>
              {isAr ? 'العناصر المحفوظة' : 'Saved Items'} (
              {filteredSaved().length})
            </h2>
            <div className='pf-chips'>
              <button
                className={`pf-chip ${savedFilter === 'all' ? 'pf-chip-active' : ''}`}
                onClick={() => setSavedFilter('all')}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                className={`pf-chip ${savedFilter === 'recent' ? 'pf-chip-active' : ''}`}
                onClick={() => setSavedFilter('recent')}
              >
                {isAr ? 'الأحدث' : 'Recent'}
              </button>
            </div>
            {filteredSaved().length === 0 && (
              <p
                style={{
                  color: '#6b7280',
                  textAlign: 'center',
                  marginTop: 40,
                  fontSize: 13,
                }}
              >
                {isBuyer
                  ? isAr
                    ? 'لا توجد موردين محفوظين'
                    : 'No saved vendors yet'
                  : isAr
                    ? 'لا توجد طلبات محفوظة'
                    : 'No saved needs yet'}
              </p>
            )}
            <div className='pf-saved-list'>
              {isBuyer
                ? filteredSaved().map((item) => {
                    const v = item.vendor
                    if (!v) return null
                    return (
                      <div key={item.id} className='pf-saved-card'>
                        <h3 className='pf-saved-title'>
                          {isAr ? v.name_ar : v.name_en}
                        </h3>
                        {v.is_verified && (
                          <span className='pf-saved-match'>
                            {isAr ? 'موثق' : 'Verified'}
                          </span>
                        )}
                        <span className='pf-saved-time'>
                          {isAr ? 'محفوظ' : 'Saved'}{' '}
                          {getDaysAgo(item.created_at)}
                        </span>
                        <div className='pf-saved-actions'>
                          <button
                            className='pf-saved-btn pf-saved-view'
                            onClick={() => navigate(`/vendor/${v.id}`)}
                          >
                            {isAr ? 'عرض الملف' : 'View Profile'}
                          </button>
                          <button
                            className='pf-saved-btn pf-saved-remove'
                            onClick={() => handleRemoveSaved(item.id)}
                          >
                            {isAr ? 'إزالة' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    )
                  })
                : filteredSaved().map((item) => {
                    const n = item.needs
                    if (!n) return null
                    const matchPct = 85 + (item.id % 15)
                    return (
                      <div key={item.id} className='pf-saved-card'>
                        <span className='pf-saved-match'>
                          {matchPct}% {isAr ? 'تطابق' : 'MATCH'}
                        </span>
                        <h3 className='pf-saved-title'>
                          {isAr ? n.title_ar : n.title_en}
                        </h3>
                        <span className='pf-saved-company'>
                          {isAr ? n.companies?.name_ar : n.companies?.name_en}
                        </span>
                        <span className='pf-saved-budget'>
                          {isAr ? 'الميزانية: ' : 'Budget: '}
                          {n.budget_min && n.budget_max_egp
                            ? `EGP ${(n.budget_min / 1000).toFixed(0)}K - ${(n.budget_max_egp / 1000).toFixed(0)}K`
                            : 'TBD'}
                        </span>
                        <span className='pf-saved-time'>
                          {isAr ? 'محفوظ' : 'Saved'}{' '}
                          {getDaysAgo(item.created_at)}
                        </span>
                        <div className='pf-saved-actions'>
                          <button
                            className='pf-saved-btn pf-saved-view'
                            onClick={() => navigate(`/need/${n.id}`)}
                          >
                            {isAr ? 'عرض التفاصيل' : 'View Details'}
                          </button>
                          <button
                            className='pf-saved-btn pf-saved-remove'
                            onClick={() => handleRemoveSaved(item.id)}
                          >
                            {isAr ? 'إزالة' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
            </div>
          </div>
        )}

        <h2 className='pf-section-title'>{isAr ? 'نشاطي' : 'My Activity'}</h2>
        <div className='pf-account-actions'>
          <button
            className='pf-account-row'
            onClick={() => navigate(isBuyer ? '/my-needs' : '/my-proposals')}
          >
            <div className='pf-account-icon'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#00a7e5'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                <polyline points='14 2 14 8 20 8' />
              </svg>
            </div>
            <span className='pf-account-label'>
              {isBuyer
                ? isAr
                  ? 'طلباتي'
                  : 'My Needs'
                : isAr
                  ? 'عروضي'
                  : 'My Proposals'}
            </span>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#6b7280'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='9 18 15 12 9 6' />
            </svg>
          </button>
          <button
            className='pf-account-row'
            onClick={() => setActiveTab('saved')}
          >
            <div className='pf-account-icon'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#00a7e5'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' />
              </svg>
            </div>
            <span className='pf-account-label'>
              {isBuyer
                ? isAr
                  ? 'الموردون المحفوظون'
                  : 'Saved Vendors'
                : isAr
                  ? 'العناصر المحفوظة'
                  : 'Saved Items'}
            </span>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#6b7280'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='9 18 15 12 9 6' />
            </svg>
          </button>
          <button
            className='pf-account-row'
            onClick={() => navigate('/profile/notifications')}
          >
            <div className='pf-account-icon'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#00a7e5'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
                <path d='M13.73 21a2 2 0 0 1-3.46 0' />
              </svg>
            </div>
            <span className='pf-account-label'>
              {isAr ? 'الإشعارات' : 'Notifications'}
            </span>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#6b7280'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='9 18 15 12 9 6' />
            </svg>
          </button>
          <button
            className='pf-account-row'
            onClick={() => navigate('/search')}
          >
            <div className='pf-account-icon'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#00a7e5'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle cx='11' cy='11' r='8' />
                <path d='m21 21-4.35-4.35' />
              </svg>
            </div>
            <span className='pf-account-label'>
              {isAr ? 'البحث والتصفية' : 'Search & Filter'}
            </span>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#6b7280'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='9 18 15 12 9 6' />
            </svg>
          </button>
        </div>

        <h2 className='pf-section-title'>{isAr ? 'الحساب' : 'Account'}</h2>
        <div className='pf-account-actions'>
          <button
            className='pf-account-row'
            onClick={() => navigate('/profile/settings')}
          >
            <div className='pf-account-icon'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#00a7e5'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle cx='12' cy='12' r='3' />
                <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' />
              </svg>
            </div>
            <span className='pf-account-label'>
              {isAr ? 'الإعدادات' : 'Settings'}
            </span>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#6b7280'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='9 18 15 12 9 6' />
            </svg>
          </button>
          <button className='pf-account-row' onClick={handleLogout}>
            <div className='pf-account-icon'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#b0b0b0'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                <polyline points='16 17 21 12 16 7' />
                <line x1='21' y1='12' x2='9' y2='12' />
              </svg>
            </div>
            <span className='pf-account-label'>
              {isAr ? 'تسجيل الخروج' : 'Logout'}
            </span>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#6b7280'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='9 18 15 12 9 6' />
            </svg>
          </button>
        </div>

        <div style={{ height: '90px' }} />
      </div>

      <BottomNav />
    </div>
  )
}

export default Profile
