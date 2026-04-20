import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabase'
import Preloader from '../../components/Preloader/Preloader'
import './VendorProfile.css'

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001'
const DEFAULT_LOGO = 'https://randomuser.me/api/portraits/men/32.jpg'

const VendorProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [vendorProfile, setVendorProfile] = useState(null)
  const [governorate, setGovernorate] = useState(null)
  const [category, setCategory] = useState(null)
  const [matchScore, setMatchScore] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saveAnim, setSaveAnim] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  const [reviewFilter, setReviewFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  useEffect(() => {
    const fetchData = async () => {
      const { data: vendorData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (!vendorData) {
        setLoading(false)
        return
      }
      setVendor(vendorData)

      const { data: vpData } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('company_id', id)
        .single()
      if (vpData) setVendorProfile(vpData)

      if (vendorData.governorate_id) {
        const { data: govData } = await supabase
          .from('governorates')
          .select('name_en, name_ar')
          .eq('id', vendorData.governorate_id)
          .single()
        if (govData) setGovernorate(govData)
      }

      if (vendorData.category_id) {
        const { data: catData } = await supabase
          .from('categories')
          .select('name_en, name_ar')
          .eq('id', vendorData.category_id)
          .single()
        if (catData) setCategory(catData)
      }

      const { data: scoreData } = await supabase
        .from('match_scores')
        .select('score_percentage')
        .eq('vendor_company_id', id)
        .order('score_percentage', { ascending: false })
        .limit(1)
      if (scoreData && scoreData.length > 0)
        setMatchScore(scoreData[0].score_percentage)

      const { data: savedCheck } = await supabase
        .from('saved_items')
        .select('id')
        .eq('user_id', DEMO_USER_ID)
        .eq('entity_type', 'vendor')
        .eq('entity_id', parseInt(id))
        .maybeSingle()
      if (savedCheck) setSaved(true)

      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleSave = async () => {
    const newSaved = !saved
    setSaved(newSaved)
    setSaveAnim(true)
    setTimeout(() => setSaveAnim(false), 400)

    if (newSaved) {
      await supabase.from('saved_items').insert([
        {
          user_id: DEMO_USER_ID,
          entity_type: 'vendor',
          entity_id: parseInt(id),
          folder_label_en: 'Saved Vendors',
          folder_label_ar: 'الموردون المحفوظون',
        },
      ])
    } else {
      await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', DEMO_USER_ID)
        .eq('entity_type', 'vendor')
        .eq('entity_id', parseInt(id))
    }
  }

  const handleContact = () => {
    if (!vendor) return
    const vName = isAr ? vendor.name_ar : vendor.name_en
    const logoUrl = vendor.logo_url || DEFAULT_LOGO
    navigate(`/messages/new?vendor=${vendor.id}`, {
      state: {
        vendorCompanyId: vendor.id,
        vendorCompanyName: vName,
        vendorCompanyNameEn: vendor.name_en,
        vendorCompanyNameAr: vendor.name_ar,
        vendorLogoUrl: logoUrl,
        vendorAvatarUrl: logoUrl,
        vendorIsVerified: vendor.is_verified,
        fromVendor: true,
      },
    })
  }

  if (loading) return <Preloader />
  if (!vendor)
    return (
      <div style={{ color: '#b0b0b0', padding: 40, textAlign: 'center' }}>
        <p>{isAr ? 'لم يتم العثور على المورد' : 'Vendor not found'}</p>
      </div>
    )

  const vendorName = isAr ? vendor.name_ar : vendor.name_en
  const categoryName = isAr ? category?.name_ar : category?.name_en
  const location = isAr ? governorate?.name_ar : governorate?.name_en
  const description = isAr ? vendor.description_ar : vendor.description_en
  const rating = vendorProfile?.avg_rating ?? 4.8
  const reviews = vendorProfile?.total_reviews ?? 245
  const projects = vendorProfile?.completed_projects ?? 89
  const responseHrs = vendorProfile?.avg_response_hours ?? 4
  const onTime = vendorProfile?.on_time_delivery_percent ?? 95
  const winRate = vendorProfile?.win_rate_percentage ?? 72
  const foundedYear = vendorProfile?.founded_year ?? 2016
  const employees = vendorProfile?.employees_count ?? 35
  const yearsInBusiness = new Date().getFullYear() - foundedYear
  const avatarSrc = vendor.logo_url || DEFAULT_LOGO

  const aboutText =
    description ||
    (isAr
      ? 'شركة رائدة في مجال البناء والتجديد في القاهرة مع أكثر من 8 سنوات من الخبرة. نحن متخصصون في المشاريع التجارية وتجديد المكاتب والبناء السكني.'
      : 'BuildRight Construction is a leading construction and renovation company in Cairo with over 8 years of experience. We specialize in commercial projects, office renovations, and residential construction. Our team of 25+ certified professionals is committed to delivering high-quality work on time and within budget.')

  const services = [
    isAr ? 'البناء التجاري' : 'Commercial Construction',
    isAr ? 'تجديد المكاتب' : 'Office Renovation & Fit-out',
    isAr ? 'البناء السكني' : 'Residential Building',
    isAr ? 'التصميم الداخلي' : 'Interior Design',
    isAr ? 'إدارة المشاريع' : 'Project Management',
    isAr ? 'خدمات الصيانة' : 'Maintenance Services',
  ]

  const certifications = [
    {
      title_en: 'Licensed Contractor',
      title_ar: 'مقاول مرخص',
      issuer_en: 'Egyptian Contractors Syndicate',
      issuer_ar: 'نقابة المقاولين المصرية',
      valid_en: 'Valid until: Dec 2026',
      valid_ar: 'ساري حتى: ديسمبر 2026',
    },
    {
      title_en: 'ISO 9001 Certified',
      title_ar: 'معتمد ISO 9001',
      issuer_en: 'Quality Management',
      issuer_ar: 'إدارة الجودة',
      valid_en: 'Valid until: 2027',
      valid_ar: 'ساري حتى: 2027',
    },
    {
      title_en: 'Safety Certified',
      title_ar: 'معتمد السلامة',
      issuer_en: 'OSHA Standards',
      issuer_ar: 'معايير OSHA',
      valid_en: 'Valid until: Valid',
      valid_ar: 'ساري',
    },
  ]

  const portfolioItems = [
    {
      title_en: 'TechHub Office',
      title_ar: 'مكتب TechHub',
      cat_en: 'Commercial',
      cat_ar: 'تجاري',
      completed_en: 'March 2026',
      completed_ar: 'مارس 2026',
      budget: 45000,
      image:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    },
    {
      title_en: 'Luxury Villa Construct',
      title_ar: 'فيلا فاخرة',
      cat_en: 'Residential',
      cat_ar: 'سكني',
      completed_en: 'February 2026',
      completed_ar: 'فبراير 2026',
      budget: 120000,
      image:
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop',
    },
    {
      title_en: 'Restaurant Fit-out',
      title_ar: 'تجهيز مطعم',
      cat_en: 'Commercial',
      cat_ar: 'تجاري',
      completed_en: 'January 2026',
      completed_ar: 'يناير 2026',
      budget: 65000,
      image:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    },
    {
      title_en: 'Office Complex',
      title_ar: 'مجمع مكاتب',
      cat_en: 'Commercial',
      cat_ar: 'تجاري',
      completed_en: 'December 2025',
      completed_ar: 'ديسمبر 2025',
      budget: 95000,
      image:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    },
  ]

  const reviewsList = [
    {
      name: 'Ahmed Hassan',
      company: 'TechCorp',
      rating: 5,
      text_en:
        'Excellent work! BuildRight completed our office renovation on time and within budget. The team was professional, and the quality exceeded our expectations.',
      text_ar:
        'عمل ممتاز! أنجزت BuildRight تجديد مكتبنا في الوقت المحدد وضمن الميزانية.',
      project_en: 'Office Renovation',
      project_ar: 'تجديد مكتب',
      time_en: '2 weeks ago',
      time_ar: 'منذ أسبوعين',
      likes: 12,
    },
    {
      name: 'Sarah Mohamed',
      company: 'Green Energy Solutions',
      rating: 5,
      text_en:
        'Outstanding service from start to finish. Very responsive and professional.',
      text_ar: 'خدمة متميزة من البداية للنهاية. سريع الاستجابة ومحترف.',
      project_en: 'Warehouse Construction',
      project_ar: 'بناء مستودع',
      time_en: '1 month ago',
      time_ar: 'منذ شهر',
      likes: 8,
    },
    {
      name: 'Mohamed Ali',
      company: 'Prime Hospitality',
      rating: 4,
      text_en:
        'Good quality work. Minor delays but they communicated well and delivered a solid final product.',
      text_ar: 'عمل بجودة جيدة. تأخيرات بسيطة لكن تواصلوا جيداً.',
      project_en: 'Restaurant Renovation',
      project_ar: 'تجديد مطعم',
      time_en: '2 months ago',
      time_ar: 'منذ شهرين',
      likes: 5,
    },
  ]

  const ratingBreakdown = [
    { stars: 5, count: 180, percent: 73 },
    { stars: 4, count: 45, percent: 18 },
    { stars: 3, count: 15, percent: 6 },
    { stars: 2, count: 3, percent: 1 },
    { stars: 1, count: 2, percent: 1 },
  ]

  const shareOptions = [
    {
      label: isAr ? 'نسخ الرابط' : 'Copy Link',
      icon: (
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
          <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
          <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
        </svg>
      ),
    },
    {
      label: isAr ? 'واتساب' : 'WhatsApp',
      icon: (
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
          <path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' />
        </svg>
      ),
    },
    {
      label: isAr ? 'بريد' : 'Email',
      icon: (
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
          <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
          <polyline points='22,6 12,13 2,6' />
        </svg>
      ),
    },
  ]

  const renderStars = (n, size = 14) => (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox='0 0 24 24'
          fill={i < Math.floor(n) ? '#FFA500' : 'none'}
          stroke='#FFA500'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
        </svg>
      ))}
    </div>
  )

  return (
    <div
      className='vp-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='vp-bg'>
        <div className='vp-bg-1' />
        <div className='vp-bg-2' />
      </div>

      <div className='vp-topbar'>
        <button className='vp-back' onClick={() => navigate(-1)}>
          <svg
            width='22'
            height='22'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M19 12H5' />
            <polyline points='12 19 5 12 12 5' />
          </svg>
        </button>
        <span className='vp-topbar-title'>
          {isAr ? 'ملف المورد' : 'Vendor Profile'}
        </span>
        <div className='vp-topbar-actions'>
          <button className='vp-icon-btn' onClick={() => setShowShare(true)}>
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
              <circle cx='18' cy='5' r='3' />
              <circle cx='6' cy='12' r='3' />
              <circle cx='18' cy='19' r='3' />
              <line x1='8.59' y1='13.51' x2='15.42' y2='17.49' />
              <line x1='15.41' y1='6.51' x2='8.59' y2='10.49' />
            </svg>
          </button>
          <button
            className={`vp-icon-btn ${saveAnim ? 'vp-save-anim' : ''}`}
            onClick={handleSave}
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill={saved ? '#00a7e5' : 'none'}
              stroke={saved ? '#00a7e5' : 'currentColor'}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' />
            </svg>
          </button>
        </div>
      </div>

      <div className='vp-scroll'>
        <div className='vp-company-row'>
          <img
            src={avatarSrc}
            alt=''
            className='vp-company-logo'
            onError={(e) => {
              e.target.src = DEFAULT_LOGO
            }}
          />
          <div className='vp-company-info'>
            <div className='vp-company-name-row'>
              <span className='vp-company-name'>{vendorName}</span>
              {vendor.is_verified && (
                <svg width='15' height='15' viewBox='0 0 24 24' fill='none'>
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
            {categoryName && (
              <span className='vp-company-category'>{categoryName}</span>
            )}
            <div className='vp-company-sub-row'>
              {renderStars(rating, 12)}
              <span className='vp-rating-text'>
                {rating} ({reviews} {isAr ? 'تقييم' : 'reviews'})
              </span>
            </div>
            {location && (
              <div className='vp-company-sub-row'>
                <svg
                  width='12'
                  height='12'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#6b7280'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
                  <circle cx='12' cy='10' r='3' />
                </svg>
                <span className='vp-company-location'>
                  {location}, {isAr ? 'مصر' : 'Egypt'}
                </span>
              </div>
            )}
            {matchScore && (
              <div className='vp-match-badge'>
                <svg width='10' height='10' viewBox='0 0 24 24' fill='#00a7e5'>
                  <path d='M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' />
                </svg>
                <span>
                  {matchScore}% {isAr ? 'تطابق' : 'Match'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className='vp-divider' />

        <div className='vp-info-grid'>
          <div className='vp-info-card'>
            <div className='vp-info-icon-wrap'>
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
                <line x1='18' y1='20' x2='18' y2='10' />
                <line x1='12' y1='20' x2='12' y2='4' />
                <line x1='6' y1='20' x2='6' y2='14' />
              </svg>
            </div>
            <span className='vp-info-label'>
              {isAr ? 'المشاريع' : 'Projects'}
            </span>
            <span className='vp-info-value'>{projects}</span>
            <span className='vp-info-sub'>{isAr ? 'مكتملة' : 'Completed'}</span>
          </div>

          <div className='vp-info-card'>
            <div className='vp-info-icon-wrap'>
              <svg
                width='18'
                height='18'
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
            </div>
            <span className='vp-info-label'>
              {isAr ? 'الاستجابة' : 'Response'}
            </span>
            <span className='vp-info-value'>
              {responseHrs} {isAr ? 'س' : 'hrs'}
            </span>
            <span className='vp-info-sub'>{isAr ? 'متوسط' : 'Average'}</span>
          </div>

          <div className='vp-info-card'>
            <div className='vp-info-icon-wrap'>
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
            </div>
            <span className='vp-info-label'>
              {isAr ? 'في الوقت' : 'On-time'}
            </span>
            <span className='vp-info-value'>{onTime}%</span>
            <span className='vp-info-sub'>{isAr ? 'التسليم' : 'Delivery'}</span>
          </div>

          <div className='vp-info-card'>
            <div className='vp-info-icon-wrap'>
              <svg
                width='18'
                height='18'
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
            <span className='vp-info-label'>
              {isAr ? 'معدل الفوز' : 'Win Rate'}
            </span>
            <span className='vp-info-value'>{winRate}%</span>
            <span className='vp-info-sub'>{isAr ? 'للعروض' : 'Proposals'}</span>
          </div>
        </div>

        <div className='vp-tabs'>
          {['about', 'portfolio', 'reviews', 'contact'].map((t) => (
            <button
              key={t}
              className={`vp-tab ${activeTab === t ? 'vp-tab-active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t === 'about'
                ? isAr
                  ? 'نبذة'
                  : 'About'
                : t === 'portfolio'
                  ? isAr
                    ? 'الأعمال'
                    : 'Portfolio'
                  : t === 'reviews'
                    ? isAr
                      ? 'التقييمات'
                      : 'Reviews'
                    : isAr
                      ? 'التواصل'
                      : 'Contact'}
            </button>
          ))}
        </div>

        {activeTab === 'about' && (
          <>
            <div className='vp-section'>
              <h2 className='vp-section-title'>{isAr ? 'عنّا' : 'About Us'}</h2>
              <p className='vp-desc'>{aboutText}</p>
            </div>

            <div className='vp-section'>
              <h2 className='vp-section-title'>
                {isAr ? 'الخدمات التي نقدمها' : 'Services We Offer'}
              </h2>
              {services.map((s, i) => (
                <div key={i} className='vp-requirement'>
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
                  <span>{s}</span>
                </div>
              ))}
            </div>

            <div className='vp-section'>
              <h2 className='vp-section-title'>
                {isAr ? 'الشهادات' : 'Certifications'}
              </h2>
              <div className='vp-specs'>
                {certifications.map((c, i) => (
                  <div key={i} className='vp-spec-row'>
                    <span className='vp-spec-label'>
                      {isAr ? c.title_ar : c.title_en}
                    </span>
                    <span className='vp-spec-value'>
                      {isAr ? c.valid_ar : c.valid_en}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='vp-section'>
              <h2 className='vp-section-title'>
                {isAr ? 'فريقنا' : 'Our Team'}
              </h2>
              <div className='vp-specs'>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'حجم الفريق:' : 'Team size:'}
                  </span>
                  <span className='vp-spec-value'>
                    {employees}-{employees + 15} {isAr ? 'موظف' : 'employees'}
                  </span>
                </div>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'سنوات النشاط:' : 'Years in business:'}
                  </span>
                  <span className='vp-spec-value'>
                    {yearsInBusiness}+ {isAr ? 'سنوات' : 'years'}
                  </span>
                </div>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'المشاريع النشطة:' : 'Active projects:'}
                  </span>
                  <span className='vp-spec-value'>
                    5 {isAr ? 'جاري' : 'ongoing'}
                  </span>
                </div>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'السعة:' : 'Capacity:'}
                  </span>
                  <span className='vp-spec-value'>
                    {isAr ? '3-5 مشاريع/شهر' : '3-5 new projects/month'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'portfolio' && (
          <div className='vp-section'>
            <h2 className='vp-section-title'>
              {isAr
                ? `المشاريع الأخيرة (${portfolioItems.length})`
                : `Recent Projects (${portfolioItems.length})`}
            </h2>
            <div className='vp-portfolio-grid'>
              {portfolioItems.map((p, i) => (
                <div key={i} className='vp-portfolio-card'>
                  <div className='vp-portfolio-img'>
                    <img src={p.image} alt={isAr ? p.title_ar : p.title_en} />
                  </div>
                  <div className='vp-portfolio-body'>
                    <span className='vp-portfolio-title'>
                      {isAr ? p.title_ar : p.title_en}
                    </span>
                    <span className='vp-portfolio-cat'>
                      {isAr ? p.cat_ar : p.cat_en}
                    </span>
                    <span className='vp-portfolio-meta'>
                      {isAr ? p.completed_ar : p.completed_en}
                    </span>
                    <span className='vp-portfolio-meta'>
                      EGP {p.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <>
            <div className='vp-section'>
              <div className='vp-review-summary'>
                <div className='vp-review-score-wrap'>
                  <span className='vp-review-score'>{rating}</span>
                  <span className='vp-review-outof'>/ 5.0</span>
                  <div className='vp-review-stars'>
                    {renderStars(rating, 14)}
                  </div>
                  <span className='vp-review-count'>
                    {reviews} {isAr ? 'تقييم' : 'reviews'}
                  </span>
                </div>
                <div className='vp-review-breakdown'>
                  {ratingBreakdown.map((b) => (
                    <div key={b.stars} className='vp-breakdown-row'>
                      <span className='vp-breakdown-label'>{b.stars}</span>
                      <svg
                        width='10'
                        height='10'
                        viewBox='0 0 24 24'
                        fill='#FFA500'
                        stroke='#FFA500'
                        strokeWidth='1.5'
                      >
                        <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                      </svg>
                      <div className='vp-breakdown-bar-wrap'>
                        <div
                          className='vp-breakdown-bar'
                          style={{ width: `${b.percent}%` }}
                        />
                      </div>
                      <span className='vp-breakdown-count'>{b.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='vp-review-filters'>
                {['all', '5star', '4star', 'recent', 'photos'].map((f) => (
                  <button
                    key={f}
                    className={`vp-filter-btn ${reviewFilter === f ? 'vp-filter-active' : ''}`}
                    onClick={() => setReviewFilter(f)}
                  >
                    {f === 'all'
                      ? isAr
                        ? 'الكل'
                        : 'All'
                      : f === '5star'
                        ? isAr
                          ? '5 نجوم'
                          : '5 Star'
                        : f === '4star'
                          ? isAr
                            ? '4 نجوم'
                            : '4 Star'
                          : f === 'recent'
                            ? isAr
                              ? 'الأحدث'
                              : 'Recent'
                            : isAr
                              ? 'صور'
                              : 'Photos'}
                  </button>
                ))}
              </div>

              <div className='vp-reviews-list'>
                {reviewsList.map((r, i) => (
                  <div key={i} className='vp-review-card'>
                    <div className='vp-review-top'>
                      <div className='vp-review-avatar'>
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
                          <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                          <circle cx='12' cy='7' r='4' />
                        </svg>
                      </div>
                      <div className='vp-review-author'>
                        <span className='vp-review-name'>{r.name}</span>
                        <span className='vp-review-company'>{r.company}</span>
                      </div>
                      <div className='vp-review-right'>
                        <div className='vp-review-rating'>
                          {renderStars(r.rating, 11)}
                        </div>
                        <span className='vp-review-time'>
                          {isAr ? r.time_ar : r.time_en}
                        </span>
                      </div>
                    </div>
                    <p className='vp-review-text'>
                      {isAr ? r.text_ar : r.text_en}
                    </p>
                    <div className='vp-review-bottom'>
                      <span className='vp-review-project'>
                        {isAr ? 'المشروع: ' : 'Project: '}
                        {isAr ? r.project_ar : r.project_en}
                      </span>
                      <div className='vp-review-likes'>
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
                          <path d='M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3' />
                        </svg>
                        <span>{r.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className='vp-load-more'>
                {isAr ? 'تحميل المزيد' : 'Load More Reviews'}
              </button>
            </div>
          </>
        )}

        {activeTab === 'contact' && (
          <>
            <div className='vp-section'>
              <h2 className='vp-section-title'>
                {isAr ? 'معلومات الاتصال' : 'Contact Information'}
              </h2>
              <div className='vp-specs'>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'الهاتف:' : 'Phone:'}
                  </span>
                  <span className='vp-spec-value'>
                    {vendorProfile?.phone || '+20 2 1234 5678'}
                  </span>
                </div>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'الموقع الإلكتروني:' : 'Website:'}
                  </span>
                  <span className='vp-spec-value'>
                    {vendorProfile?.website || 'www.buildright.com.eg'}
                  </span>
                </div>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'العنوان:' : 'Address:'}
                  </span>
                  <span className='vp-spec-value'>
                    {vendorProfile?.address || '123 Construction St, Cairo'}
                  </span>
                </div>
              </div>
            </div>

            <div className='vp-section'>
              <h2 className='vp-section-title'>
                {isAr ? 'ساعات العمل' : 'Business Hours'}
              </h2>
              <div className='vp-specs'>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'الأحد - الخميس:' : 'Sunday - Thursday:'}
                  </span>
                  <span className='vp-spec-value'>9:00 AM - 6:00 PM</span>
                </div>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'السبت:' : 'Saturday:'}
                  </span>
                  <span className='vp-spec-value'>10:00 AM - 3:00 PM</span>
                </div>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'الجمعة:' : 'Friday:'}
                  </span>
                  <span className='vp-spec-value vp-closed'>
                    {isAr ? 'مغلق' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>

            <div className='vp-section'>
              <h2 className='vp-section-title'>
                {isAr ? 'وقت الاستجابة' : 'Response Time'}
              </h2>
              <div className='vp-specs'>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'يستجيب خلال:' : 'Usually within:'}
                  </span>
                  <span className='vp-spec-value'>
                    {responseHrs} {isAr ? 'ساعات' : 'hours'}
                  </span>
                </div>
                <div className='vp-spec-row'>
                  <span className='vp-spec-label'>
                    {isAr ? 'معدل الاستجابة:' : 'Response rate:'}
                  </span>
                  <span className='vp-spec-value'>98%</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{ height: '90px' }} />
      </div>

      <div className='vp-contact-bar'>
        <button className='vp-contact-btn' onClick={handleContact}>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
          </svg>
          {isAr ? 'تواصل مع المورد' : 'Contact Vendor'}
        </button>
      </div>

      {showShare && (
        <div className='vp-share-overlay' onClick={() => setShowShare(false)}>
          <div className='vp-share-sheet' onClick={(e) => e.stopPropagation()}>
            <div className='vp-share-handle' />
            <p className='vp-share-title'>
              {isAr ? 'مشاركة المورد' : 'Share this Vendor'}
            </p>
            {shareOptions.map((opt, i) => (
              <button
                key={i}
                className='vp-share-option'
                onClick={() => setShowShare(false)}
              >
                <span className='vp-share-icon'>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
            <button
              className='vp-share-cancel'
              onClick={() => setShowShare(false)}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorProfile
