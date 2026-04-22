import './MatchModal.css'

const MatchModal = ({
  open,
  onClose,
  score,
  factors,
  entityName,
  entityType = 'vendor',
  isAr = false,
}) => {
  if (!open) return null

  const scoreClass =
    score >= 90
      ? 'mm-score-high'
      : score >= 70
        ? 'mm-score-mid'
        : 'mm-score-low'
  const scoreLabel =
    score >= 90
      ? isAr
        ? 'تطابق ممتاز'
        : 'Excellent match'
      : score >= 70
        ? isAr
          ? 'تطابق جيد'
          : 'Good match'
        : isAr
          ? 'تطابق متوسط'
          : 'Moderate match'

  const renderFactorIcon = (status) => {
    if (status === 'positive') {
      return (
        <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
          <circle cx='12' cy='12' r='10' fill='#10B981' />
          <path
            d='M8 12l3 3 5-6'
            stroke='#cccccc'
            strokeWidth='2.4'
            strokeLinecap='round'
            strokeLinejoin='round'
            fill='none'
          />
        </svg>
      )
    }
    if (status === 'partial') {
      return (
        <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
          <circle cx='12' cy='12' r='10' fill='#FFA500' />
          <line
            x1='12'
            y1='7'
            x2='12'
            y2='13'
            stroke='#cccccc'
            strokeWidth='2.4'
            strokeLinecap='round'
          />
          <circle cx='12' cy='16.5' r='1.1' fill='#cccccc' />
        </svg>
      )
    }
    return (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
        <circle cx='12' cy='12' r='10' fill='#6b7280' />
        <line
          x1='7'
          y1='12'
          x2='17'
          y2='12'
          stroke='#cccccc'
          strokeWidth='2.4'
          strokeLinecap='round'
        />
      </svg>
    )
  }

  return (
    <div
      className='mm-overlay'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-label='Match explanation'
    >
      <div
        className='mm-sheet'
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className='mm-handle' />

        <div className='mm-header'>
          <div className={`mm-score-circle ${scoreClass}`}>
            <span className='mm-score-num'>{score}</span>
            <span className='mm-score-pct'>%</span>
          </div>
          <div className='mm-header-text'>
            <span className='mm-title'>
              {isAr ? `لماذا هذا التطابق ${score}%؟` : `Why ${score}% Match?`}
            </span>
            <span className='mm-subtitle'>
              {scoreLabel} · {entityName}
            </span>
          </div>
          <button className='mm-close' onClick={onClose} aria-label='Close'>
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
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </button>
        </div>

        <div className='mm-progress-wrap'>
          <div className='mm-progress-track'>
            <div
              className={`mm-progress-fill ${scoreClass}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className='mm-progress-sub'>
            {isAr
              ? `تم حسابه من ${factors.length} عوامل`
              : `Calculated from ${factors.length} factors`}
          </span>
        </div>

        <div className='mm-factors-label'>
          {isAr ? 'عوامل التطابق' : 'Match Factors'}
        </div>

        <div className='mm-factors'>
          {factors.map((f, i) => (
            <div key={i} className={`mm-factor mm-factor-${f.status}`}>
              <div className='mm-factor-icon'>{renderFactorIcon(f.status)}</div>
              <div className='mm-factor-body'>
                <div className='mm-factor-top'>
                  <span className='mm-factor-name'>
                    {isAr ? f.name_ar : f.name_en}
                  </span>
                  <span className='mm-factor-weight'>+{f.weight}%</span>
                </div>
                <span className='mm-factor-detail'>
                  {isAr ? f.detail_ar : f.detail_en}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className='mm-hint'>
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#00a7e5'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='12' y1='16' x2='12' y2='12' />
            <line x1='12' y1='8' x2='12.01' y2='8' />
          </svg>
          <span>
            {isAr
              ? 'درجات التطابق محدثة كل يوم بناء على نشاطك'
              : 'Match scores update daily based on your activity'}
          </span>
        </div>

        <button className='mm-cta' onClick={onClose}>
          {isAr ? 'فهمت' : 'Got it'}
        </button>
      </div>
    </div>
  )
}

export const buildVendorFactors = (
  vendor,
  vp,
  gov,
  cat,
  buyerPrefs = {},
  isAr = false
) => {
  const factors = []

  if (cat) {
    factors.push({
      name_en: 'Category Match',
      name_ar: 'تطابق الفئة',
      detail_en: `${cat.name_en} matches your preferences`,
      detail_ar: `${cat.name_ar} يطابق تفضيلاتك`,
      weight: 25,
      status: 'positive',
    })
  }

  if (gov) {
    factors.push({
      name_en: 'Location',
      name_ar: 'الموقع',
      detail_en: `${gov.name_en}, Egypt — serves your region`,
      detail_ar: `${gov.name_ar}، مصر — يخدم منطقتك`,
      weight: 20,
      status: 'positive',
    })
  }

  if (vendor?.is_verified) {
    factors.push({
      name_en: 'Verified Business',
      name_ar: 'شركة موثقة',
      detail_en: 'Tax ID and license verified by SELA',
      detail_ar: 'الرقم الضريبي والترخيص موثقان من سيلا',
      weight: 15,
      status: 'positive',
    })
  }

  const rating = vp?.avg_rating ?? 4.5
  if (rating >= 4.5) {
    factors.push({
      name_en: 'Top-Rated',
      name_ar: 'تقييم عالي',
      detail_en: `${rating.toFixed(1)}/5.0 from ${vp?.total_reviews ?? 100}+ reviews`,
      detail_ar: `${rating.toFixed(1)}/5.0 من ${vp?.total_reviews ?? 100}+ تقييماً`,
      weight: 15,
      status: 'positive',
    })
  } else if (rating >= 3.5) {
    factors.push({
      name_en: 'Good Reputation',
      name_ar: 'سمعة جيدة',
      detail_en: `${rating.toFixed(1)}/5.0 average rating`,
      detail_ar: `${rating.toFixed(1)}/5.0 متوسط التقييم`,
      weight: 8,
      status: 'partial',
    })
  }

  const responseHrs = vp?.avg_response_hours ?? 4
  if (responseHrs <= 4) {
    factors.push({
      name_en: 'Fast Response',
      name_ar: 'استجابة سريعة',
      detail_en: `Typically responds within ${responseHrs} hours`,
      detail_ar: `يستجيب عادة خلال ${responseHrs} ساعات`,
      weight: 10,
      status: 'positive',
    })
  } else {
    factors.push({
      name_en: 'Average Response',
      name_ar: 'استجابة متوسطة',
      detail_en: `Typically responds within ${responseHrs} hours`,
      detail_ar: `يستجيب عادة خلال ${responseHrs} ساعات`,
      weight: 4,
      status: 'partial',
    })
  }

  const onTime = vp?.on_time_delivery_percent ?? 90
  if (onTime >= 95) {
    factors.push({
      name_en: 'Reliable Delivery',
      name_ar: 'تسليم موثوق',
      detail_en: `${onTime}% on-time delivery rate`,
      detail_ar: `${onTime}% معدل التسليم في الوقت`,
      weight: 10,
      status: 'positive',
    })
  } else if (onTime >= 80) {
    factors.push({
      name_en: 'Delivery Track Record',
      name_ar: 'سجل التسليم',
      detail_en: `${onTime}% on-time delivery rate`,
      detail_ar: `${onTime}% معدل التسليم في الوقت`,
      weight: 5,
      status: 'partial',
    })
  }

  const completedProjects = vp?.completed_projects ?? 0
  if (completedProjects >= 50) {
    factors.push({
      name_en: 'Proven Experience',
      name_ar: 'خبرة مثبتة',
      detail_en: `${completedProjects}+ completed projects`,
      detail_ar: `${completedProjects}+ مشروعاً مكتملاً`,
      weight: 5,
      status: 'positive',
    })
  }

  return factors
}

export const buildNeedFactors = (need, vendorProfile = {}, isAr = false) => {
  const factors = []

  factors.push({
    name_en: 'Category Alignment',
    name_ar: 'تطابق الفئة',
    detail_en: 'Matches your service categories',
    detail_ar: 'يطابق فئات خدماتك',
    weight: 25,
    status: 'positive',
  })

  const budget = need?.budget_max_egp || 100000
  if (budget >= 50000) {
    factors.push({
      name_en: 'Budget Fit',
      name_ar: 'ملاءمة الميزانية',
      detail_en: `EGP ${(budget / 1000).toFixed(0)}K is within your typical range`,
      detail_ar: `${(budget / 1000).toFixed(0)}K جنيه ضمن نطاقك المعتاد`,
      weight: 20,
      status: 'positive',
    })
  } else {
    factors.push({
      name_en: 'Below Usual Budget',
      name_ar: 'أقل من الميزانية المعتادة',
      detail_en: `EGP ${(budget / 1000).toFixed(0)}K is below your typical projects`,
      detail_ar: `${(budget / 1000).toFixed(0)}K جنيه أقل من مشاريعك المعتادة`,
      weight: 8,
      status: 'partial',
    })
  }

  factors.push({
    name_en: 'Regional Coverage',
    name_ar: 'التغطية الإقليمية',
    detail_en: 'Location is in your delivery regions',
    detail_ar: 'الموقع ضمن مناطق التسليم الخاصة بك',
    weight: 20,
    status: 'positive',
  })

  factors.push({
    name_en: 'Timeline',
    name_ar: 'الجدول الزمني',
    detail_en: 'Deadline fits your current capacity',
    detail_ar: 'الموعد النهائي يناسب قدرتك الحالية',
    weight: 15,
    status: 'positive',
  })

  factors.push({
    name_en: 'Buyer Activity',
    name_ar: 'نشاط المشتري',
    detail_en: 'Active account, responds to proposals',
    detail_ar: 'حساب نشط، يستجيب للعروض',
    weight: 10,
    status: 'positive',
  })

  return factors
}

export default MatchModal
