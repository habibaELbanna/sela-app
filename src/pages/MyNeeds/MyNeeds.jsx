import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import BottomNav from '../../components/BottomNav/BottomNav'
import Preloader from '../../components/Preloader/Preloader'
import './MyNeeds.css'

const DEMO_BUYER_ID = 'a0000000-0000-0000-0000-000000000001'

const FALLBACK_NEEDS = [
  {
    id: 'fb-1',
    title_en: 'Marble Flooring Supply — New Admin Capital',
    title_ar: 'توريد رخام — العاصمة الإدارية الجديدة',
    category_en: 'Construction',
    category_ar: 'البناء',
    location_en: 'New Cairo',
    location_ar: 'القاهرة الجديدة',
    budget: 400000,
    deadline_en: '1 Apr',
    deadline_ar: '1 أبريل',
    status: 'open',
    proposals: 7,
    posted_en: '8 Feb 2025',
    posted_ar: '8 فبراير 2025',
  },
  {
    id: 'fb-2',
    title_en: 'IT Infrastructure Setup — HQ Office',
    title_ar: 'تجهيز بنية IT — المقر الرئيسي',
    category_en: 'Technology',
    category_ar: 'التكنولوجيا',
    location_en: 'Dokki',
    location_ar: 'الدقي',
    budget: 150000,
    deadline_en: '20 Mar',
    deadline_ar: '20 مارس',
    status: 'open',
    proposals: 12,
    posted_en: '12 Feb 2025',
    posted_ar: '12 فبراير 2025',
  },
  {
    id: 'fb-3',
    title_en: 'Generator Rental — Site Compound',
    title_ar: 'تأجير مولد — مجمع الموقع',
    category_en: 'Energy',
    category_ar: 'الطاقة',
    location_en: '10th of Ramadan',
    location_ar: 'العاشر من رمضان',
    budget: 80000,
    deadline_en: null,
    deadline_ar: null,
    status: 'open',
    proposals: 4,
    posted_en: '15 Feb 2025',
    posted_ar: '15 فبراير 2025',
  },
  {
    id: 'fb-4',
    title_en: 'CCTV System — Warehouse Expansion',
    title_ar: 'نظام مراقبة — توسعة المستودع',
    category_en: 'Security',
    category_ar: 'الأمن',
    location_en: 'Borg El Arab',
    location_ar: 'برج العرب',
    budget: 60000,
    deadline_en: null,
    deadline_ar: null,
    status: 'fulfilled',
    proposals: 9,
    posted_en: '3 Jan 2025',
    posted_ar: '3 يناير 2025',
  },
  {
    id: 'fb-5',
    title_en: 'Catering Service — Annual Conference',
    title_ar: 'خدمة تقديم الطعام — المؤتمر السنوي',
    category_en: 'Services',
    category_ar: 'الخدمات',
    location_en: 'Cairo',
    location_ar: 'القاهرة',
    budget: 45000,
    deadline_en: null,
    deadline_ar: null,
    status: 'closed',
    proposals: 2,
    posted_en: '20 Dec 2024',
    posted_ar: '20 ديسمبر 2024',
  },
  {
    id: 'fb-6',
    title_en: 'Office Furniture — Branch Opening',
    title_ar: 'أثاث مكاتب — افتتاح فرع',
    category_en: 'Furniture',
    category_ar: 'الأثاث',
    location_en: 'Alexandria',
    location_ar: 'الإسكندرية',
    budget: 95000,
    deadline_en: null,
    deadline_ar: null,
    status: 'closed',
    proposals: 5,
    posted_en: '10 Dec 2024',
    posted_ar: '10 ديسمبر 2024',
  },
]

const MyNeeds = () => {
  const navigate = useNavigate()
  const [needs, setNeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  useEffect(() => {
    const fetchNeeds = async () => {
      const { data } = await supabase
        .from('needs')
        .select('*, governorates(name_en, name_ar), categories(name_en, name_ar)')
        .eq('buyer_company_id', DEMO_BUYER_ID)
        .order('created_at', { ascending: false })
        .limit(30)

      if (data && data.length > 0) {
        const mapped = data.map((n) => ({
          id: n.id,
          title_en: n.title_en,
          title_ar: n.title_ar,
          category_en: n.categories?.name_en,
          category_ar: n.categories?.name_ar,
          location_en: n.governorates?.name_en,
          location_ar: n.governorates?.name_ar,
          budget: n.budget_max_egp || n.budget_min_egp || 0,
          deadline_en: n.deadline ? new Date(n.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null,
          deadline_ar: n.deadline ? new Date(n.deadline).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }) : null,
          status: n.status || 'open',
          proposals: 0,
          posted_en: new Date(n.created_at).toLocaleDateString('en-GB'),
          posted_ar: new Date(n.created_at).toLocaleDateString('ar-EG'),
        }))
        setNeeds([...mapped, ...FALLBACK_NEEDS])
      } else {
        setNeeds(FALLBACK_NEEDS)
      }
      setLoading(false)
    }
    fetchNeeds()
  }, [])

  const counts = {
    all: needs.length,
    open: needs.filter(n => n.status === 'open').length,
    closed: needs.filter(n => n.status === 'closed').length,
    fulfilled: needs.filter(n => n.status === 'fulfilled').length,
  }

  const getFiltered = () => {
    let list = activeTab === 'all' ? needs : needs.filter(n => n.status === activeTab)
    if (sortBy === 'newest') {
      list = [...list].sort((a, b) => new Date(b.posted_en) - new Date(a.posted_en))
    } else if (sortBy === 'oldest') {
      list = [...list].sort((a, b) => new Date(a.posted_en) - new Date(b.posted_en))
    } else if (sortBy === 'most_proposals') {
      list = [...list].sort((a, b) => b.proposals - a.proposals)
    } else if (sortBy === 'budget_high') {
      list = [...list].sort((a, b) => b.budget - a.budget)
    }
    return list
  }

  const filtered = getFiltered()

  const openNeed = (need) => {
    navigate(`/need/${need.id}`)
  }

  const sortLabel = () => {
    if (sortBy === 'newest') return isAr ? 'الأحدث' : 'Newest first'
    if (sortBy === 'oldest') return isAr ? 'الأقدم' : 'Oldest first'
    if (sortBy === 'most_proposals') return isAr ? 'أكثر عروض' : 'Most proposals'
    return isAr ? 'أعلى ميزانية' : 'Highest budget'
  }

  if (loading) return <Preloader />

  return (
    <div className='mn-container' dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Tajawal, sans-serif' : 'Helvetica, Arial, sans-serif' }}>

      <div className='mn-bg'>
        <div className='mn-bg-1' />
        <div className='mn-bg-2' />
      </div>

      <div className='mn-scroll'>

        <div className='mn-topbar'>
          <button className='mn-back' onClick={() => navigate(-1)}>
            <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M19 12H5'/><polyline points='12 19 5 12 12 5'/>
            </svg>
          </button>
          <div className='mn-topbar-text'>
            <h1 className='mn-topbar-title'>{isAr ? 'طلباتي' : 'My Needs'}</h1>
            <span className='mn-topbar-sub'>{isAr ? 'للقراءة فقط · انشر عبر الويب' : 'Read-only · Post on web'}</span>
          </div>
          <button className='mn-icon-btn' onClick={() => navigate('/search')}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
            </svg>
          </button>
        </div>

        <div className='mn-tabs'>
          {['all', 'open', 'closed', 'fulfilled'].map((t) => (
            <button
              key={t}
              className={`mn-tab ${activeTab === t ? 'mn-tab-active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              <span>
                {t === 'all' ? (isAr ? 'الكل' : 'All') :
                 t === 'open' ? (isAr ? 'مفتوح' : 'Open') :
                 t === 'closed' ? (isAr ? 'مغلق' : 'Closed') :
                 (isAr ? 'مكتمل' : 'Fulfilled')}
              </span>
              <span className='mn-tab-badge'>{counts[t]}</span>
            </button>
          ))}
        </div>

        <div className='mn-info-banner'>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <circle cx='12' cy='12' r='10'/>
            <line x1='12' y1='16' x2='12' y2='12'/>
            <line x1='12' y1='8' x2='12.01' y2='8'/>
          </svg>
          <span className='mn-info-text'>
            {isAr ? (<>لـ <span className='mn-info-link'>نشر أو تعديل أو إغلاق</span> طلب، استخدم سيلا على الويب.</>) :
                    (<>To <span className='mn-info-link'>post, edit or close</span> a need, visit SELA on desktop.</>)}
          </span>
        </div>

        <div className='mn-meta-row'>
          <span className='mn-count-text'>
            {filtered.length} {isAr ? (filtered.length === 1 ? 'طلب' : 'طلبات') : (filtered.length === 1 ? 'need posted' : 'needs posted')}
          </span>
          <div className='mn-sort-wrap'>
            <button className='mn-sort-btn' onClick={() => setShowSortMenu(!showSortMenu)}>
              <span>{sortLabel()}</span>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <polyline points='6 9 12 15 18 9'/>
              </svg>
            </button>
            {showSortMenu && (
              <>
                <div className='mn-sort-backdrop' onClick={() => setShowSortMenu(false)} />
                <div className='mn-sort-dropdown'>
                  {[
                    { id: 'newest', en: 'Newest first', ar: 'الأحدث' },
                    { id: 'oldest', en: 'Oldest first', ar: 'الأقدم' },
                    { id: 'most_proposals', en: 'Most proposals', ar: 'أكثر عروض' },
                    { id: 'budget_high', en: 'Highest budget', ar: 'أعلى ميزانية' },
                  ].map((o) => (
                    <button
                      key={o.id}
                      className={`mn-sort-item ${sortBy === o.id ? 'mn-sort-item-active' : ''}`}
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
          <div className='mn-empty'>
            <div className='mn-empty-icon'>
              <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/>
                <polyline points='14 2 14 8 20 8'/>
              </svg>
            </div>
            <h2 className='mn-empty-title'>
              {activeTab === 'open' ? (isAr ? 'لا توجد طلبات مفتوحة' : 'No Open Needs') :
               activeTab === 'closed' ? (isAr ? 'لا توجد طلبات مغلقة' : 'No Closed Needs') :
               activeTab === 'fulfilled' ? (isAr ? 'لا توجد طلبات مكتملة' : 'No Fulfilled Needs') :
               (isAr ? 'لا توجد طلبات' : 'No Needs Yet')}
            </h2>
            <p className='mn-empty-sub'>{isAr ? 'انشر طلباتك عبر موقع سيلا على الويب' : 'Post your needs via SELA on desktop'}</p>
          </div>
        )}

        <div className='mn-list'>
          {filtered.map((n) => {
            const statusClass = n.status === 'open' ? 'mn-st-open' :
                                n.status === 'fulfilled' ? 'mn-st-fulfilled' :
                                'mn-st-closed'
            const statusLabel = n.status === 'open' ? (isAr ? 'مفتوح' : 'Open') :
                                n.status === 'fulfilled' ? (isAr ? 'مكتمل' : 'Fulfilled') :
                                (isAr ? 'مغلق' : 'Closed')

            const budgetK = n.budget >= 1000 ? `${(n.budget / 1000).toFixed(0)}K` : n.budget

            return (
              <div key={n.id} className='mn-card' onClick={() => openNeed(n)}>
                <div className='mn-card-top'>
                  <div className='mn-card-text'>
                    <span className='mn-card-title'>{isAr ? n.title_ar : n.title_en}</span>
                    <span className='mn-card-meta'>
                      {isAr ? 'منشور من قبلك' : 'Posted by you'} · {isAr ? n.category_ar : n.category_en}
                    </span>
                  </div>
                  <span className={`mn-status-badge ${statusClass}`}>{statusLabel}</span>
                </div>

                <div className='mn-specs-row'>
                  <span className='mn-spec'>{isAr ? n.location_ar : n.location_en}</span>
                  <span className='mn-spec-sep'>·</span>
                  <span className='mn-spec'>
                    {isAr ? 'الميزانية: ' : 'Budget: '}EGP {budgetK}
                  </span>
                  {n.deadline_en && (
                    <>
                      <span className='mn-spec-sep'>·</span>
                      <span className='mn-spec'>
                        {isAr ? 'الموعد: ' : 'Deadline: '}{isAr ? n.deadline_ar : n.deadline_en}
                      </span>
                    </>
                  )}
                </div>

                <div className='mn-card-bottom'>
                  <div className='mn-proposals-wrap'>
                    <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='#b0b0b0' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/>
                      <polyline points='14 2 14 8 20 8'/>
                    </svg>
                    <span className='mn-proposals-text'>
                      <span className='mn-proposals-count'>{n.proposals}</span> {isAr ? 'عرض مُستلم' : 'proposals received'}
                    </span>
                  </div>
                  <span className='mn-posted'>
                    {isAr ? 'نُشر ' : 'Posted '}{isAr ? n.posted_ar : n.posted_en}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ height: '90px' }} />
      </div>

      <BottomNav userType='buyer' />
    </div>
  )
}

export default MyNeeds
