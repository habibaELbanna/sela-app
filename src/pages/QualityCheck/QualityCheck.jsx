import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './QualityCheck.css'

const REFERENCE_MODEL = '/models/office_chair.glb'
const DELIVERED_MODEL = '/models/office_wheel_chair.glb'

const comparisonPoints = [
  {
    id: 'p1',
    part_en: 'Backrest Material',
    part_ar: 'مادة الظهر',
    status: 'mismatch',
    expected_en: 'Premium leather, padded',
    expected_ar: 'جلد فاخر، مبطن',
    found_en: 'Mesh fabric',
    found_ar: 'نسيج شبكي',
    severity: 'high',
    arPosition:
      '-0.003614376713468376m 0.48577965903983217m -0.14610362031249433m',
    arNormal: '0.004414227544630979m 0.06141482776442068m 0.9981025666362404m',
  },
  {
    id: 'p2',
    part_en: 'Base & Casters',
    part_ar: 'القاعدة والعجلات',
    status: 'match',
    expected_en: 'Aluminum 5-star with PU wheels',
    expected_ar: 'ألومنيوم خماسي مع عجلات بولي يوريثين',
    found_en: 'Aluminum 5-star with PU wheels',
    found_ar: 'ألومنيوم خماسي مع عجلات بولي يوريثين',
    severity: null,
    arPosition:
      '-0.00621953201883213m 0.07275256979769229m 0.11957843928995675m',
    arNormal: '-0.338619534383033m 0.9219007239256717m 0.18824416633601374m',
  },
  {
    id: 'p3',
    part_en: 'Headrest',
    part_ar: 'مسند الرأس',
    status: 'mismatch',
    expected_en: 'Plush cushioned headrest included',
    expected_ar: 'مسند رأس مبطن فاخر',
    found_en: 'Headrest missing',
    found_ar: 'مسند الرأس مفقود',
    severity: 'high',
    arPosition:
      '-0.0013155898125775632m 0.9861674731744138m -0.1575275332223553m',
    arNormal:
      '0.00004888793265774658m 0.13912243035584634m 0.9902751875018644m',
  },
  {
    id: 'p4',
    part_en: 'Armrest System',
    part_ar: 'نظام مساند الذراعين',
    status: 'match',
    expected_en: '4D adjustable armrests',
    expected_ar: 'مساند ذراعين رباعية الأبعاد',
    found_en: '3D adjustable armrests (acceptable)',
    found_ar: 'مساند ثلاثية الأبعاد (مقبول)',
    severity: null,
    arPosition:
      '-0.33075328888950606m 0.6318418273021272m 0.16292762235213637m',
    arNormal: '1.4955523858355057e-16m 0.9299989717729489m 0.3675621206017533m',
  },
  {
    id: 'p5',
    part_en: 'Seat Cushion',
    part_ar: 'وسادة المقعد',
    status: 'match',
    expected_en: 'High-density foam, 5cm',
    expected_ar: 'إسفنج عالي الكثافة، 5 سم',
    found_en: 'High-density foam, 5cm',
    found_ar: 'إسفنج عالي الكثافة، 5 سم',
    severity: null,
    arPosition:
      '-0.0034481442389183254m 0.42791326219411313m 0.1694843846040807m',
    arNormal: '-0.07658847840394971m 0.997062788883292m 1.994314990046478e-7m',
  },
]

const QualityCheck = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [scanning, setScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [activePoint, setActivePoint] = useState(null)
  const [decisions, setDecisions] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const arViewerRef = useRef(null)
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  const matchCount = comparisonPoints.filter((p) => p.status === 'match').length
  const issueCount = comparisonPoints.filter(
    (p) => p.status === 'mismatch'
  ).length
  const matchPct = Math.round((matchCount / comparisonPoints.length) * 100)

  useEffect(() => {
    if (scanning) {
      const t = setTimeout(() => {
        setScanning(false)
        setScanComplete(true)
      }, 2800)
      return () => clearTimeout(t)
    }
  }, [scanning])

  const handleStartScan = () => {
    setScanning(true)
    setScanComplete(false)
  }

  const handleLaunchAR = () => {
    if (arViewerRef.current && arViewerRef.current.canActivateAR) {
      arViewerRef.current.activateAR()
    } else {
      alert(
        isAr
          ? 'الواقع المعزز يعمل على الجوال فقط'
          : 'AR works on mobile devices only'
      )
    }
  }

  const handleDecision = (pointId, decision) => {
    setDecisions({ ...decisions, [pointId]: decision })
    setActivePoint(null)
  }

  const handleSubmitReport = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1500)
  }

  if (submitted) {
    return (
      <div
        className='qc-container qc-success-screen'
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          fontFamily: isAr
            ? 'Tajawal, sans-serif'
            : 'Helvetica, Arial, sans-serif',
        }}
      >
        <div className='qc-success-icon-wrap'>
          <div className='qc-success-pulse' />
          <svg width='40' height='40' viewBox='0 0 24 24' fill='#00a7e5'>
            <path d='M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' />
          </svg>
        </div>
        <h2 className='qc-success-title'>
          {isAr ? 'تم إرسال التقرير' : 'Report Submitted'}
        </h2>
        <p className='qc-success-sub'>
          {isAr
            ? 'تم إرسال تقرير فحص الجودة إلى المورد. سيتم إخطارك عند الرد.'
            : 'Quality check report sent to vendor. You will be notified when they respond.'}
        </p>
        <div className='qc-success-stats'>
          <div className='qc-success-stat'>
            <span className='qc-success-stat-num'>{matchCount}</span>
            <span className='qc-success-stat-label'>
              {isAr ? 'مطابقة' : 'Matched'}
            </span>
          </div>
          <div className='qc-success-stat qc-success-stat-issue'>
            <span className='qc-success-stat-num'>{issueCount}</span>
            <span className='qc-success-stat-label'>
              {isAr ? 'مشاكل' : 'Issues'}
            </span>
          </div>
          <div className='qc-success-stat'>
            <span className='qc-success-stat-num'>{matchPct}%</span>
            <span className='qc-success-stat-label'>
              {isAr ? 'تطابق' : 'Match'}
            </span>
          </div>
        </div>
        <button className='qc-success-cta' onClick={() => navigate('/profile')}>
          {isAr ? 'العودة للملف الشخصي' : 'Back to Profile'}
        </button>
      </div>
    )
  }

  return (
    <div
      className='qc-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='qc-bg'>
        <div className='qc-bg-1' />
        <div className='qc-bg-2' />
      </div>

      <div className='qc-topbar'>
        <button className='qc-back' onClick={() => navigate(-1)}>
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
        <div className='qc-topbar-title-wrap'>
          <span className='qc-topbar-eyebrow'>
            {isAr ? 'سيلا · فحص الجودة' : 'SELA · QUALITY CHECK'}
          </span>
          <span className='qc-topbar-title'>
            {isAr ? 'تحقق من المنتج المُسلّم' : 'Verify Delivered Product'}
          </span>
        </div>
        <div style={{ width: 22 }} />
      </div>

      <div className='qc-scroll'>
        {/* Hero comparison block */}
        <div className='qc-hero'>
          <div className='qc-hero-side'>
            <div className='qc-hero-label-wrap'>
              <span className='qc-hero-eyebrow'>
                {isAr ? 'المطلوب' : 'ORDERED'}
              </span>
              <span className='qc-hero-label'>
                {isAr ? 'النموذج المرجعي' : 'Reference Spec'}
              </span>
            </div>
            <div className='qc-model-frame'>
              <model-viewer
                src={REFERENCE_MODEL}
                alt='Reference model'
                camera-controls
                disable-zoom
                interaction-prompt='none'
                camera-orbit='0deg 80deg 2.5m'
                shadow-intensity='1'
                exposure='1'
                environment-image='neutral'
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'transparent',
                }}
              ></model-viewer>
            </div>
          </div>

          <div className='qc-hero-vs'>
            <div className='qc-hero-vs-line' />
            <div className='qc-hero-vs-badge'>VS</div>
            <div className='qc-hero-vs-line' />
          </div>

          <div className='qc-hero-side'>
            <div className='qc-hero-label-wrap'>
              <span className='qc-hero-eyebrow qc-hero-eyebrow-warn'>
                {isAr ? 'المُسلّم' : 'DELIVERED'}
              </span>
              <span className='qc-hero-label'>
                {isAr ? 'المسح بالواقع المعزز' : 'AR Scan Result'}
              </span>
            </div>
            <div className='qc-model-frame qc-model-frame-warn'>
              {scanning ? (
                <div className='qc-scan-overlay'>
                  <div className='qc-scan-line' />
                  <span>{isAr ? 'جاري المسح...' : 'Scanning...'}</span>
                </div>
              ) : (
                <model-viewer
                  src={DELIVERED_MODEL}
                  alt='Delivered model'
                  camera-controls
                  disable-zoom
                  interaction-prompt='none'
                  camera-orbit='-91.4deg 80deg 1.5m'
                  shadow-intensity='1'
                  exposure='1'
                  environment-image='neutral'
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                  }}
                ></model-viewer>
              )}
            </div>
          </div>
        </div>

        {/* Match score banner */}
        <div className='qc-score-banner'>
          <div className='qc-score-block'>
            <span className='qc-score-num'>{matchPct}%</span>
            <span className='qc-score-label'>
              {isAr ? 'معدل التطابق' : 'Match Rate'}
            </span>
          </div>
          <div className='qc-score-bar-wrap'>
            <div className='qc-score-bar' style={{ width: `${matchPct}%` }} />
          </div>
          <div className='qc-score-counts'>
            <div className='qc-score-count'>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='#00a7e5'>
                <path d='M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' />
              </svg>
              <span>
                {matchCount} {isAr ? 'مطابق' : 'matched'}
              </span>
            </div>
            <div className='qc-score-count qc-score-count-warn'>
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#ef4444'
                strokeWidth='2.5'
              >
                <circle cx='12' cy='12' r='10' />
                <line x1='12' y1='8' x2='12' y2='12' />
                <line x1='12' y1='16' x2='12.01' y2='16' />
              </svg>
              <span>
                {issueCount} {isAr ? 'مشاكل' : 'issues'}
              </span>
            </div>
          </div>
        </div>

        {/* Inspect in AR button */}
        <button className='qc-ar-btn' onClick={handleLaunchAR}>
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
            <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' />
            <polyline points='3.27 6.96 12 12.01 20.73 6.96' />
          </svg>
          {isAr
            ? 'فحص بالواقع المعزز ضد المنتج الحقيقي'
            : 'Inspect in AR against real product'}
        </button>
        <p className='qc-ar-hint'>
          {isAr
            ? 'ضع المنتج الحقيقي بجانب النموذج المرجعي ولاحظ المؤشرات'
            : 'Place real product beside the reference model and check indicators'}
        </p>

        {/* AR launcher with comparison hotspots — visible only in AR */}
        <model-viewer
          ref={arViewerRef}
          src={REFERENCE_MODEL}
          alt='AR launcher with comparison indicators'
          ar
          ar-modes='webxr scene-viewer quick-look'
          camera-orbit='0deg 80deg 2.2m'
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
          {comparisonPoints.map((p, i) => (
            <button
              key={p.id}
              slot={`hotspot-qc-${i + 1}`}
              data-position={p.arPosition}
              data-normal={p.arNormal}
              data-visibility-attribute='visible'
              className={`qc-ar-hotspot ${
                p.status === 'match'
                  ? 'qc-ar-hotspot-match'
                  : 'qc-ar-hotspot-issue'
              }`}
            >
              <span className='qc-ar-hotspot-icon'>
                {p.status === 'match' ? '✓' : '!'}
              </span>
              <span className='qc-ar-hotspot-label'>
                {p.status === 'match'
                  ? isAr
                    ? `✓ ${p.part_ar}`
                    : `✓ ${p.part_en}`
                  : isAr
                    ? `! ${p.part_ar}`
                    : `! ${p.part_en}`}
              </span>
            </button>
          ))}
        </model-viewer>

        {/* Comparison points list */}
        <div className='qc-section'>
          <div className='qc-section-header'>
            <h2 className='qc-section-title'>
              {isAr ? 'نقاط التحقق' : 'Verification Points'}
            </h2>
            <button
              className='qc-rescan-btn'
              onClick={handleStartScan}
              disabled={scanning}
            >
              <svg
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M3 12a9 9 0 1 0 3-6.7L3 8' />
                <polyline points='3 3 3 8 8 8' />
              </svg>
              {isAr ? 'إعادة المسح' : 'Rescan'}
            </button>
          </div>

          <div className='qc-points-list'>
            {comparisonPoints.map((point, i) => {
              const isMismatch = point.status === 'mismatch'
              const decision = decisions[point.id]
              return (
                <div
                  key={point.id}
                  className={`qc-point-card ${
                    isMismatch ? 'qc-point-card-issue' : 'qc-point-card-match'
                  } ${decision ? 'qc-point-decided' : ''}`}
                  onClick={() =>
                    setActivePoint(activePoint?.id === point.id ? null : point)
                  }
                >
                  <div className='qc-point-header'>
                    <div className='qc-point-num'>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className='qc-point-title-wrap'>
                      <span className='qc-point-title'>
                        {isAr ? point.part_ar : point.part_en}
                      </span>
                      <span
                        className={`qc-point-status ${
                          isMismatch
                            ? 'qc-point-status-issue'
                            : 'qc-point-status-match'
                        }`}
                      >
                        {isMismatch ? (
                          <>
                            <svg
                              width='10'
                              height='10'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='3'
                              strokeLinecap='round'
                            >
                              <line x1='12' y1='8' x2='12' y2='12' />
                              <line x1='12' y1='16' x2='12.01' y2='16' />
                            </svg>
                            {isAr ? 'مشكلة' : 'Issue'}
                          </>
                        ) : (
                          <>
                            <svg
                              width='10'
                              height='10'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='3'
                              strokeLinecap='round'
                            >
                              <polyline points='20 6 9 17 4 12' />
                            </svg>
                            {isAr ? 'مطابق' : 'Match'}
                          </>
                        )}
                      </span>
                    </div>
                    <svg
                      width='14'
                      height='14'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#6b7280'
                      strokeWidth='2'
                      strokeLinecap='round'
                      style={{
                        transform:
                          activePoint?.id === point.id
                            ? 'rotate(180deg)'
                            : 'none',
                        transition: 'transform 0.2s',
                      }}
                    >
                      <polyline points='6 9 12 15 18 9' />
                    </svg>
                  </div>

                  {activePoint?.id === point.id && (
                    <div className='qc-point-body'>
                      <div className='qc-point-row'>
                        <span className='qc-point-row-label'>
                          {isAr ? 'المطلوب:' : 'Expected:'}
                        </span>
                        <span className='qc-point-row-value'>
                          {isAr ? point.expected_ar : point.expected_en}
                        </span>
                      </div>
                      <div className='qc-point-row'>
                        <span className='qc-point-row-label'>
                          {isAr ? 'المُسلّم:' : 'Found:'}
                        </span>
                        <span
                          className={`qc-point-row-value ${
                            isMismatch ? 'qc-point-row-value-warn' : ''
                          }`}
                        >
                          {isAr ? point.found_ar : point.found_en}
                        </span>
                      </div>

                      {isMismatch && (
                        <div className='qc-point-actions'>
                          <button
                            className={`qc-point-decision ${
                              decision === 'accept'
                                ? 'qc-point-decision-active'
                                : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDecision(point.id, 'accept')
                            }}
                          >
                            {isAr ? 'قبول مع الفرق' : 'Accept Anyway'}
                          </button>
                          <button
                            className={`qc-point-decision qc-point-decision-reject ${
                              decision === 'reject'
                                ? 'qc-point-decision-reject-active'
                                : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDecision(point.id, 'reject')
                            }}
                          >
                            {isAr ? 'الإبلاغ كمشكلة' : 'Report Issue'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className='qc-footer-actions'>
          <button
            className='qc-submit-btn'
            onClick={handleSubmitReport}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className='qc-submit-spinner' />
                {isAr ? 'جاري الإرسال...' : 'Submitting...'}
              </>
            ) : (
              <>
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
                  <line x1='22' y1='2' x2='11' y2='13' />
                  <polygon points='22 2 15 22 11 13 2 9 22 2' />
                </svg>
                {isAr ? 'إرسال التقرير للمورد' : 'Submit Report to Vendor'}
              </>
            )}
          </button>
          <p className='qc-footer-note'>
            {isAr
              ? 'سيتم إخطار المورد بالنتائج خلال 24 ساعة'
              : 'Vendor will be notified within 24 hours'}
          </p>
        </div>

        <div style={{ height: '90px' }} />
      </div>
    </div>
  )
}

export default QualityCheck
