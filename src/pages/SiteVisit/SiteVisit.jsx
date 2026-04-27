import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './SiteVisit.css'

const PROJECT_MODEL = '/models/small_office.glb'

const projectInfo = {
  title_en: 'Modern Office Fit-out',
  title_ar: 'تجهيز مكتب عصري',
  vendor_en: 'BuildRight Construction',
  vendor_ar: 'BuildRight للإنشاءات',
  area_en: '120 m²',
  area_ar: '120 م²',
  duration_en: '3 weeks',
  duration_ar: '3 أسابيع',
  completed_en: 'February 2026',
  completed_ar: 'فبراير 2026',
  budget_en: 'EGP 285,000',
  budget_ar: '285,000 جنيه',
  client_en: 'TechCorp Cairo',
  client_ar: 'TechCorp القاهرة',
  description_en:
    'Complete office transformation including custom millwork, acoustic treatments, integrated lighting systems, and ergonomic workstations. Delivered on time with zero defects.',
  description_ar:
    'تحول كامل للمكتب يشمل أعمال النجارة المخصصة والمعالجات الصوتية وأنظمة الإضاءة المتكاملة ومحطات العمل المريحة. تم التسليم في الموعد بدون عيوب.',
}

const hotspots = [
  {
    id: 'h1',
    position: '0 1.5 0',
    normal: '0 1 0',
    title_en: 'Custom Millwork',
    title_ar: 'أعمال النجارة المخصصة',
    detail_en: 'Hand-finished oak panels',
    detail_ar: 'ألواح بلوط مصقولة يدوياً',
    duration_en: '3 weeks craftsmanship',
    duration_ar: '3 أسابيع من الحرفية',
    icon: 'oak',
  },
  {
    id: 'h2',
    position: '1 2 0',
    normal: '0 1 0',
    title_en: 'LED Ceiling System',
    title_ar: 'نظام إضاءة LED للسقف',
    detail_en: 'Dimmable smart lighting',
    detail_ar: 'إضاءة ذكية قابلة للتعديل',
    duration_en: '2-day installation',
    duration_ar: 'تركيب في يومين',
    icon: 'led',
  },
  {
    id: 'h3',
    position: '-1 1 1',
    normal: '0 0 1',
    title_en: 'Acoustic Panels',
    title_ar: 'الألواح الصوتية',
    detail_en: 'Custom fabric-wrapped',
    detail_ar: 'مغلفة بنسيج مخصص',
    duration_en: 'NRC 0.85 rated',
    duration_ar: 'تصنيف NRC 0.85',
    icon: 'acoustic',
  },
  {
    id: 'h4',
    position: '0.5 0.5 -1',
    normal: '0 0 -1',
    title_en: 'Ergonomic Workstation',
    title_ar: 'محطة عمل مريحة',
    detail_en: 'Height-adjustable, BIFMA tested',
    detail_ar: 'قابلة لضبط الارتفاع، معتمدة BIFMA',
    duration_en: '12 stations installed',
    duration_ar: '12 محطة تم تركيبها',
    icon: 'desk',
  },
  {
    id: 'h5',
    position: '-1.5 1.2 -0.5',
    normal: '-1 0 0',
    title_en: 'Smart Glass Partition',
    title_ar: 'فاصل زجاجي ذكي',
    detail_en: 'Switchable privacy glass',
    detail_ar: 'زجاج قابل للتبديل للخصوصية',
    duration_en: '1-week custom build',
    duration_ar: 'تصنيع مخصص في أسبوع',
    icon: 'glass',
  },
]

const renderHotspotIcon = (icon) => {
  const props = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#0e0e0e',
    strokeWidth: 2.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  if (icon === 'oak')
    return (
      <svg {...props}>
        <path d='M12 2v8' />
        <path d='M12 18v4' />
        <circle cx='12' cy='14' r='4' />
      </svg>
    )
  if (icon === 'led')
    return (
      <svg {...props}>
        <line x1='12' y1='1' x2='12' y2='3' />
        <line x1='12' y1='21' x2='12' y2='23' />
        <circle cx='12' cy='12' r='5' />
        <line x1='4.22' y1='4.22' x2='5.64' y2='5.64' />
        <line x1='18.36' y1='18.36' x2='19.78' y2='19.78' />
      </svg>
    )
  if (icon === 'acoustic')
    return (
      <svg {...props}>
        <path d='M11 5L6 9H2v6h4l5 4V5z' />
        <path d='M15.54 8.46a5 5 0 0 1 0 7.07' />
      </svg>
    )
  if (icon === 'desk')
    return (
      <svg {...props}>
        <rect x='3' y='6' width='18' height='12' rx='1' />
        <line x1='3' y1='10' x2='21' y2='10' />
      </svg>
    )
  return (
    <svg {...props}>
      <rect x='3' y='3' width='18' height='18' rx='1' />
      <line x1='12' y1='3' x2='12' y2='21' />
    </svg>
  )
}

const SiteVisit = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeHotspot, setActiveHotspot] = useState(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [arLaunched, setArLaunched] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const viewerRef = useRef(null)
  const arViewerRef = useRef(null)
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  useEffect(() => {
    const v = viewerRef.current
    if (!v) return
    const onLoad = () => setModelLoaded(true)
    v.addEventListener('load', onLoad)
    return () => v.removeEventListener('load', onLoad)
  }, [])

  const handleLaunchAR = () => {
    if (arViewerRef.current && arViewerRef.current.canActivateAR) {
      arViewerRef.current.activateAR()
      setArLaunched(true)
    } else {
      alert(
        isAr
          ? 'الواقع المعزز يعمل على الجوال فقط'
          : 'AR works on mobile devices only'
      )
    }
  }

  const handleRequestProject = () => {
    setShowRequest(false)
    setRequestSent(true)
    setTimeout(() => setRequestSent(false), 3000)
  }

  return (
    <div
      className='sv-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='sv-bg'>
        <div className='sv-bg-1' />
        <div className='sv-bg-2' />
      </div>

      <div className='sv-topbar'>
        <button className='sv-back' onClick={() => navigate(-1)}>
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
        <div className='sv-topbar-title-wrap'>
          <span className='sv-topbar-eyebrow'>
            {isAr ? 'سيلا · زيارة موقع' : 'SELA · SITE VISIT'}
          </span>
          <span className='sv-topbar-title'>
            {isAr ? projectInfo.title_ar : projectInfo.title_en}
          </span>
        </div>
        <button className='sv-share-btn'>
          <svg
            width='18'
            height='18'
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
      </div>

      <div className='sv-scroll'>
        {/* Hero project showcase */}
        <div className='sv-hero'>
          <div className='sv-hero-frame'>
            <div className='sv-hero-corners'>
              <div className='sv-corner sv-corner-tl' />
              <div className='sv-corner sv-corner-tr' />
              <div className='sv-corner sv-corner-bl' />
              <div className='sv-corner sv-corner-br' />
            </div>
            <model-viewer
              ref={viewerRef}
              src={PROJECT_MODEL}
              alt='Project preview'
              camera-controls
              auto-rotate
              auto-rotate-delay='2000'
              rotation-per-second='10deg'
              interaction-prompt='none'
              shadow-intensity='1'
              exposure='1'
              environment-image='neutral'
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
              }}
            ></model-viewer>
            {!modelLoaded && (
              <div className='sv-loader'>
                <div className='sv-loader-ring' />
                <span>{isAr ? 'جاري التحميل...' : 'Loading project...'}</span>
              </div>
            )}
          </div>
          <div className='sv-hero-meta'>
            <div className='sv-hero-status'>
              <span className='sv-hero-dot' />
              <span>{isAr ? 'مكتمل' : 'COMPLETED'}</span>
            </div>
            <span className='sv-hero-completed'>
              {isAr ? projectInfo.completed_ar : projectInfo.completed_en}
            </span>
          </div>
        </div>

        {/* Project quick stats */}
        <div className='sv-stats-grid'>
          <div className='sv-stat'>
            <div className='sv-stat-icon-wrap'>
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
                <rect x='3' y='3' width='18' height='18' rx='1' />
                <line x1='9' y1='3' x2='9' y2='21' />
                <line x1='15' y1='3' x2='15' y2='21' />
                <line x1='3' y1='9' x2='21' y2='9' />
                <line x1='3' y1='15' x2='21' y2='15' />
              </svg>
            </div>
            <span className='sv-stat-label'>{isAr ? 'المساحة' : 'Area'}</span>
            <span className='sv-stat-value'>
              {isAr ? projectInfo.area_ar : projectInfo.area_en}
            </span>
          </div>
          <div className='sv-stat'>
            <div className='sv-stat-icon-wrap'>
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
                <circle cx='12' cy='12' r='10' />
                <polyline points='12 6 12 12 16 14' />
              </svg>
            </div>
            <span className='sv-stat-label'>{isAr ? 'المدة' : 'Duration'}</span>
            <span className='sv-stat-value'>
              {isAr ? projectInfo.duration_ar : projectInfo.duration_en}
            </span>
          </div>
          <div className='sv-stat'>
            <div className='sv-stat-icon-wrap'>
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
                <line x1='12' y1='1' x2='12' y2='23' />
                <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
              </svg>
            </div>
            <span className='sv-stat-label'>
              {isAr ? 'الميزانية' : 'Budget'}
            </span>
            <span className='sv-stat-value'>
              {isAr ? projectInfo.budget_ar : projectInfo.budget_en}
            </span>
          </div>
          <div className='sv-stat'>
            <div className='sv-stat-icon-wrap'>
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
            <span className='sv-stat-label'>{isAr ? 'العميل' : 'Client'}</span>
            <span className='sv-stat-value'>
              {isAr ? projectInfo.client_ar : projectInfo.client_en}
            </span>
          </div>
        </div>

        {/* AR launch CTA */}
        <button className='sv-ar-btn' onClick={handleLaunchAR}>
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
            <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' />
            <polyline points='3.27 6.96 12 12.01 20.73 6.96' />
          </svg>
          {isAr ? 'تجوّل في المشروع بالواقع المعزز' : 'Walk Through in AR'}
        </button>
        <p className='sv-ar-hint'>
          {isAr
            ? 'ضع المشروع في مكتبك بحجمه الحقيقي وتجوّل بداخله'
            : 'Place this project in your office at full scale and walk through it'}
        </p>

        {/* Hidden AR launcher viewer with hotspots */}
        <model-viewer
          ref={arViewerRef}
          src={PROJECT_MODEL}
          alt='AR walkthrough'
          ar
          ar-modes='webxr scene-viewer quick-look'
          shadow-intensity='1'
          exposure='1'
          environment-image='neutral'
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1px',
            height: '1px',
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          {hotspots.map((h, i) => (
            <button
              key={h.id}
              slot={`hotspot-sv-${i + 1}`}
              data-position={h.position}
              data-normal={h.normal}
              data-visibility-attribute='visible'
              className='sv-ar-hotspot'
            >
              <span className='sv-ar-hotspot-num'>{i + 1}</span>
              <span className='sv-ar-hotspot-label'>
                {isAr ? h.title_ar : h.title_en}
              </span>
            </button>
          ))}
        </model-viewer>

        {/* Description */}
        <div className='sv-section'>
          <h2 className='sv-section-title'>
            {isAr ? 'عن المشروع' : 'About This Project'}
          </h2>
          <p className='sv-desc'>
            {isAr ? projectInfo.description_ar : projectInfo.description_en}
          </p>
        </div>

        {/* Craftsmanship highlights */}
        <div className='sv-section'>
          <div className='sv-section-header'>
            <h2 className='sv-section-title'>
              {isAr ? 'تفاصيل الحرفية' : 'Craftsmanship Highlights'}
            </h2>
            <span className='sv-count-badge'>{hotspots.length}</span>
          </div>
          <div className='sv-highlights-list'>
            {hotspots.map((h, i) => (
              <div
                key={h.id}
                className={`sv-highlight ${
                  activeHotspot?.id === h.id ? 'sv-highlight-active' : ''
                }`}
                onClick={() =>
                  setActiveHotspot(activeHotspot?.id === h.id ? null : h)
                }
              >
                <div className='sv-highlight-icon'>
                  {renderHotspotIcon(h.icon)}
                </div>
                <div className='sv-highlight-text'>
                  <div className='sv-highlight-top'>
                    <span className='sv-highlight-num'>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className='sv-highlight-title'>
                      {isAr ? h.title_ar : h.title_en}
                    </span>
                  </div>
                  <span className='sv-highlight-detail'>
                    {isAr ? h.detail_ar : h.detail_en}
                  </span>
                  {activeHotspot?.id === h.id && (
                    <span className='sv-highlight-duration'>
                      <svg
                        width='10'
                        height='10'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#00a7e5'
                        strokeWidth='2'
                      >
                        <circle cx='12' cy='12' r='10' />
                        <polyline points='12 6 12 12 16 14' />
                      </svg>
                      {isAr ? h.duration_ar : h.duration_en}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor mini-card */}
        <div className='sv-vendor-card'>
          <div className='sv-vendor-info'>
            <span className='sv-vendor-eyebrow'>
              {isAr ? 'تنفيذ بواسطة' : 'BUILT BY'}
            </span>
            <span className='sv-vendor-name'>
              {isAr ? projectInfo.vendor_ar : projectInfo.vendor_en}
            </span>
            <div className='sv-vendor-rating'>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='#FFA500'>
                <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
              </svg>
              <span>4.9 · 89 {isAr ? 'مشروع' : 'projects'}</span>
            </div>
          </div>
          <button
            className='sv-vendor-view'
            onClick={() => navigate(`/vendor/${id || 1}`)}
          >
            {isAr ? 'عرض الملف' : 'View Profile'}
          </button>
        </div>

        {/* Request similar */}
        <div className='sv-cta-section'>
          <h2 className='sv-cta-title'>
            {isAr ? 'تريد مشروعاً مشابهاً؟' : 'Want a similar project?'}
          </h2>
          <p className='sv-cta-sub'>
            {isAr
              ? 'احصل على عرض سعر من نفس المنفذ خلال 48 ساعة'
              : 'Get a quote from the same vendor within 48 hours'}
          </p>
          <button className='sv-cta-btn' onClick={() => setShowRequest(true)}>
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
            {isAr ? 'طلب مشروع مماثل' : 'Request Similar Project'}
          </button>
        </div>

        <div style={{ height: '90px' }} />
      </div>

      {/* Request modal */}
      {showRequest && (
        <div className='sv-modal-overlay' onClick={() => setShowRequest(false)}>
          <div className='sv-modal-sheet' onClick={(e) => e.stopPropagation()}>
            <div className='sv-modal-handle' />
            <h3 className='sv-modal-title'>
              {isAr ? 'تأكيد طلب المشروع' : 'Confirm Project Request'}
            </h3>
            <p className='sv-modal-sub'>
              {isAr
                ? `سيتم إرسال طلب إلى ${projectInfo.vendor_ar} لمشروع مماثل لـ "${projectInfo.title_ar}"`
                : `A request will be sent to ${projectInfo.vendor_en} for a project similar to "${projectInfo.title_en}"`}
            </p>
            <div className='sv-modal-summary'>
              <div className='sv-modal-row'>
                <span>{isAr ? 'المشروع المرجعي' : 'Reference project'}</span>
                <span>
                  {isAr ? projectInfo.title_ar : projectInfo.title_en}
                </span>
              </div>
              <div className='sv-modal-row'>
                <span>{isAr ? 'المنفذ' : 'Vendor'}</span>
                <span>
                  {isAr ? projectInfo.vendor_ar : projectInfo.vendor_en}
                </span>
              </div>
              <div className='sv-modal-row'>
                <span>{isAr ? 'الميزانية المرجعية' : 'Reference budget'}</span>
                <span>
                  {isAr ? projectInfo.budget_ar : projectInfo.budget_en}
                </span>
              </div>
            </div>
            <div className='sv-modal-actions'>
              <button
                className='sv-modal-cancel'
                onClick={() => setShowRequest(false)}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                className='sv-modal-confirm'
                onClick={handleRequestProject}
              >
                {isAr ? 'إرسال الطلب' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {requestSent && (
        <div className='sv-toast'>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='#00a7e5'>
            <path d='M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' />
          </svg>
          <span>
            {isAr ? 'تم إرسال الطلب إلى المنفذ' : 'Request sent to vendor'}
          </span>
        </div>
      )}
    </div>
  )
}

export default SiteVisit
