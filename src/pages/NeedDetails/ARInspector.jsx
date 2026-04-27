import { useState, useRef, useEffect } from 'react'
import './ARInspector.css'

// ============================================================
// PER-MODEL CONFIG
// Each chair has its own default camera angle + hotspot positions.
// To tweak a hotspot: change the position '0.0 0.0 0.0' values.
// Format: 'x y z' in meters from model center.
// ============================================================
const modelConfigs = {
  '/models/office_chair.glb': {
    cameraOrbit: '0deg 80deg 2.2m',
    hotspots: [
      {
        id: 'h1',
        position:
          '-0.0013155898125775632m 0.9861674731744138m -0.1575275332223553m',
        normal:
          '0.00004888793265774658m 0.13912243035584634m 0.9902751875018644m',
        title_en: 'Headrest',
        title_ar: 'مسند الرأس',
        value_en: 'Height and angle adjustable, plush cushioned',
        value_ar: 'قابل للتعديل في الارتفاع والزاوية، مبطن فاخر',
        spec_en: 'Removable cover · Machine washable',
        spec_ar: 'غطاء قابل للإزالة · قابل للغسل في الغسالة',
        cameraOrbit: '0deg 70deg 1.4m',
        cameraTarget: '0m 0.98m -0.15m',
      },
      {
        id: 'h2',
        position:
          '-0.003614376713468376m 0.48577965903983217m -0.14610362031249433m',
        normal:
          '0.004414227544630979m 0.06141482776442068m 0.9981025666362404m',
        title_en: 'Lumbar Support',
        title_ar: 'دعم أسفل الظهر',
        value_en: 'Adjustable mesh lumbar with 3-position lock',
        value_ar: 'دعم شبكي قابل للتعديل بثلاث مواضع',
        spec_en: 'Ergonomic certified · CE compliant',
        spec_ar: 'معتمد ergonomic · متوافق مع CE',
        cameraOrbit: '0deg 75deg 1.4m',
        cameraTarget: '0m 0.48m -0.14m',
      },
      {
        id: 'h3',
        position:
          '-0.0034481442389183254m 0.42791326219411313m 0.1694843846040807m',
        normal:
          '-0.07658847840394971m 0.997062788883292m 1.994314990046478e-7m',
        title_en: 'Seat Cushion',
        title_ar: 'وسادة المقعد',
        value_en: 'High-density molded foam, 5cm thickness',
        value_ar: 'إسفنج مصبوب عالي الكثافة، سماكة 5 سم',
        spec_en: '8-year warranty · Stain-resistant fabric',
        spec_ar: 'ضمان 8 سنوات · قماش مقاوم للبقع',
        cameraOrbit: '0deg 85deg 1.3m',
        cameraTarget: '0m 0.42m 0.17m',
      },
      {
        id: 'h4',
        position:
          '-0.33075328888950606m 0.6318418273021272m 0.16292762235213637m',
        normal:
          '1.4955523858355057e-16m 0.9299989717729489m 0.3675621206017533m',
        title_en: 'Armrest System',
        title_ar: 'نظام مساند الذراعين',
        value_en: '4D adjustable armrests: height, width, depth, angle',
        value_ar:
          'مساند ذراعين رباعية الأبعاد: الارتفاع والعرض والعمق والزاوية',
        spec_en: 'PU padding · Tested to 80kg load',
        spec_ar: 'حشوة بولي يوريثين · مختبرة لحمل 80 كجم',
        cameraOrbit: '60deg 80deg 1.4m',
        cameraTarget: '-0.33m 0.63m 0.16m',
      },
      {
        id: 'h5',
        position:
          '-0.00621953201883213m 0.07275256979769229m 0.11957843928995675m',
        normal: '-0.338619534383033m 0.9219007239256717m 0.18824416633601374m',
        title_en: 'Base & Casters',
        title_ar: 'القاعدة والعجلات',
        value_en: 'Aluminum 5-star base with 60mm PU wheels',
        value_ar: 'قاعدة ألومنيوم خماسية مع عجلات بولي يوريثين 60 ملم',
        spec_en: 'BIFMA tested · Floor-safe rolling',
        spec_ar: 'مختبر BIFMA · آمن للأرضيات',
        cameraOrbit: '0deg 100deg 1.6m',
        cameraTarget: '0m 0.07m 0.12m',
      },
    ],
  },
  '/models/office_wheel_chair.glb': {
    cameraOrbit: '-91.4deg 82.75deg 1.331m',
    hotspots: [
      {
        id: 'h1',
        position: '0.6926666096181002m 0.5409934888473629m 0.9595030167802469m',
        normal: '-0.879073693556065m 0.476685893747337m 1.058455309504629e-16m',
        title_en: 'Mesh Backrest',
        title_ar: 'مسند الظهر الشبكي',
        value_en: 'Breathable elastic mesh with ergonomic curve',
        value_ar: 'شبكة مرنة قابلة للتنفس مع منحنى ergonomic',
        spec_en: 'GREENGUARD certified · Anti-microbial',
        spec_ar: 'معتمد GREENGUARD · مضاد للميكروبات',
        cameraOrbit: '-91.4deg 75deg 1m',
        cameraTarget: '0.69m 0.54m 0.96m',
      },
      {
        id: 'h2',
        position: '0.4531905331768993m 0.4334246042898657m 0.8075387502030973m',
        normal:
          '0.016548531264806262m 0.9998630628041578m 0.0000418672475860976m',
        title_en: 'Armrest System',
        title_ar: 'نظام مساند الذراعين',
        value_en: '3D adjustable armrests: height, width, angle',
        value_ar: 'مساند ذراعين ثلاثية الأبعاد: الارتفاع والعرض والزاوية',
        spec_en: 'PU padding · Tested to 80kg load',
        spec_ar: 'حشوة بولي يوريثين · مختبرة لحمل 80 كجم',
        cameraOrbit: '-50deg 80deg 1m',
        cameraTarget: '0.45m 0.43m 0.81m',
      },
      {
        id: 'h3',
        position:
          '0.43424421732779206m 0.32397503187706367m 0.9591708355956475m',
        normal:
          '-0.23682318353301812m 0.9715382405880316m 0.005312891528975093m',
        title_en: 'Seat Cushion',
        title_ar: 'وسادة المقعد',
        value_en: 'High-density molded foam, contoured design',
        value_ar: 'إسفنج مصبوب عالي الكثافة، تصميم محدد',
        spec_en: '5-year warranty · Premium fabric',
        spec_ar: 'ضمان 5 سنوات · قماش فاخر',
        cameraOrbit: '-91.4deg 85deg 1m',
        cameraTarget: '0.43m 0.32m 0.96m',
      },
      {
        id: 'h4',
        position: '0.4856150647733357m 0.2479272273747397m 0.9634520096387869m',
        normal:
          '-0.9586928896779635m 0.017548484600280023m 0.28390138071018595m',
        title_en: 'Hydraulic Lift',
        title_ar: 'الرافع الهيدروليكي',
        value_en: 'Class-4 gas cylinder, 360° swivel',
        value_ar: 'أسطوانة غاز من الفئة 4، دوران 360 درجة',
        spec_en: 'BIFMA certified · 10cm height range',
        spec_ar: 'معتمد BIFMA · مدى ارتفاع 10 سم',
        cameraOrbit: '-91.4deg 95deg 1m',
        cameraTarget: '0.49m 0.25m 0.96m',
      },
      {
        id: 'h5',
        position:
          '0.3701481785460592m 0.13135543554992396m 0.9186766347429319m',
        normal:
          '-0.9207311106534605m 0.00032877233925750546m 0.3901975317497462m',
        title_en: 'Base & Casters',
        title_ar: 'القاعدة والعجلات',
        value_en: 'Aluminum 5-star base with 60mm PU wheels',
        value_ar: 'قاعدة ألومنيوم خماسية مع عجلات بولي يوريثين 60 ملم',
        spec_en: 'BIFMA tested · Floor-safe rolling',
        spec_ar: 'مختبر BIFMA · آمن للأرضيات',
        cameraOrbit: '-91.4deg 100deg 1.2m',
        cameraTarget: '0.49m -0.1m 0.96m',
      },
    ],
  },
}

// Default config (fallback for any model not in the list above)
const defaultConfig = {
  cameraOrbit: '0deg 75deg 2.5m',
  hotspots: [],
}

const ARInspector = ({ attachment, onClose, isAr }) => {
  const [activeHotspot, setActiveHotspot] = useState(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const viewerRef = useRef(null)

  const config = modelConfigs[attachment?.file_url] || defaultConfig
  const hotspots = config.hotspots
  const defaultOrbit = config.cameraOrbit

  const handleHotspotClick = (hotspot) => {
    setActiveHotspot(hotspot)
    setPanelOpen(true)
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = hotspot.cameraOrbit
      viewerRef.current.cameraTarget = hotspot.cameraTarget
    }
  }

  const handleReset = () => {
    setPanelOpen(false)
    setTimeout(() => setActiveHotspot(null), 300)
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = defaultOrbit
      viewerRef.current.cameraTarget = 'auto auto auto'
    }
  }

  const handleLaunchAR = () => {
    if (viewerRef.current && viewerRef.current.canActivateAR) {
      viewerRef.current.activateAR()
    }
  }

  const handleClosePanel = () => {
    setPanelOpen(false)
    setTimeout(() => setActiveHotspot(null), 300)
  }

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    const onLoad = () => setModelLoaded(true)
    viewer.addEventListener('load', onLoad)
    return () => viewer.removeEventListener('load', onLoad)
  }, [])

  const productName =
    attachment?.file_name?.replace('.glb', '').replace('.usdz', '') || 'Product'

  return (
    <div
      className='ari-overlay'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr ? 'Tajawal, sans-serif' : 'DM Sans, sans-serif',
      }}
    >
      <div className='ari-corner ari-corner-tl' />
      <div className='ari-corner ari-corner-tr' />
      <div className='ari-corner ari-corner-bl' />
      <div className='ari-corner ari-corner-br' />

      <div className='ari-topbar'>
        <button className='ari-icon-btn' onClick={onClose}>
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <line x1='18' y1='6' x2='6' y2='18' />
            <line x1='6' y1='6' x2='18' y2='18' />
          </svg>
        </button>
        <div className='ari-title-block'>
          <span className='ari-eyebrow'>
            {isAr ? 'سيلا · فحص' : 'SELA · INSPECT'}
          </span>
          <span className='ari-title'>{productName}</span>
        </div>
        <button
          className='ari-icon-btn'
          onClick={handleReset}
          title={isAr ? 'إعادة تعيين' : 'Reset view'}
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M3 12a9 9 0 1 0 3-6.7L3 8' />
            <polyline points='3 3 3 8 8 8' />
          </svg>
        </button>
      </div>

      <div className='ari-stage'>
        <model-viewer
          ref={viewerRef}
          src={attachment?.file_url}
          alt='3D product inspection'
          camera-controls
          camera-orbit={defaultOrbit}
          interaction-prompt='none'
          ar
          ar-modes='webxr scene-viewer quick-look'
          shadow-intensity='1'
          exposure='1'
          environment-image='neutral'
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
          }}
        >
          {hotspots.map((h, i) => (
            <button
              key={h.id}
              slot={`hotspot-${i + 1}`}
              data-position={h.position}
              data-normal={h.normal}
              data-visibility-attribute='visible'
              className={`ari-hotspot ${activeHotspot?.id === h.id ? 'ari-hotspot-active' : ''}`}
              onClick={() => handleHotspotClick(h)}
            >
              <span className='ari-hotspot-pulse' />
              <span className='ari-hotspot-dot' />
              <span className='ari-hotspot-label'>{i + 1}</span>
            </button>
          ))}
        </model-viewer>

        {!modelLoaded && (
          <div className='ari-loader'>
            <div className='ari-loader-ring' />
            <span>{isAr ? 'جاري تحميل النموذج...' : 'Loading model...'}</span>
          </div>
        )}

        <div className='ari-stage-grid' />
      </div>

      <div className='ari-bottom-bar'>
        <div className='ari-hint'>
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#00a7e5'
            strokeWidth='2'
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='12' y1='8' x2='12' y2='12' />
            <line x1='12' y1='16' x2='12.01' y2='16' />
          </svg>
          <span>
            {isAr
              ? 'اضغط على النقاط لاستكشاف المواصفات'
              : 'Tap glowing points to inspect specifications'}
          </span>
        </div>
        <button className='ari-ar-launch' onClick={handleLaunchAR}>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' />
            <polyline points='3.27 6.96 12 12.01 20.73 6.96' />
          </svg>
          {isAr ? 'مشاهدة في مساحتك' : 'View in your space'}
        </button>
      </div>

      <div className={`ari-panel ${panelOpen ? 'ari-panel-open' : ''}`}>
        {activeHotspot && (
          <>
            <div className='ari-panel-header'>
              <div className='ari-panel-num'>
                {hotspots.findIndex((h) => h.id === activeHotspot.id) + 1}
              </div>
              <button className='ari-panel-close' onClick={handleClosePanel}>
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            </div>
            <h3 className='ari-panel-title'>
              {isAr ? activeHotspot.title_ar : activeHotspot.title_en}
            </h3>
            <p className='ari-panel-value'>
              {isAr ? activeHotspot.value_ar : activeHotspot.value_en}
            </p>
            <div className='ari-panel-divider' />
            <div className='ari-panel-spec'>
              <span className='ari-panel-spec-label'>
                {isAr ? 'الشهادات والمواصفات' : 'Verified specs'}
              </span>
              <span className='ari-panel-spec-value'>
                {isAr ? activeHotspot.spec_ar : activeHotspot.spec_en}
              </span>
            </div>
            <button className='ari-panel-action'>
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
              </svg>
              {isAr ? 'سؤال عن هذا الجزء' : 'Ask about this part'}
            </button>
          </>
        )}
      </div>

      <div className='ari-counter'>
        <span className='ari-counter-num'>{hotspots.length}</span>
        <span className='ari-counter-label'>
          {isAr ? 'نقاط فحص' : 'inspection points'}
        </span>
      </div>
    </div>
  )
}

export default ARInspector
