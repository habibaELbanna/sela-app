import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import BottomNav from '../../components/BottomNav/BottomNav'
import Preloader from '../../components/Preloader/Preloader'
import './BrowseNeeds.css'

const BrowseNeeds = () => {
  const navigate = useNavigate()
  const [needs, setNeeds] = useState([])
  const [matchScores, setMatchScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('best_match')
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  useEffect(() => {
    const fetchData = async () => {
      const { data: needsData } = await supabase
        .from('needs')
        .select(`*, companies(name_en, name_ar, logo_url, is_verified), categories(name_en, name_ar), governorates(name_en, name_ar)`)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      const { data: scoresData } = await supabase
        .from('match_scores')
        .select('need_id, score_percentage')

      if (scoresData) {
        const scoresMap = {}
        scoresData.forEach((s) => {
          if (!scoresMap[s.need_id] || s.score_percentage > scoresMap[s.need_id]) {
            scoresMap[s.need_id] = s.score_percentage
          }
        })
        setMatchScores(scoresMap)
      }

      setNeeds(needsData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const filters = [
    { id: 'all', label: isAr ? 'الكل' : 'All' },
    { id: 'high_match', label: isAr ? 'تطابق عالي' : 'High Match' },
    { id: 'closing_soon', label: isAr ? 'ينتهي قريباً' : 'Closing Soon' },
    { id: 'new_today', label: isAr ? 'جديد اليوم' : 'New Today' },
  ]

  const getFilteredNeeds = () => {
    let filtered = [...needs]
    const now = new Date()
    if (activeFilter === 'high_match') filtered = filtered.filter(n => (matchScores[n.id] || 0) >= 80)
    if (activeFilter === 'closing_soon') filtered = filtered.filter(n => {
      if (!n.deadline) return false
      const days = (new Date(n.deadline) - now) / (1000 * 60 * 60 * 24)
      return days <= 7 && days >= 0
    })
    if (activeFilter === 'new_today') filtered = filtered.filter(n => {
      const created = new Date(n.created_at)
      return (now - created) / (1000 * 60 * 60) <= 24
    })
    if (sortBy === 'best_match') filtered.sort((a, b) => (matchScores[b.id] || 0) - (matchScores[a.id] || 0))
    if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return filtered
  }

  const getTimeAgo = (date) => {
    const diff = (new Date() - new Date(date)) / 1000
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const getDaysLeft = (deadline) => {
    if (!deadline) return null
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const isClosingSoon = (deadline) => {
    const days = getDaysLeft(deadline)
    return days !== null && days <= 7
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) return <Preloader />

  const filteredNeeds = getFilteredNeeds()

  return (
    <div className='browse-container' dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Tajawal, sans-serif' : 'Helvetica, Arial, sans-serif' }}>

      <div className='browse-bg-anim'>
        <div className='browse-bg-streak browse-bg-streak-1' />
        <div className='browse-bg-streak browse-bg-streak-2' />
      </div>

      <div className='browse-scroll-area'>
        <div className='browse-header'>
          <div className='browse-header-top'>
            <img src={require('../../Assets/logoicon.svg').default} alt='' className='browse-logo-icon' />
            <img src={require('../../Assets/logoword.svg').default} alt='SELA' className='browse-logo-word' />
          </div>

          <div className='browse-header-row'>
            <h1 className='browse-title'>{isAr ? 'الفرص' : 'Opportunities'}</h1>
            <div className='browse-header-actions'>
              <button className='browse-icon-btn' onClick={() => navigate('/search')}>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
                </svg>
              </button>
              <button className='browse-icon-btn' onClick={() => navigate('/profile/notifications')}>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/>
                </svg>
              </button>
              <button className='browse-icon-btn' onClick={() => navigate('/search')}>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <line x1='4' y1='6' x2='20' y2='6'/><line x1='8' y1='12' x2='16' y2='12'/><line x1='11' y1='18' x2='13' y2='18'/>
                </svg>
              </button>
            </div>
          </div>

          <div className='browse-filters-scroll'>
            {filters.map((f) => (
              <button
                key={f.id}
                className={`browse-filter-btn ${activeFilter === f.id ? 'browse-filter-active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className='browse-sort-row'>
            <span className='browse-sort-label'>{isAr ? 'ترتيب: ' : 'Sort by: '}</span>
            <select className='browse-sort-select' value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value='best_match'>{isAr ? 'الأنسب' : 'Best Match'} ▼</option>
              <option value='newest'>{isAr ? 'الأحدث' : 'Newest'}</option>
            </select>
          </div>
        </div>

        <div className='browse-list'>
          {filteredNeeds.length === 0 && (
            <p style={{ color: '#6b7280', textAlign: 'center', marginTop: 40 }}>
              {isAr ? 'لا توجد نتائج' : 'No needs found'}
            </p>
          )}
          {filteredNeeds.map((need) => {
            const score = matchScores[need.id]
            const daysLeft = getDaysLeft(need.deadline)
            const closingSoon = isClosingSoon(need.deadline)
            const companyName = isAr ? need.companies?.name_ar : need.companies?.name_en
            const category = isAr ? need.categories?.name_ar : need.categories?.name_en
            const location = isAr ? need.governorates?.name_ar : need.governorates?.name_en

            return (
              <div key={need.id} className={`browse-card ${closingSoon ? 'browse-card-has-badge' : ''}`} onClick={() => navigate(`/need/${need.id}`)}>

                {closingSoon && (
                  <img src={require('../../Assets/badge.svg').default} alt='Closing Soon' className='browse-badge-closing' />
                )}

                <div className='browse-card-top'>
                  <div className='browse-company-row'>
                    {need.companies?.logo_url ? (
                      <img
                        src={need.companies.logo_url}
                        alt=''
                        className='browse-company-logo'
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className='browse-company-logo-placeholder'
                      style={{ display: need.companies?.logo_url ? 'none' : 'flex' }}
                    >
                      {getInitials(companyName)}
                    </div>
                    <span className='browse-company-name'>
                      {companyName}
                      {need.companies?.is_verified && (
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='#00a7e5' style={{ marginLeft: 4, flexShrink: 0 }}>
                          <path d='M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'/>
                        </svg>
                      )}
                    </span>
                  </div>
                  {score !== undefined && (
                    <span className='browse-match-score'>{score}%</span>
                  )}
                </div>

                <h2 className='browse-card-title'>{isAr ? need.title_ar : need.title_en}</h2>

                {category && <span className='browse-category-tag'>{category}</span>}

                <div className='browse-card-meta'>
                  <span className='browse-budget'>
                    {need.budget_min && need.budget_max_egp
                      ? `EGP ${Number(need.budget_min).toLocaleString()} - ${Number(need.budget_max_egp).toLocaleString()}`
                      : isAr ? 'غير محدد' : 'Budget TBD'}
                  </span>
                  {location && (
                    <span className='browse-location'>
                      <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/>
                      </svg>
                      {location}
                    </span>
                  )}
                  <span className='browse-time'>{getTimeAgo(need.created_at)}</span>
                </div>

                <p className='browse-card-desc'>
                  {isAr ? need.description_ar : need.description_en}
                </p>

                <div className='browse-card-footer'>
                  <div className='browse-footer-left'>
                    <span className='browse-proposals'>{need.proposals_count || 0} {isAr ? 'عرض' : 'proposals'}</span>
                    {daysLeft !== null && (
                      <span className='browse-days-left'>
                        <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                          <circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>
                        </svg>
                        {daysLeft} {isAr ? 'يوم متبقي' : 'days left'}
                      </span>
                    )}
                  </div>
                  <div className='browse-footer-right'>
                    <button className='browse-save-btn' onClick={(e) => e.stopPropagation()}>
                      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'/>
                      </svg>
                    </button>
                    <button className='browse-arrow-btn' onClick={(e) => { e.stopPropagation(); navigate(`/need/${need.id}`) }}>
                      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <line x1='5' y1='12' x2='19' y2='12'/><polyline points='12 5 19 12 12 19'/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ height: '80px' }} />
      </div>

      <BottomNav userType='vendor' />
    </div>
  )
}

export default BrowseNeeds