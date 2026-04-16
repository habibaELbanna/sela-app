import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import logoword from '../../Assets/logoword.svg'
import logoicon from '../../Assets/logoicon.svg'
import on1 from '../../Assets/on1.svg'
import on2 from '../../Assets/on2.svg'
import on3 from '../../Assets/on3.svg'
import onBg from '../../Assets/onboarding-bg.svg'
import './Onboarding.css'

const fallbackSlides = [
  {
    id: 1,
    image: on1,
    title_en: 'Discover Opportunities',
    title_ar: 'اكتشف الفرص',
    description_en:
      'Swipe through procurement needs and verified vendors. Find what you need in seconds.',
    description_ar:
      'تصفح احتياجات المشتريات والموردين الموثوقين. ابحث عما تحتاجه في ثوانٍ.',
  },
  {
    id: 2,
    image: on2,
    title_en: 'Connect Instantly',
    title_ar: 'تواصل فوراً',
    description_en:
      'Chat with vendors and buyers in real-time. No more endless emails and phone calls.',
    description_ar:
      'تحدث مع الموردين والمشترين في الوقت الفعلي. لا مزيد من رسائل البريد الإلكتروني.',
  },
  {
    id: 3,
    image: on3,
    title_en: 'Grow Your Business',
    title_ar: 'نمّ أعمالك',
    description_en:
      'Win more projects as a vendor. Find the best deals as a buyer. All in one platform.',
    description_ar:
      'اكسب المزيد من المشاريع كمورد. ابحث عن أفضل الصفقات كمشترٍ. كل شيء في منصة واحدة.',
  },
]

const Onboarding = () => {
  const navigate = useNavigate()
  const [slides, setSlides] = useState(fallbackSlides)
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState(localStorage.getItem('sela_lang') || 'en')
  const touchStartX = useRef(null)
  const isAr = lang === 'ar'

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('onboarding_slides')
        .select('*')
        .order('order', { ascending: true })
      if (!error && data && data.length > 0) {
        setSlides(
          data.map((s, i) => ({ ...s, image: fallbackSlides[i]?.image }))
        )
      }
      setLoading(false)
    }
    fetchSlides()
  }, [])

  const toggleLang = () => {
    const newLang = isAr ? 'en' : 'ar'
    localStorage.setItem('sela_lang', newLang)
    setLang(newLang)
  }

  const goNext = () => {
    if (current < slides.length - 1) setCurrent(current + 1)
    else navigate('/login')
  }

  const goPrev = () => {
    if (current > 0) setCurrent(current - 1)
  }

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
  }

  if (loading) {
    return (
      <div className='onboarding-loading'>
        <div className='onboarding-pulse' />
      </div>
    )
  }

  const slide = slides[current]
  const title = isAr ? slide.title_ar : slide.title_en
  const description = isAr ? slide.description_ar : slide.description_en

  return (
    <div
      className='onboarding-container'
      dir={isAr ? 'rtl' : 'ltr'}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <img src={onBg} alt='' className='onboarding-bg' />

      <div className='onboarding-topbar'>
        <span
          className='onboarding-back'
          style={{
            opacity: current === 0 ? 0 : 1,
            pointerEvents: current === 0 ? 'none' : 'auto',
          }}
          onClick={goPrev}
        >
          ←
        </span>

        <div className='onboarding-logo'>
          <img src={logoicon} alt='' className='onboarding-logo-icon' />
          <img src={logoword} alt='SELA' className='onboarding-logo-word' />
        </div>

        <span className='onboarding-lang' onClick={toggleLang}>
          {isAr ? 'EN' : 'AR'}
        </span>
      </div>

      <div className='onboarding-illustration'>
        <img src={slide.image} alt={title} className='onboarding-image' />
      </div>

      <div className='onboarding-bottom'>
        <div className='onboarding-dots'>
          {slides.map((_, i) => (
            <div
              key={i}
              className={`onboarding-dot ${i === current ? 'onboarding-dot-active' : ''}`}
            />
          ))}
        </div>

        <div className='onboarding-content'>
          <h1 className='onboarding-title'>{title}</h1>
          <p className='onboarding-desc'>{description}</p>
        </div>

        <button className='onboarding-btn' onClick={goNext}>
          {current === slides.length - 1
            ? isAr
              ? 'ابدأ الآن'
              : 'GET STARTED'
            : isAr
              ? 'التالي'
              : 'NEXT'}
        </button>
      </div>
    </div>
  )
}

export default Onboarding
