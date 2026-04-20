import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import BottomNav from '../../components/BottomNav/BottomNav'
import Preloader from '../../components/Preloader/Preloader'
import './DiscoverVendors.css'

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001'
const SWIPE_THRESHOLD = 100
const TUTORIAL_KEY = 'sela_discover_vendors_tutorial_v3'
const DEFAULT_LOGO = 'https://randomuser.me/api/portraits/lego/1.jpg'

const DiscoverVendors = () => {
  const navigate = useNavigate()
  const [vendors, setVendors] = useState([])
  const [vendorProfiles, setVendorProfiles] = useState({})
  const [governorates, setGovernorates] = useState({})
  const [categories, setCategories] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [exitDirection, setExitDirection] = useState(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialPhase, setTutorialPhase] = useState('none')
  const startXRef = useRef(null)
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  useEffect(() => {
    const fetchData = async () => {
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .eq('company_type', 'vendor')
        .limit(30)

      const vendorsList = companiesData || []
      const shuffled = vendorsList.slice().sort(() => Math.random() - 0.5)

      const companyIds = shuffled.map((c) => c.id)
      const govIds = [
        ...new Set(shuffled.map((c) => c.governorate_id).filter(Boolean)),
      ]
      const catIds = [
        ...new Set(shuffled.map((c) => c.category_id).filter(Boolean)),
      ]

      let vpMap = {}
      if (companyIds.length > 0) {
        const { data: vpData } = await supabase
          .from('vendor_profiles')
          .select('*')
          .in('company_id', companyIds)
        ;(vpData || []).forEach((vp) => {
          vpMap[vp.company_id] = vp
        })
      }

      let govMap = {}
      if (govIds.length > 0) {
        const { data: govData } = await supabase
          .from('governorates')
          .select('id, name_en, name_ar')
          .in('id', govIds)
        ;(govData || []).forEach((g) => {
          govMap[g.id] = g
        })
      }

      let catMap = {}
      if (catIds.length > 0) {
        const { data: catData } = await supabase
          .from('categories')
          .select('id, name_en, name_ar')
          .in('id', catIds)
        ;(catData || []).forEach((c) => {
          catMap[c.id] = c
        })
      }

      setVendors(shuffled)
      setVendorProfiles(vpMap)
      setGovernorates(govMap)
      setCategories(catMap)
      setLoading(false)

      const tutorialSeen = localStorage.getItem(TUTORIAL_KEY)
      if (!tutorialSeen && shuffled.length > 0) {
        setTimeout(() => setShowTutorial(true), 300)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!showTutorial) return
    setTutorialPhase('center1')
    const t1 = setTimeout(() => setTutorialPhase('right'), 500)
    const t2 = setTimeout(() => setTutorialPhase('center2'), 1600)
    const t3 = setTimeout(() => setTutorialPhase('left'), 2000)
    const t4 = setTimeout(() => setTutorialPhase('center3'), 3100)
    const t5 = setTimeout(() => {
      setShowTutorial(false)
      setTutorialPhase('none')
      localStorage.setItem(TUTORIAL_KEY, 'true')
    }, 3700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [showTutorial])

  const handleTouchStart = (e) => {
    if (showTutorial) return
    const x = e.touches ? e.touches[0].clientX : e.clientX
    startXRef.current = x
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (startXRef.current === null || showTutorial) return
    const x = e.touches ? e.touches[0].clientX : e.clientX
    setDragX(x - startXRef.current)
  }

  const handleTouchEnd = () => {
    if (showTutorial) return
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      handleAction(dragX > 0 ? 'right' : 'left')
    } else {
      setDragX(0)
    }
    startXRef.current = null
    setIsDragging(false)
  }

  const handleAction = async (direction) => {
    const current = vendors[currentIndex]
    if (!current || exitDirection || showTutorial) return

    setExitDirection(direction)

    if (direction === 'right') {
      await supabase.from('saved_items').insert([
        {
          user_id: DEMO_USER_ID,
          entity_type: 'vendor',
          entity_id: current.id,
          folder_label_en: 'Saved Vendors',
          folder_label_ar: 'الموردون المحفوظون',
        },
      ])
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
      setDragX(0)
      setExitDirection(null)
    }, 400)
  }

  const handleContact = () => {
    const current = vendors[currentIndex]
    if (!current || showTutorial) return
    const vName = isAr ? current.name_ar : current.name_en
    const logoUrl = current.logo_url || DEFAULT_LOGO
    navigate(`/messages/new?vendor=${current.id}`, {
      state: {
        vendorCompanyId: current.id,
        vendorCompanyName: vName,
        vendorCompanyNameEn: current.name_en,
        vendorCompanyNameAr: current.name_ar,
        vendorLogoUrl: logoUrl,
        vendorAvatarUrl: logoUrl,
        vendorIsVerified: current.is_verified,
        fromVendor: true,
      },
    })
  }

  const handleRestart = () => {
    const reshuffled = vendors.slice().sort(() => Math.random() - 0.5)
    setVendors(reshuffled)
    setCurrentIndex(0)
    setDragX(0)
    setExitDirection(null)
  }

  const replayTutorial = () => {
    localStorage.removeItem(TUTORIAL_KEY)
    setShowInfo(false)
    setTimeout(() => setShowTutorial(true), 250)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) return <Preloader />

  const current = vendors[currentIndex]
  const next = vendors[currentIndex + 1]
  const noMore = !current

  const rotationDeg = dragX * 0.04
  const intensity = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1)

  const getCardStyle = () => {
    if (exitDirection) return {}
    if (showTutorial) {
      if (tutorialPhase === 'right')
        return {
          transform: 'translateX(100px) rotate(5deg)',
          transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      if (tutorialPhase === 'left')
        return {
          transform: 'translateX(-100px) rotate(-5deg)',
          transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      return {
        transform: 'translateX(0) rotate(0)',
        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }
    }
    if (isDragging)
      return {
        transform: `translateX(${dragX}px) rotate(${rotationDeg}deg)`,
        transition: 'none',
      }
    return { transform: `translateX(${dragX}px) rotate(${rotationDeg}deg)` }
  }

  const renderCard = (vendor, isTop) => {
    if (!vendor) return null
    const vp = vendorProfiles[vendor.id]
    const vendorName = isAr ? vendor.name_ar : vendor.name_en
    const category = isAr
      ? categories[vendor.category_id]?.name_ar
      : categories[vendor.category_id]?.name_en
    const location = isAr
      ? governorates[vendor.governorate_id]?.name_ar
      : governorates[vendor.governorate_id]?.name_en
    const description = isAr ? vendor.description_ar : vendor.description_en
    const rating = vp?.avg_rating ?? 4.9
    const reviews = vp?.total_reviews ?? 312
    const projects = vp?.completed_projects ?? 156
    const responseHrs = vp?.avg_response_hours ?? 2
    const onTime = vp?.on_time_delivery_percent ?? 98
    const foundedYear = vp?.founded_year ?? 2012
    const employees = vp?.employees_count ?? 85
    const priceRange = vp?.price_range ?? '$$'
    const minOrder = vp?.min_order_egp ?? 5000
    const yearsActive = new Date().getFullYear() - foundedYear

    const specialties = [
      isAr ? 'البنية التحتية للشبكات' : 'Network Infrastructure',
      isAr ? 'الحلول السحابية' : 'Cloud Solutions',
      isAr ? 'الأمن السيبراني' : 'Cybersecurity',
    ]

    const certifications = [
      isAr ? 'شريك رسمي' : 'Microsoft Partner',
      isAr ? 'معتمد SOC 2' : 'SOC 2 Certified',
      isAr ? 'ISO 27001' : 'ISO 27001',
    ]

    const tutorialRight = isTop && showTutorial && tutorialPhase === 'right'
    const tutorialLeft = isTop && showTutorial && tutorialPhase === 'left'
    const draggingRight = isTop && !showTutorial && dragX > 20
    const draggingLeft = isTop && !showTutorial && dragX < -20

    const showRightState = tutorialRight || draggingRight
    const showLeftState = tutorialLeft || draggingLeft

    const edgeIntensity = tutorialRight || tutorialLeft ? 1 : intensity

    const cardClasses = [
      'dv-card',
      isTop && exitDirection === 'right' ? 'dv-card-exit-right' : '',
      isTop && exitDirection === 'left' ? 'dv-card-exit-left' : '',
      !isTop ? 'dv-card-behind' : '',
      showRightState ? 'dv-card-state-save' : '',
      showLeftState ? 'dv-card-state-skip' : '',
    ]
      .filter(Boolean)
      .join(' ')

    const cardStyle = isTop ? getCardStyle() : undefined
    if (isTop && (showRightState || showLeftState)) {
      cardStyle['--edge-alpha'] = edgeIntensity
    }

    return (
      <div
        key={vendor.id}
        className={cardClasses}
        style={cardStyle}
        onTouchStart={isTop ? handleTouchStart : undefined}
        onTouchMove={isTop ? handleTouchMove : undefined}
        onTouchEnd={isTop ? handleTouchEnd : undefined}
        onMouseDown={isTop ? handleTouchStart : undefined}
        onMouseMove={isTop && isDragging ? handleTouchMove : undefined}
        onMouseUp={isTop ? handleTouchEnd : undefined}
        onMouseLeave={isTop && isDragging ? handleTouchEnd : undefined}
      >
        {showRightState && (
          <div className='dv-edge-hint dv-edge-hint-save'>
            <svg
              width='28'
              height='28'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#10B981'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' />
            </svg>
          </div>
        )}
        {showLeftState && (
          <div className='dv-edge-hint dv-edge-hint-skip'>
            <svg
              width='28'
              height='28'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#EF4444'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </div>
        )}

        <div className='dv-scroll-inner'>
          <div className='dv-logo-wrap'>
            {vendor.logo_url ? (
              <img src={vendor.logo_url} alt='' className='dv-logo' />
            ) : (
              <div className='dv-logo-placeholder'>
                {getInitials(vendorName)}
              </div>
            )}
          </div>

          <div className='dv-company-row'>
            <span className='dv-company-name'>{vendorName}</span>
            {vendor.is_verified && (
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
            )}
          </div>

          <div className='dv-rating-row'>
            {[0, 1, 2, 3, 4].map((i) => (
              <svg
                key={i}
                width='13'
                height='13'
                viewBox='0 0 24 24'
                fill={i < Math.floor(rating) ? '#FFA500' : 'none'}
                stroke='#FFA500'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
              </svg>
            ))}
            <span className='dv-rating-num'>{rating}</span>
          </div>
          <span className='dv-reviews'>
            ({reviews} {isAr ? 'تقييم' : 'reviews'})
          </span>

          {category && <span className='dv-category'>{category}</span>}

          {location && (
            <div className='dv-location-row'>
              <svg
                width='13'
                height='13'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#b0b0b0'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
                <circle cx='12' cy='10' r='3' />
              </svg>
              <span className='dv-location-text'>{location}</span>
            </div>
          )}

          <div className='dv-stats-row'>
            <div className='dv-stat-item'>
              <span className='dv-stat-value'>{projects}</span>
              <span className='dv-stat-label'>
                {isAr ? 'مشاريع' : 'Projects'}
              </span>
            </div>
            <div className='dv-stat-item'>
              <span className='dv-stat-value'>
                {responseHrs}
                {isAr ? 'س' : 'hrs'}
              </span>
              <span className='dv-stat-label'>
                {isAr ? 'استجابة' : 'Response'}
              </span>
            </div>
            <div className='dv-stat-item'>
              <span className='dv-stat-value'>{onTime}%</span>
              <span className='dv-stat-label'>
                {isAr ? 'في الوقت' : 'On-time'}
              </span>
            </div>
          </div>

          {description && <p className='dv-desc'>{description}</p>}

          <div className='dv-meta-row'>
            <div className='dv-meta-item'>
              <svg
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#b0b0b0'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect x='3' y='4' width='18' height='18' rx='0' />
                <line x1='16' y1='2' x2='16' y2='6' />
                <line x1='8' y1='2' x2='8' y2='6' />
                <line x1='3' y1='10' x2='21' y2='10' />
              </svg>
              <span>
                {yearsActive}+ {isAr ? 'سنوات' : 'years'}
              </span>
            </div>
            <div className='dv-meta-item'>
              <svg
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#b0b0b0'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
                <circle cx='9' cy='7' r='4' />
                <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
                <path d='M16 3.13a4 4 0 0 1 0 7.75' />
              </svg>
              <span>
                {employees} {isAr ? 'موظف' : 'employees'}
              </span>
            </div>
          </div>

          <div className='dv-tag-list'>
            {specialties.map((s, i) => (
              <span key={i} className='dv-specialty-tag'>
                {s}
              </span>
            ))}
          </div>

          <div className='dv-tag-list'>
            {certifications.map((c, i) => (
              <span key={i} className='dv-cert-tag'>
                {c}
              </span>
            ))}
          </div>

          <div className='dv-pricing-row'>
            <div className='dv-pricing-item'>
              <span className='dv-pricing-label'>
                {isAr ? 'نطاق السعر' : 'Price Range'}
              </span>
              <span className='dv-pricing-value'>{priceRange}</span>
            </div>
            <div className='dv-pricing-divider' />
            <div className='dv-pricing-item'>
              <span className='dv-pricing-label'>
                {isAr ? 'أقل طلب' : 'Min Order'}
              </span>
              <span className='dv-pricing-value'>
                EGP{' '}
                {minOrder >= 1000
                  ? `${(minOrder / 1000).toFixed(0)}K`
                  : minOrder}
              </span>
            </div>
          </div>

          <button
            className='dv-view-portfolio'
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/vendor/${vendor.id}`)
            }}
          >
            <span>{isAr ? 'عرض الملف الكامل' : 'View Full Profile'}</span>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <line x1='5' y1='12' x2='19' y2='12' />
              <polyline points='12 5 19 12 12 19' />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className='dv-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='dv-bg'>
        <div className='dv-bg-1' />
        <div className='dv-bg-2' />
      </div>

      <div className='dv-topbar'>
        <button className='dv-icon-btn' onClick={() => navigate('/search')}>
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
            <polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' />
          </svg>
        </button>
        <h1 className='dv-topbar-title'>{isAr ? 'اكتشف' : 'Discover'}</h1>
        <button className='dv-icon-btn' onClick={() => setShowInfo(true)}>
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
            <circle cx='12' cy='12' r='10' />
            <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
            <line x1='12' y1='17' x2='12.01' y2='17' />
          </svg>
        </button>
      </div>

      <div className='dv-banner'>
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#00a7e5'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
        </svg>
        <span className='dv-banner-text'>
          {isAr
            ? 'اكتشف موردين جدد خارج شبكتك'
            : 'Discover new vendors outside your network'}
        </span>
      </div>

      <div className='dv-stage'>
        {noMore ? (
          <div className='dv-empty'>
            <div className='dv-empty-icon'>
              <svg
                width='48'
                height='48'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#00a7e5'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle cx='12' cy='12' r='10' />
                <path d='M8 14s1.5 2 4 2 4-2 4-2' />
                <line x1='9' y1='9' x2='9.01' y2='9' />
                <line x1='15' y1='9' x2='15.01' y2='9' />
              </svg>
            </div>
            <h2 className='dv-empty-title'>
              {isAr ? 'رأيت كل شيء!' : "You've seen it all!"}
            </h2>
            <p className='dv-empty-sub'>
              {isAr
                ? 'تحقق من الموردين المحفوظين أو ابدأ من جديد'
                : 'Check your saved vendors or start over'}
            </p>
            <div className='dv-empty-actions'>
              <button
                className='dv-empty-btn dv-empty-primary'
                onClick={handleRestart}
              >
                {isAr ? 'ابدأ من جديد' : 'Start Over'}
              </button>
              <button
                className='dv-empty-btn dv-empty-secondary'
                onClick={() => navigate('/profile')}
              >
                {isAr ? 'عرض المحفوظات' : 'View Saved'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {next && renderCard(next, false)}
            {renderCard(current, true)}
          </>
        )}
      </div>

      {!noMore && (
        <div className='dv-actions-bar'>
          <button
            className='dv-action-btn dv-action-skip'
            onClick={() => handleAction('left')}
            aria-label='Skip'
          >
            <svg
              width='22'
              height='22'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#EF4444'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </button>
          <button
            className='dv-action-btn dv-action-contact'
            onClick={handleContact}
            aria-label='Contact'
          >
            <svg
              width='22'
              height='22'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#ffffff'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
            </svg>
          </button>
          <button
            className='dv-action-btn dv-action-save'
            onClick={() => handleAction('right')}
            aria-label='Save'
          >
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
              <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' />
            </svg>
          </button>
        </div>
      )}

      <BottomNav userType='buyer' />

      {showInfo && (
        <div className='dv-info-overlay' onClick={() => setShowInfo(false)}>
          <div className='dv-info-sheet' onClick={(e) => e.stopPropagation()}>
            <div className='dv-info-handle' />
            <h2 className='dv-info-title'>
              {isAr ? 'كيفية الاستخدام' : 'How Discover Works'}
            </h2>
            <div className='dv-info-items'>
              <div className='dv-info-item-row'>
                <div className='dv-info-icon-wrap dv-info-icon-right'>
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
                    <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' />
                  </svg>
                </div>
                <div className='dv-info-text'>
                  <span className='dv-info-head'>
                    {isAr ? 'اسحب يميناً للحفظ' : 'Swipe Right to Save'}
                  </span>
                  <span className='dv-info-desc'>
                    {isAr
                      ? 'سيظهر في الموردين المحفوظين'
                      : 'Added to your Saved Vendors'}
                  </span>
                </div>
              </div>
              <div className='dv-info-item-row'>
                <div className='dv-info-icon-wrap dv-info-icon-center'>
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
                </div>
                <div className='dv-info-text'>
                  <span className='dv-info-head'>
                    {isAr ? 'اضغط للتواصل' : 'Tap to Contact'}
                  </span>
                  <span className='dv-info-desc'>
                    {isAr
                      ? 'ابدأ محادثة مع المورد'
                      : 'Start a conversation with the vendor'}
                  </span>
                </div>
              </div>
              <div className='dv-info-item-row'>
                <div className='dv-info-icon-wrap dv-info-icon-left'>
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#EF4444'
                    strokeWidth='2.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <line x1='18' y1='6' x2='6' y2='18' />
                    <line x1='6' y1='6' x2='18' y2='18' />
                  </svg>
                </div>
                <div className='dv-info-text'>
                  <span className='dv-info-head'>
                    {isAr ? 'اسحب يساراً للتخطي' : 'Swipe Left to Skip'}
                  </span>
                  <span className='dv-info-desc'>
                    {isAr ? 'لن يظهر مرة أخرى' : "You won't see it again"}
                  </span>
                </div>
              </div>
            </div>
            <button className='dv-info-replay' onClick={replayTutorial}>
              {isAr ? 'إعادة عرض التعليمات' : 'Replay Tutorial'}
            </button>
            <button
              className='dv-info-close'
              onClick={() => setShowInfo(false)}
            >
              {isAr ? 'فهمت' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiscoverVendors
