import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import BottomNav from '../../components/BottomNav/BottomNav'
import Preloader from '../../components/Preloader/Preloader'
import './MyProposals.css'

const DEMO_VENDOR_ID = 'a0000000-0000-0000-0000-000000000002'

const FALLBACK_PROPOSALS = [
  {
    id: 'fb-1',
    title_en: 'Steel Frame Supply — New Cairo Tower',
    title_ar: 'توريد هياكل فولاذية — برج القاهرة الجديدة',
    buyer_en: 'Masr Construction Co.',
    buyer_ar: 'شركة مصر للإنشاءات',
    vendor_company_id: 1,
    status: 'accepted',
    stage: 3,
    total_stages: 3,
    stage_label_en: 'Proposal reviewed',
    stage_label_ar: 'تمت مراجعة العرض',
    tags_en: ['Construction', 'Cairo', 'Industrial'],
    tags_ar: ['البناء', 'القاهرة', 'صناعي'],
    submitted_en: '3 Feb 2025',
    submitted_ar: '3 فبراير 2025',
    amount: 320000,
  },
  {
    id: 'fb-2',
    title_en: 'Cement Supply — 6th October Project',
    title_ar: 'توريد أسمنت — مشروع 6 أكتوبر',
    buyer_en: 'AlNour Developers',
    buyer_ar: 'النور للتطوير',
    vendor_company_id: 2,
    status: 'pending',
    stage: 1,
    total_stages: 3,
    stage_label_en: 'Awaiting buyer review',
    stage_label_ar: 'بانتظار مراجعة المشتري',
    tags_en: ['Construction', '6th October'],
    tags_ar: ['البناء', '6 أكتوبر'],
    submitted_en: '10 Feb 2025',
    submitted_ar: '10 فبراير 2025',
    amount: 185000,
  },
  {
    id: 'fb-3',
    title_en: 'Electrical Wiring — Heliopolis Compound',
    title_ar: 'توصيلات كهربائية — مجمع مصر الجديدة',
    buyer_en: 'Helios Real Estate',
    buyer_ar: 'هيليوس العقارية',
    vendor_company_id: 3,
    status: 'pending',
    stage: 2,
    total_stages: 3,
    stage_label_en: 'Under consideration',
    stage_label_ar: 'قيد الدراسة',
    tags_en: ['Energy', 'Heliopolis'],
    tags_ar: ['الطاقة', 'مصر الجديدة'],
    submitted_en: '14 Feb 2025',
    submitted_ar: '14 فبراير 2025',
    amount: 97500,
  },
  {
    id: 'fb-4',
    title_en: 'HVAC Installation — Maadi Office Block',
    title_ar: 'تركيب تكييف — برج مكاتب المعادي',
    buyer_en: 'Delta Facilities',
    buyer_ar: 'دلتا للمرافق',
    vendor_company_id: 4,
    status: 'rejected',
    stage: null,
    total_stages: null,
    stage_label_en: null,
    stage_label_ar: null,
    tags_en: ['Facilities', 'Maadi'],
    tags_ar: ['المرافق', 'المعادي'],
    submitted_en: '5 Jan 2025',
    submitted_ar: '5 يناير 2025',
    amount: 210000,
  },
  {
    id: 'fb-5',
    title_en: 'Office Furniture — Smart Village',
    title_ar: 'أثاث مكاتب — القرية الذكية',
    buyer_en: 'Nile Tech Hub',
    buyer_ar: 'نايل تك هاب',
    vendor_company_id: 5,
    status: 'pending',
    stage: 1,
    total_stages: 3,
    stage_label_en: 'Awaiting buyer review',
    stage_label_ar: 'بانتظار مراجعة المشتري',
    tags_en: ['Furniture', 'Smart Village'],
    tags_ar: ['الأثاث', 'القرية الذكية'],
    submitted_en: '12 Feb 2025',
    submitted_ar: '12 فبراير 2025',
    amount: 75000,
  },
  {
    id: 'fb-6',
    title_en: 'IT Equipment — Zamalek HQ',
    title_ar: 'معدات IT — مقر الزمالك',
    buyer_en: 'Orion Group',
    buyer_ar: 'مجموعة أوريون',
    vendor_company_id: 6,
    status: 'accepted',
    stage: 3,
    total_stages: 3,
    stage_label_en: 'Proposal reviewed',
    stage_label_ar: 'تمت مراجعة العرض',
    tags_en: ['Technology', 'Zamalek'],
    tags_ar: ['التكنولوجيا', 'الزمالك'],
    submitted_en: '28 Jan 2025',
    submitted_ar: '28 يناير 2025',
    amount: 142000,
  },
  {
    id: 'fb-7',
    title_en: 'Plumbing Work — Nasr City Mall',
    title_ar: 'أعمال سباكة — مول مدينة نصر',
    buyer_en: 'Retail Masters',
    buyer_ar: 'ماسترز للتجزئة',
    vendor_company_id: 7,
    status: 'rejected',
    stage: null,
    total_stages: null,
    stage_label_en: null,
    stage_label_ar: null,
    tags_en: ['Construction', 'Nasr City'],
    tags_ar: ['البناء', 'مدينة نصر'],
    submitted_en: '20 Dec 2024',
    submitted_ar: '20 ديسمبر 2024',
    amount: 58000,
  },
  {
    id: 'fb-8',
    title_en: 'Solar Panels — New Capital Villa',
    title_ar: 'ألواح شمسية — فيلا العاصمة الإدارية',
    buyer_en: 'Eco Homes',
    buyer_ar: 'إيكو هومز',
    vendor_company_id: 8,
    status: 'rejected',
    stage: null,
    total_stages: null,
    stage_label_en: null,
    stage_label_ar: null,
    tags_en: ['Energy', 'New Capital'],
    tags_ar: ['الطاقة', 'العاصمة الإدارية'],
    submitted_en: '15 Dec 2024',
    submitted_ar: '15 ديسمبر 2024',
    amount: 165000,
  },
]

const MyProposals = () => {
  const navigate = useNavigate()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  useEffect(() => {
    const fetchProposals = async () => {
      const { data } = await supabase
        .from('proposals')
        .select('*')
        .eq('vendor_company_id', DEMO_VENDOR_ID)
        .order('created_at', { ascending: false })
        .limit(30)

      if (data && data.length > 0) {
        const mapped = data.map((p) => ({
          id: p.id,
          title_en: p.title_en,
          title_ar: p.title_ar,
          buyer_en: 'Buyer',
          buyer_ar: 'المشتري',
          vendor_company_id: p.buyer_company_id,
          status: p.status,
          stage: p.stage,
          total_stages: 3,
          stage_label_en: p.status === 'accepted' ? 'Proposal reviewed' : p.status === 'pending' ? 'Under review' : null,
          stage_label_ar: p.status === 'accepted' ? 'تمت مراجعة العرض' : p.status === 'pending' ? 'قيد المراجعة' : null,
          tags_en: [],
          tags_ar: [],
          submitted_en: new Date(p.created_at).toLocaleDateString('en-GB'),
          submitted_ar: new Date(p.created_at).toLocaleDateString('ar-EG'),
          amount: p.amount_egp,
        }))
        setProposals([...mapped, ...FALLBACK_PROPOSALS])
      } else {
        setProposals(FALLBACK_PROPOSALS)
      }
      setLoading(false)
    }
    fetchProposals()
  }, [])

  const counts = {
    all: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  }

  const getFiltered = () => {
    let list = activeTab === 'all' ? proposals : proposals.filter(p => p.status === activeTab)
    if (sortBy === 'newest') {
      list = [...list].sort((a, b) => new Date(b.submitted_en) - new Date(a.submitted_en))
    } else if (sortBy === 'oldest') {
      list = [...list].sort((a, b) => new Date(a.submitted_en) - new Date(b.submitted_en))
    } else if (sortBy === 'amount_high') {
      list = [...list].sort((a, b) => b.amount - a.amount)
    } else if (sortBy === 'amount_low') {
      list = [...list].sort((a, b) => a.amount - b.amount)
    }
    return list
  }

  const filtered = getFiltered()

  const openVendor = (proposal) => {
    if (proposal.vendor_company_id) {
      navigate(`/vendor/${proposal.vendor_company_id}`)
    }
  }

  const sortLabel = () => {
    if (sortBy === 'newest') return isAr ? 'الأحدث' : 'Newest first'
    if (sortBy === 'oldest') return isAr ? 'الأقدم' : 'Oldest first'
    if (sortBy === 'amount_high') return isAr ? 'أعلى قيمة' : 'Amount ↓'
    return isAr ? 'أقل قيمة' : 'Amount ↑'
  }

  if (loading) return <Preloader />

  return (
    <div className='mp-container' dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Tajawal, sans-serif' : 'Helvetica, Arial, sans-serif' }}>

      <div className='mp-bg'>
        <div className='mp-bg-1' />
        <div className='mp-bg-2' />
      </div>

      <div className='mp-scroll'>

        <div className='mp-topbar'>
          <button className='mp-back' onClick={() => navigate(-1)}>
            <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M19 12H5'/><polyline points='12 19 5 12 12 5'/>
            </svg>
          </button>
          <div className='mp-topbar-text'>
            <h1 className='mp-topbar-title'>{isAr ? 'عروضي' : 'My Proposals'}</h1>
            <span className='mp-topbar-sub'>{isAr ? 'للقراءة فقط · قدّم عبر الويب' : 'Read-only · Submit on web'}</span>
          </div>
          <button className='mp-icon-btn' onClick={() => navigate('/search')}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
            </svg>
          </button>
        </div>

        <div className='mp-tabs'>
          {['all', 'pending', 'accepted', 'rejected'].map((t) => (
            <button
              key={t}
              className={`mp-tab ${activeTab === t ? 'mp-tab-active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              <span>
                {t === 'all' ? (isAr ? 'الكل' : 'All') :
                 t === 'pending' ? (isAr ? 'قيد المراجعة' : 'Pending') :
                 t === 'accepted' ? (isAr ? 'مقبول' : 'Accepted') :
                 (isAr ? 'مرفوض' : 'Rejected')}
              </span>
              <span className='mp-tab-badge'>{counts[t]}</span>
            </button>
          ))}
        </div>

        <div className='mp-info-banner'>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <circle cx='12' cy='12' r='10'/>
            <line x1='12' y1='16' x2='12' y2='12'/>
            <line x1='12' y1='8' x2='12.01' y2='8'/>
          </svg>
          <span className='mp-info-text'>
            {isAr ? (<>لـ <span className='mp-info-link'>تقديم أو سحب</span> العروض، استخدم سيلا على الويب.</>) :
                    (<>To <span className='mp-info-link'>submit or withdraw</span> proposals, visit SELA on desktop.</>)}
          </span>
        </div>

        <div className='mp-meta-row'>
          <span className='mp-count-text'>
            {filtered.length} {isAr ? (filtered.length === 1 ? 'عرض' : 'عروض') : (filtered.length === 1 ? 'proposal' : 'proposals')}
          </span>
          <div className='mp-sort-wrap'>
            <button className='mp-sort-btn' onClick={() => setShowSortMenu(!showSortMenu)}>
              <span>{sortLabel()}</span>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <polyline points='6 9 12 15 18 9'/>
              </svg>
            </button>
            {showSortMenu && (
              <>
                <div className='mp-sort-backdrop' onClick={() => setShowSortMenu(false)} />
                <div className='mp-sort-dropdown'>
                  {[
                    { id: 'newest', en: 'Newest first', ar: 'الأحدث' },
                    { id: 'oldest', en: 'Oldest first', ar: 'الأقدم' },
                    { id: 'amount_high', en: 'Amount ↓', ar: 'أعلى قيمة' },
                    { id: 'amount_low', en: 'Amount ↑', ar: 'أقل قيمة' },
                  ].map((o) => (
                    <button
                      key={o.id}
                      className={`mp-sort-item ${sortBy === o.id ? 'mp-sort-item-active' : ''}`}
                      onClick={() => { setSortBy(o.id); setShowSortMenu(false) }}
                    >
                      {isAr ? o.ar : o.en}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className='mp-empty'>
            <div className='mp-empty-icon'>
              <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/>
                <polyline points='14 2 14 8 20 8'/>
              </svg>
            </div>
            <h2 className='mp-empty-title'>
              {activeTab === 'pending' ? (isAr ? 'لا توجد عروض معلقة' : 'No Pending Proposals') :
               activeTab === 'accepted' ? (isAr ? 'لا توجد عروض مقبولة' : 'No Accepted Proposals') :
               activeTab === 'rejected' ? (isAr ? 'لا توجد عروض مرفوضة' : 'No Rejected Proposals') :
               (isAr ? 'لا توجد عروض' : 'No Proposals Yet')}
            </h2>
            <p className='mp-empty-sub'>{isAr ? 'قدم عروضك عبر موقع سيلا على الويب' : 'Submit proposals via SELA on desktop'}</p>
          </div>
        )}

        <div className='mp-list'>
          {filtered.map((p) => {
            const statusClass = p.status === 'accepted' ? 'mp-st-accepted' :
                                p.status === 'pending' ? 'mp-st-pending' :
                                'mp-st-rejected'
            const statusLabel = p.status === 'accepted' ? (isAr ? 'مقبول' : 'Accepted') :
                                p.status === 'pending' ? (isAr ? 'معلق' : 'Pending') :
                                (isAr ? 'مرفوض' : 'Rejected')
            const progressPct = p.stage && p.total_stages ? (p.stage / p.total_stages) * 100 : 0
            const progressColor = p.status === 'accepted' ? '#10B981' : p.status === 'pending' && p.stage === 1 ? '#FFA500' : '#00a7e5'

            return (
              <div key={p.id} className='mp-card' onClick={() => openVendor(p)}>
                <div className='mp-card-top'>
                  <div className='mp-card-text'>
                    <span className='mp-card-title'>{isAr ? p.title_ar : p.title_en}</span>
                    <span className='mp-card-buyer'>
                      {isAr ? 'المشتري: ' : 'Buyer: '}{isAr ? p.buyer_ar : p.buyer_en}
                    </span>
                  </div>
                  <span className={`mp-status-badge ${statusClass}`}>{statusLabel}</span>
                </div>

                {p.stage && p.total_stages && (
                  <>
                    <div className='mp-progress-row'>
                      <span className='mp-stage-label'>{isAr ? p.stage_label_ar : p.stage_label_en}</span>
                      <span className='mp-stage-count'>{isAr ? `المرحلة ${p.stage}/${p.total_stages}` : `Stage ${p.stage}/${p.total_stages}`}</span>
                    </div>
                    <div className='mp-progress-track'>
                      <div className='mp-progress-fill' style={{ width: `${progressPct}%`, background: progressColor }} />
                    </div>
                  </>
                )}

                {((isAr ? p.tags_ar : p.tags_en) || []).length > 0 && (
                  <div className='mp-tags-row'>
                    {(isAr ? p.tags_ar : p.tags_en).map((t, i) => (
                      <span key={i} className='mp-tag'>{t}</span>
                    ))}
                  </div>
                )}

                <div className='mp-card-bottom'>
                  <span className='mp-submitted'>
                    {isAr ? 'تم التقديم ' : 'Submitted '}{isAr ? p.submitted_ar : p.submitted_en}
                  </span>
                  <div className='mp-amount-wrap'>
                    <span className='mp-amount'>EGP {p.amount.toLocaleString()}</span>
                    <span className='mp-amount-sub'>{isAr ? 'مقترح' : 'proposed'}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ height: '90px' }} />
      </div>

      <BottomNav />
    </div>
  )
}

export default MyProposals
