import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabase'
import './NeedDetails.css'

const NeedDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [need, setNeed] = useState(null)
  const [company, setCompany] = useState(null)
  const [matchScore, setMatchScore] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [similarNeeds, setSimilarNeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [descExpanded, setDescExpanded] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveAnim, setSaveAnim] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  useEffect(() => {
    const fetchData = async () => {
      const { data: needData } = await supabase
        .from('needs')
        .select(`*, categories(name_en, name_ar), governorates(name_en, name_ar)`)
        .eq('id', id)
        .single()

      if (!needData) { setLoading(false); return }
      setNeed(needData)

      const { data: companyData } = await supabase
        .from('companies')
        .select(`*, buyer_profiles(*), governorates(name_en, name_ar)`)
        .eq('id', needData.buyer_company_id)
        .single()
      setCompany(companyData)

      const { data: scoreData } = await supabase
        .from('match_scores')
        .select('score_percentage')
        .eq('need_id', id)
        .order('score_percentage', { ascending: false })
        .limit(1)
      if (scoreData && scoreData.length > 0) setMatchScore(scoreData[0].score_percentage)

      const { data: attachData } = await supabase
        .from('attachments')
        .select('*')
        .eq('entity_type', 'need')
        .eq('entity_id', id)
      setAttachments(attachData || [])

      const { data: similarData } = await supabase
        .from('needs')
        .select(`*, companies(name_en, logo_url)`)
        .eq('status', 'open')
        .eq('category_id', needData.category_id)
        .neq('id', id)
        .limit(3)
      setSimilarNeeds(similarData || [])

      setLoading(false)
    }
    fetchData()
  }, [id])

  const getDaysLeft = (deadline) => {
    if (!deadline) return null
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const getTimeAgo = (date) => {
    const diff = (new Date() - new Date(date)) / 1000
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const getFileType = (name) => {
    if (!name) return 'file'
    if (name.endsWith('.usdz') || name.endsWith('.glb') || name.endsWith('.gltf')) return 'ar'
    return 'file'
  }

  const handleSave = async () => {
    setSaved(!saved)
    setSaveAnim(true)
    setTimeout(() => setSaveAnim(false), 400)
    if (!saved) {
      await supabase.from('saved_items').insert([{
        user_id: 'a0000000-0000-0000-0000-000000000002',
        entity_type: 'need',
        entity_id: parseInt(id),
        folder_label_en: 'Saved Needs',
        folder_label_ar: 'الطلبات المحفوظة'
      }])
    } else {
      await supabase.from('saved_items')
        .delete()
        .eq('entity_type', 'need')
        .eq('entity_id', parseInt(id))
    }
  }

  if (loading) return <div className='nd-loading'><div className='nd-pulse' /></div>
  if (!need) return <div className='nd-loading'><p style={{ color: '#b0b0b0' }}>Need not found</p></div>

  const title = isAr ? need.title_ar : need.title_en
  const description = isAr ? need.description_ar : need.description_en
  const category = isAr ? need.categories?.name_ar : need.categories?.name_en
  const location = isAr ? need.governorates?.name_ar : need.governorates?.name_en
  const companyName = isAr ? company?.name_ar : company?.name_en
  const companyLocation = isAr ? company?.governorates?.name_ar : company?.governorates?.name_en
  const daysLeft = getDaysLeft(need.deadline)

  const requirements = [
    isAr ? 'توصيل سريع مطلوب' : 'Fast delivery required',
    isAr ? 'التركيب مشمول' : 'Installation included',
    isAr ? 'ضمان سنتين على الأقل' : '2-year warranty minimum',
    isAr ? 'شهادة ارجونومية' : 'Ergonomic certification',
    isAr ? 'تعليمات التجميع' : 'Assembly instructions',
  ]

  const specs = [
    { label: isAr ? 'المادة:' : 'Material:', value: 'Wood, Metal, Fabric' },
    { label: isAr ? 'الألوان:' : 'Colors:', value: 'Neutral tones (gray, black, white)' },
    { label: isAr ? 'حجم المكتب:' : 'Desk size:', value: 'Standard (120cm × 60cm minimum)' },
    { label: isAr ? 'نوع الكرسي:' : 'Chair type:', value: 'Ergonomic with adjustable height' },
    { label: isAr ? 'التسليم:' : 'Delivery:', value: `To office location in ${location || 'Cairo'}` },
  ]

  const regularAttachments = attachments.filter(a => getFileType(a.file_name) !== 'ar')
  const arAttachments = attachments.filter(a => getFileType(a.file_name) === 'ar')

  const shareOptions = [
    {
      label: isAr ? 'نسخ الرابط' : 'Copy Link',
      icon: <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/><path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/></svg>
    },
    {
      label: isAr ? 'واتساب' : 'WhatsApp',
      icon: <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'/></svg>
    },
    {
      label: isAr ? 'بريد إلكتروني' : 'Email',
      icon: <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/><polyline points='22,6 12,13 2,6'/></svg>
    },
    {
      label: isAr ? 'رسالة' : 'Message',
      icon: <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/></svg>
    },
  ]

  return (
    <div className='nd-container' dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Tajawal, sans-serif' : 'Helvetica, Arial, sans-serif' }}>

      <div className='nd-bg'>
        <div className='nd-bg-1' />
        <div className='nd-bg-2' />
      </div>

      <div className='nd-topbar'>
        <button className='nd-back' onClick={() => navigate(-1)}>
          <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M19 12H5'/><polyline points='12 19 5 12 12 5'/>
          </svg>
        </button>
        <span className='nd-topbar-title'>{isAr ? 'تفاصيل الطلب' : 'Need Details'}</span>
        <div className='nd-topbar-actions'>
          <button className='nd-icon-btn' onClick={() => setShowShare(true)}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/>
              <line x1='8.59' y1='13.51' x2='15.42' y2='17.49'/><line x1='15.41' y1='6.51' x2='8.59' y2='10.49'/>
            </svg>
          </button>
          <button className={`nd-icon-btn ${saveAnim ? 'nd-save-anim' : ''}`} onClick={handleSave}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill={saved ? '#00a7e5' : 'none'} stroke={saved ? '#00a7e5' : 'currentColor'} strokeWidth='2'>
              <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'/>
            </svg>
          </button>
        </div>
      </div>

      <div className='nd-scroll'>

        <div className='nd-company-row'>
          {company?.logo_url ? (
            <img src={company.logo_url} alt='' className='nd-company-logo' />
          ) : (
            <div className='nd-company-logo-placeholder'>
              {(companyName || '?').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className='nd-company-info'>
            <div className='nd-company-name-row'>
              <span className='nd-company-name'>{companyName}</span>
              {company?.is_verified && (
                <svg width='15' height='15' viewBox='0 0 24 24' fill='#00a7e5'>
                  <path d='M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'/>
                </svg>
              )}
            </div>
            <div className='nd-company-sub-row'>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='2'>
                <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/>
              </svg>
              <span className='nd-company-location'>{companyLocation || 'Egypt'}</span>
            </div>
            {matchScore && (
              <div className='nd-match-badge'>
                <svg width='10' height='10' viewBox='0 0 24 24' fill='#00a7e5'>
                  <path d='M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'/>
                </svg>
                <span>{matchScore}% {isAr ? 'تطابق' : 'Match'}</span>
              </div>
            )}
          </div>
        </div>

        <div className='nd-divider' />

        <div className='nd-meta'>
          {category && <span className='nd-category-tag'>{category}</span>}
          <h1 className='nd-title'>{title}</h1>
          <div className='nd-posted-row'>
            <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='2'>
              <circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>
            </svg>
            <span className='nd-posted'>{isAr ? 'نُشر' : 'Posted'} {getTimeAgo(need.created_at)}</span>
          </div>
        </div>

        <div className='nd-info-grid'>
          <div className='nd-info-card'>
            <div className='nd-info-icon-wrap'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2'>
                <line x1='12' y1='1' x2='12' y2='23'/><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/>
              </svg>
            </div>
            <span className='nd-info-label'>{isAr ? 'الميزانية' : 'Budget'}</span>
            <span className='nd-info-value'>
              {need.budget_min && need.budget_max_egp
                ? `EGP ${Number(need.budget_min).toLocaleString()} - ${Number(need.budget_max_egp).toLocaleString()}`
                : 'TBD'}
            </span>
            {need.unit && <span className='nd-info-sub'>{isAr ? 'لكل' : 'Per'} {need.unit}</span>}
          </div>

          <div className='nd-info-card'>
            <div className='nd-info-icon-wrap'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2'>
                <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/>
              </svg>
            </div>
            <span className='nd-info-label'>{isAr ? 'الكمية' : 'Quantity'}</span>
            <span className='nd-info-value'>{need.quantity} {need.unit}</span>
          </div>

          <div className='nd-info-card'>
            <div className='nd-info-icon-wrap'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#FFA500' strokeWidth='2'>
                <circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>
              </svg>
            </div>
            <span className='nd-info-label'>{isAr ? 'موعد التقديم' : 'Proposal Deadline'}</span>
            <span className='nd-info-value'>{daysLeft !== null ? `${daysLeft} ${isAr ? 'يوم' : 'days left'}` : 'TBD'}</span>
            {need.deadline && <span className='nd-info-sub'>{new Date(need.deadline).toLocaleDateString()}</span>}
          </div>

          <div className='nd-info-card'>
            <div className='nd-info-icon-wrap'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2'>
                <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/>
                <path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>
              </svg>
            </div>
            <span className='nd-info-label'>{isAr ? 'العروض' : 'Proposals'}</span>
            <span className='nd-info-value'>{need.proposals_count || 0} {isAr ? 'عرض' : 'submitted'}</span>
            <span className='nd-info-sub nd-info-low'>{isAr ? 'منافسة منخفضة' : 'Low competition'}</span>
          </div>
        </div>

        <div className='nd-section'>
          <h2 className='nd-section-title'>{isAr ? 'الوصف' : 'Description'}</h2>
          <div className={`nd-desc-wrap ${descExpanded ? 'nd-desc-expanded' : ''}`}>
            <p className='nd-desc'>{description}</p>
          </div>
          <button className='nd-expand-btn' onClick={() => setDescExpanded(!descExpanded)}>
            {descExpanded ? (isAr ? '▲ عرض أقل' : '▲ Show less') : (isAr ? '▼ عرض المزيد' : '▼ Show more')}
          </button>
        </div>

        <div className='nd-section'>
          <h2 className='nd-section-title'>{isAr ? 'المتطلبات' : 'Requirements'}</h2>
          {requirements.map((req, i) => (
            <div key={i} className='nd-requirement'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='#00a7e5'>
                <path d='M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'/>
              </svg>
              <span>{req}</span>
            </div>
          ))}
        </div>

        <div className='nd-section'>
          <h2 className='nd-section-title'>{isAr ? 'المواصفات التقنية' : 'Technical Specifications'}</h2>
          <div className='nd-specs'>
            {specs.map((spec, i) => (
              <div key={i} className='nd-spec-row'>
                <span className='nd-spec-label'>{spec.label}</span>
                <span className='nd-spec-value'>{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {attachments.length > 0 && (
          <div className='nd-section'>
            <h2 className='nd-section-title'>{isAr ? 'المرفقات' : 'Attachments'}</h2>
            {regularAttachments.map((att) => (
              <div key={att.id} className='nd-attachment'>
                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2'>
                  <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/>
                  <polyline points='14 2 14 8 20 8'/>
                </svg>
                <div className='nd-att-info'>
                  <span className='nd-att-name'>{att.file_name}</span>
                  {att.file_size_bytes && (
                    <span className='nd-att-size'>{(att.file_size_bytes / (1024 * 1024)).toFixed(1)} MB</span>
                  )}
                </div>
                <button className='nd-att-download'>
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#b0b0b0' strokeWidth='2'>
                    <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/>
                    <polyline points='7 10 12 15 17 10'/><line x1='12' y1='15' x2='12' y2='3'/>
                  </svg>
                </button>
              </div>
            ))}

            {arAttachments.length > 0 && (
              <div className='nd-ar-section'>
                <div className='nd-ar-header'>
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2'>
                    <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/>
                    <polyline points='3.27 6.96 12 12.01 20.73 6.96'/><line x1='12' y1='22.08' x2='12' y2='12'/>
                  </svg>
                  <span className='nd-ar-label'>{isAr ? 'معاينة الواقع المعزز' : 'AR Preview'}</span>
                </div>
                {arAttachments.map((att) => (
                  <button key={att.id} className='nd-ar-btn'>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2'>
                      <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/>
                    </svg>
                    <div className='nd-ar-info'>
                      <span className='nd-ar-name'>{att.file_name.replace('.usdz', '').replace('.glb', '')}</span>
                      <span className='nd-ar-size'>{(att.file_size_bytes / (1024 * 1024)).toFixed(1)} MB · {att.file_name.endsWith('.usdz') ? 'iOS AR' : 'Android AR'}</span>
                    </div>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2'>
                      <circle cx='12' cy='12' r='10'/><polygon points='10 8 16 12 10 16 10 8'/>
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className='nd-section'>
          <h2 className='nd-section-title'>{isAr ? 'التسليم والجدول الزمني' : 'Delivery & Timeline'}</h2>
          <div className='nd-specs'>
            <div className='nd-spec-row'>
              <span className='nd-spec-label'>{isAr ? 'الإتمام المتوقع:' : 'Expected completion:'}</span>
              <span className='nd-spec-value'>{need.deadline ? new Date(need.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD'}</span>
            </div>
            <div className='nd-spec-row'>
              <span className='nd-spec-label'>{isAr ? 'موقع التسليم:' : 'Delivery location:'}</span>
              <span className='nd-spec-value'>{location || 'TBD'}</span>
            </div>
            <div className='nd-spec-row'>
              <span className='nd-spec-label'>{isAr ? 'وقت التسليم:' : 'Preferred time:'}</span>
              <span className='nd-spec-value'>Business hours (9AM-5PM)</span>
            </div>
          </div>
        </div>

        {company && (
          <div className='nd-section'>
            <h2 className='nd-section-title'>{isAr ? 'عن الشركة' : `About ${companyName}`}</h2>
            <p className='nd-company-about'>{isAr ? company.description_ar : company.description_en}</p>
            <div className='nd-company-stats'>
              <div className='nd-stat'>
                <span className='nd-stat-value'>{company.buyer_profiles?.total_needs_posted || 12}</span>
                <span className='nd-stat-label'>{isAr ? 'طلب منشور' : 'Needs posted'}</span>
              </div>
              <div className='nd-stat'>
                <span className='nd-stat-value'>4.6 ★</span>
                <span className='nd-stat-label'>{isAr ? 'متوسط التقييم' : 'Avg rating'}</span>
              </div>
              <div className='nd-stat'>
                <span className='nd-stat-value'>2024</span>
                <span className='nd-stat-label'>{isAr ? 'عضو منذ' : 'Member since'}</span>
              </div>
              <div className='nd-stat'>
                <span className='nd-stat-value nd-verified-text'>✓ {isAr ? 'موثق' : 'Verified'}</span>
                <span className='nd-stat-label'>{isAr ? 'الدفع موثق' : 'Payment verified'}</span>
              </div>
            </div>
          </div>
        )}

        {similarNeeds.length > 0 && (
          <div className='nd-section'>
            <h2 className='nd-section-title'>{isAr ? 'فرص مشابهة' : 'Similar Opportunities'}</h2>
            <div className='nd-similar-scroll'>
              {similarNeeds.map((s) => (
                <div key={s.id} className='nd-similar-card' onClick={() => navigate(`/need/${s.id}`)}>
                  <p className='nd-similar-title'>{isAr ? s.title_ar : s.title_en}</p>
                  <span className='nd-similar-budget'>
                    {s.budget_min && s.budget_max_egp
                      ? `EGP ${Number(s.budget_min).toLocaleString()} - ${Number(s.budget_max_egp).toLocaleString()}`
                      : 'TBD'}
                  </span>
                  {getDaysLeft(s.deadline) !== null && (
                    <span className='nd-similar-days'>{getDaysLeft(s.deadline)} {isAr ? 'يوم' : 'days left'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ height: '90px' }} />
      </div>

      <div className='nd-contact-bar'>
        <button className='nd-contact-btn' onClick={() => navigate('/messages')}>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/>
          </svg>
          {isAr ? 'تواصل مع المشتري' : 'Contact Buyer'}
        </button>
      </div>

      {showShare && (
        <div className='nd-share-overlay' onClick={() => setShowShare(false)}>
          <div className='nd-share-sheet' onClick={(e) => e.stopPropagation()}>
            <div className='nd-share-handle' />
            <p className='nd-share-title'>{isAr ? 'مشاركة الطلب' : 'Share this Need'}</p>
            {shareOptions.map((opt, i) => (
              <button key={i} className='nd-share-option' onClick={() => setShowShare(false)}>
                <span className='nd-share-icon'>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
            <button className='nd-share-cancel' onClick={() => setShowShare(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default NeedDetails