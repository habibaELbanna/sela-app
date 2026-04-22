import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import BottomNav from '../../components/BottomNav/BottomNav'
import Preloader from '../../components/Preloader/Preloader'
import './DiscoverNeeds.css'

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000002'
const SWIPE_THRESHOLD = 100
const TUTORIAL_KEY = 'sela_discover_tutorial_v3'

const DiscoverNeeds = () => {
  const navigate = useNavigate()
  const [needs, setNeeds] = useState([])
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
      const { data: needsData } = await supabase
        .from('needs')
        .select(
          `*, companies(name_en, name_ar, logo_url, is_verified), categories(name_en, name_ar), governorates(name_en, name_ar)`
        )
        .eq('status', 'open')
        .limit(30)

      const shuffled = (needsData || []).slice().sort(() => Math.random() - 0.5)
      setNeeds(shuffled)
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
    const current = needs[currentIndex]
    if (!current || exitDirection || showTutorial) return

    setExitDirection(direction)

    if (direction === 'right') {
      await supabase.from('saved_items').insert([
        {
          user_id: DEMO_USER_ID,
          entity_type: 'need',
          entity_id: current.id,
          folder_label_en: 'Saved Needs',
          folder_label_ar: 'الطلبات المحفوظة',
        },
      ])
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
      setDragX(0)
      setExitDirection(null)
    }, 400)
  }

  const handleRestart = () => {
    const reshuffled = needs.slice().sort(() => Math.random() - 0.5)
    setNeeds(reshuffled)
    setCurrentIndex(0)
    setDragX(0)
    setExitDirection(null)
  }

  const replayTutorial = () => {
    localStorage.removeItem(TUTORIAL_KEY)
    setShowInfo(false)
    setTimeout(() => setShowTutorial(true), 250)
  }

  const getDaysLeft = (deadline) => {
    if (!deadline) return null
    const days = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
    )
    return days > 0 ? days : 0
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

  const current = needs[currentIndex]
  const next = needs[currentIndex + 1]
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

  const renderCard = (need, isTop) => {
    if (!need) return null
    const companyName = isAr ? need.companies?.name_ar : need.companies?.name_en
    const category = isAr ? need.categories?.name_ar : need.categories?.name_en
    const location = isAr
      ? need.governorates?.name_ar
      : need.governorates?.name_en
    const daysLeft = getDaysLeft(need.deadline)
    const title = isAr ? need.title_ar : need.title_en
    const description = isAr ? need.description_ar : need.description_en

    const featureTags = [
      isAr ? 'توصيل سريع' : 'Fast Delivery',
      isAr ? 'ضمان' : 'Warranty',
      isAr ? 'تركيب' : 'Installation',
    ]

    const tutorialRight = isTop && showTutorial && tutorialPhase === 'right'
    const tutorialLeft = isTop && showTutorial && tutorialPhase === 'left'
    const draggingRight = isTop && !showTutorial && dragX > 20
    const draggingLeft = isTop && !showTutorial && dragX < -20

    const showRightState = tutorialRight || draggingRight
    const showLeftState = tutorialLeft || draggingLeft

    const edgeIntensity = tutorialRight || tutorialLeft ? 1 : intensity

    const cardClasses = [
      'dc-card',
      isTop && exitDirection === 'right' ? 'dc-card-exit-right' : '',
      isTop && exitDirection === 'left' ? 'dc-card-exit-left' : '',
      !isTop ? 'dc-card-behind' : '',
      showRightState ? 'dc-card-state-save' : '',
      showLeftState ? 'dc-card-state-skip' : '',
    ]
      .filter(Boolean)
      .join(' ')

    const cardStyle = isTop ? getCardStyle() : undefined
    if (isTop && (showRightState || showLeftState)) {
      cardStyle['--edge-alpha'] = edgeIntensity
    }

    return (
      <div
        key={need.id}
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
          <div className='dc-edge-hint dc-edge-hint-save'>
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
          <div className='dc-edge-hint dc-edge-hint-skip'>
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

        <div className='dc-logo-wrap'>
          {need.companies?.logo_url ? (
            <img src={need.companies.logo_url} alt='' className='dc-logo' />
          ) : (
            <div className='dc-logo-placeholder'>
              {getInitials(companyName)}
            </div>
          )}
        </div>

        <div className='dc-company-row'>
          <span className='dc-company-name'>{companyName}</span>
          {need.companies?.is_verified && (
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
              <circle cx='12' cy='12' r='10' fill='#00a7e5' />
              <path
                d='M8 12l3 3 5-6'
                stroke='#cccccc'
                strokeWidth='2.2'
                strokeLinecap='round'
                strokeLinejoin='round'
                fill='none'
              />
            </svg>
          )}
        </div>

        <div className='dc-rating-row'>
          <svg
            width='13'
            height='13'
            viewBox='0 0 24 24'
            fill='#FFA500'
            stroke='#FFA500'
            strokeWidth='1'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
          </svg>
          <span className='dc-rating-text'>
            4.8 (156 {isAr ? 'تقييم' : 'reviews'})
          </span>
        </div>

        {category && <span className='dc-category'>{category}</span>}

        <h2 className='dc-title'>{title}</h2>

        <span className='dc-budget'>
          {need.budget_min && need.budget_max_egp
            ? `EGP ${Number(need.budget_min).toLocaleString()} - ${Number(need.budget_max_egp).toLocaleString()}`
            : isAr
              ? 'ميزانية مفتوحة'
              : 'Budget TBD'}
        </span>

        <div className='dc-info-row'>
          <div className='dc-info-item'>
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
              <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
              <circle cx='12' cy='10' r='3' />
            </svg>
            <span>{location || 'Egypt'}</span>
          </div>
          <div className='dc-info-item'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#FFA500'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='12' cy='12' r='10' />
              <polyline points='12 6 12 12 16 14' />
            </svg>
            <span>
              {daysLeft !== null
                ? `${daysLeft} ${isAr ? 'يوم' : 'days left'}`
                : 'TBD'}
            </span>
          </div>
          <div className='dc-info-item'>
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
              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
              <polyline points='14 2 14 8 20 8' />
            </svg>
            <span>
              {need.proposals_count || 0} {isAr ? 'عرض' : 'proposals'}
            </span>
          </div>
        </div>

        <p className='dc-desc'>{description}</p>

        <div className='dc-tags-row'>
          {featureTags.map((tag, i) => (
            <span key={i} className='dc-feature-tag'>
              {tag}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className='dc-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='dc-bg'>
        <div className='dc-bg-1' />
        <div className='dc-bg-2' />
      </div>

      <div className='dc-topbar'>
        <button className='dc-icon-btn' onClick={() => navigate('/search')}>
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
        <h1 className='dc-topbar-title'>{isAr ? 'اكتشف' : 'Discover'}</h1>
        <button className='dc-icon-btn' onClick={() => setShowInfo(true)}>
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

      <div className='dc-banner'>
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
        <span className='dc-banner-text'>
          {isAr
            ? 'اكتشف فرصاً جديدة خارج مجالك'
            : 'Discover random opportunities outside your field'}
        </span>
      </div>

      <div className='dc-stage'>
        {noMore ? (
          <div className='dc-empty'>
            <div className='dc-empty-icon'>
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
            <h2 className='dc-empty-title'>
              {isAr ? 'رأيت كل شيء!' : "You've seen it all!"}
            </h2>
            <p className='dc-empty-sub'>
              {isAr
                ? 'تحقق من العناصر المحفوظة أو ابدأ من جديد'
                : 'Check your saved items or start over'}
            </p>
            <div className='dc-empty-actions'>
              <button
                className='dc-empty-btn dc-empty-primary'
                onClick={handleRestart}
              >
                {isAr ? 'ابدأ من جديد' : 'Start Over'}
              </button>
              <button
                className='dc-empty-btn dc-empty-secondary'
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
        <div className='dc-actions-bar'>
          <button
            className='dc-action-btn dc-action-skip'
            onClick={() => handleAction('left')}
            aria-label='Skip'
          >
            <svg
              width='24'
              height='24'
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
            className='dc-action-btn dc-action-save'
            onClick={() => handleAction('right')}
            aria-label='Save'
          >
            <svg
              width='24'
              height='24'
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

      <BottomNav userType='vendor' />

      {showInfo && (
        <div className='dc-info-overlay' onClick={() => setShowInfo(false)}>
          <div className='dc-info-sheet' onClick={(e) => e.stopPropagation()}>
            <div className='dc-info-handle' />
            <h2 className='dc-info-title'>
              {isAr ? 'كيفية الاستخدام' : 'How Discover Works'}
            </h2>
            <div className='dc-info-items'>
              <div className='dc-info-item-row'>
                <div className='dc-info-icon-wrap dc-info-icon-right'>
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
                <div className='dc-info-text'>
                  <span className='dc-info-head'>
                    {isAr ? 'اسحب يميناً للحفظ' : 'Swipe Right to Save'}
                  </span>
                  <span className='dc-info-desc'>
                    {isAr
                      ? 'سيظهر في العناصر المحفوظة'
                      : 'Added to your Saved items'}
                  </span>
                </div>
              </div>
              <div className='dc-info-item-row'>
                <div className='dc-info-icon-wrap dc-info-icon-left'>
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
                <div className='dc-info-text'>
                  <span className='dc-info-head'>
                    {isAr ? 'اسحب يساراً للتخطي' : 'Swipe Left to Skip'}
                  </span>
                  <span className='dc-info-desc'>
                    {isAr ? 'لن يظهر مرة أخرى' : "You won't see it again"}
                  </span>
                </div>
              </div>
              <div className='dc-info-item-row'>
                <div className='dc-info-icon-wrap dc-info-icon-neutral'>
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
                    <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />
                  </svg>
                </div>
                <div className='dc-info-text'>
                  <span className='dc-info-head'>
                    {isAr ? 'فرص عشوائية' : 'Random Opportunities'}
                  </span>
                  <span className='dc-info-desc'>
                    {isAr
                      ? 'اكتشف طلبات خارج مجالك'
                      : 'Explore needs outside your field'}
                  </span>
                </div>
              </div>
            </div>
            <button className='dc-info-replay' onClick={replayTutorial}>
              {isAr ? 'إعادة عرض التعليمات' : 'Replay Tutorial'}
            </button>
            <button
              className='dc-info-close'
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

export default DiscoverNeeds
