import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import BottomNav from '../../components/BottomNav/BottomNav'
import Preloader from '../../components/Preloader/Preloader'
import './BrowseVendors.css'

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001'

const BrowseVendors = () => {
  const navigate = useNavigate()
  const [vendors, setVendors] = useState([])
  const [vendorProfiles, setVendorProfiles] = useState({})
  const [governorates, setGovernorates] = useState({})
  const [categories, setCategories] = useState({})
  const [matchScores, setMatchScores] = useState({})
  const [savedIds, setSavedIds] = useState(new Set())
  const [savedAnim, setSavedAnim] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('best_match')
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  useEffect(() => {
    const fetchData = async () => {
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .eq('company_type', 'vendor')

      const vendorsList = companiesData || []

      const companyIds = vendorsList.map((c) => c.id)
      const govIds = [
        ...new Set(vendorsList.map((c) => c.governorate_id).filter(Boolean)),
      ]
      const catIds = [
        ...new Set(vendorsList.map((c) => c.category_id).filter(Boolean)),
      ]

      let vpMap = {}
      if (companyIds.length > 0) {
        const { data: vpData } = await supabase
          .from('vendor_profiles')
          .select('*')
          .in('company_id', companyIds)
        ;(vpData || []).forEach((vp) => {
          vpMap[vp.company_id] = vp
        })
      }

      let govMap = {}
      if (govIds.length > 0) {
        const { data: govData } = await supabase
          .from('governorates')
          .select('id, name_en, name_ar')
          .in('id', govIds)
        ;(govData || []).forEach((g) => {
          govMap[g.id] = g
        })
      }

      let catMap = {}
      if (catIds.length > 0) {
        const { data: catData } = await supabase
          .from('categories')
          .select('id, name_en, name_ar')
          .in('id', catIds)
        ;(catData || []).forEach((c) => {
          catMap[c.id] = c
        })
      }

      const { data: scoresData } = await supabase
        .from('match_scores')
        .select('vendor_company_id, score_percentage')

      const scoresMap = {}
      ;(scoresData || []).forEach((s) => {
        if (
          !scoresMap[s.vendor_company_id] ||
          s.score_percentage > scoresMap[s.vendor_company_id]
        ) {
          scoresMap[s.vendor_company_id] = s.score_percentage
        }
      })

      const { data: savedData } = await supabase
        .from('saved_items')
        .select('entity_id')
        .eq('user_id', DEMO_USER_ID)
        .eq('entity_type', 'vendor')

      setVendors(vendorsList)
      setVendorProfiles(vpMap)
      setGovernorates(govMap)
      setCategories(catMap)
      setMatchScores(scoresMap)
      setSavedIds(new Set((savedData || []).map((s) => s.entity_id)))
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSave = async (e, vendorId) => {
    e.stopPropagation()
    const isSaved = savedIds.has(vendorId)
    const newSet = new Set(savedIds)

    setSavedAnim((prev) => ({ ...prev, [vendorId]: true }))
    setTimeout(
      () => setSavedAnim((prev) => ({ ...prev, [vendorId]: false })),
      400
    )

    if (isSaved) {
      newSet.delete(vendorId)
      setSavedIds(newSet)
      await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', DEMO_USER_ID)
        .eq('entity_type', 'vendor')
        .eq('entity_id', vendorId)
    } else {
      newSet.add(vendorId)
      setSavedIds(newSet)
      await supabase.from('saved_items').insert([
        {
          user_id: DEMO_USER_ID,
          entity_type: 'vendor',
          entity_id: vendorId,
          folder_label_en: 'Saved Vendors',
          folder_label_ar: 'الموردون المحفوظون',
        },
      ])
    }
  }

  const handleContact = (e, vendor) => {
    e.stopPropagation()
    const vName = isAr ? vendor.name_ar : vendor.name_en
    navigate(`/messages/new?vendor=${vendor.id}`, {
      state: {
        vendorCompanyId: vendor.id,
        vendorCompanyName: vName,
        vendorCompanyNameEn: vendor.name_en,
        vendorCompanyNameAr: vendor.name_ar,
        vendorLogoUrl: vendor.logo_url,
        vendorIsVerified: vendor.is_verified,
        fromVendor: true,
      },
    })
  }

  const filters = [
    { id: 'all', label: isAr ? 'الكل' : 'All' },
    { id: 'top_rated', label: isAr ? 'الأعلى تقييماً' : 'Top Rated' },
    { id: 'verified', label: isAr ? 'موثق' : 'Verified' },
    { id: 'fast_response', label: isAr ? 'استجابة سريعة' : 'Fast Response' },
  ]

  const getAvgRating = (vendorId) => {
    const vp = vendorProfiles[vendorId]
    return vp?.avg_rating ?? 4.5
  }

  const getReviewCount = (vendorId) => {
    const vp = vendorProfiles[vendorId]
    return vp?.total_reviews ?? Math.floor(Math.random() * 300) + 50
  }

  const getProjectsCount = (vendorId) => {
    const vp = vendorProfiles[vendorId]
    return vp?.completed_projects ?? Math.floor(Math.random() * 150) + 40
  }

  const getResponseTime = (vendorId) => {
    const vp = vendorProfiles[vendorId]
    return vp?.avg_response_hours ?? Math.floor(Math.random() * 8) + 2
  }

  const getOnTimePercent = (vendorId) => {
    const vp = vendorProfiles[vendorId]
    return vp?.on_time_delivery_percent ?? Math.floor(Math.random() * 15) + 85
  }

  const getFilteredVendors = () => {
    let filtered = [...vendors]
    if (activeFilter === 'top_rated')
      filtered = filtered.filter((v) => getAvgRating(v.id) >= 4.5)
    if (activeFilter === 'verified')
      filtered = filtered.filter((v) => v.is_verified)
    if (activeFilter === 'fast_response')
      filtered = filtered.filter((v) => getResponseTime(v.id) <= 4)

    if (sortBy === 'best_match')
      filtered.sort(
        (a, b) => (matchScores[b.id] || 0) - (matchScores[a.id] || 0)
      )
    if (sortBy === 'top_rated')
      filtered.sort((a, b) => getAvgRating(b.id) - getAvgRating(a.id))
    if (sortBy === 'most_projects')
      filtered.sort((a, b) => getProjectsCount(b.id) - getProjectsCount(a.id))
    return filtered
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) return <Preloader />

  const filteredVendors = getFilteredVendors()

  return (
    <div
      className='bv-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='bv-bg-anim'>
        <div className='bv-bg-streak bv-bg-streak-1' />
        <div className='bv-bg-streak bv-bg-streak-2' />
      </div>

      <div className='bv-scroll-area'>
        <div className='bv-header'>
          <div className='bv-header-top'>
            <img
              src={require('../../Assets/logoword.svg').default}
              alt='SELA'
              className='bv-logo-word'
            />
            <img
              src={require('../../Assets/logoicon.svg').default}
              alt=''
              className='bv-logo-icon'
            />
          </div>

          <div className='bv-header-row'>
            <h1 className='bv-title'>{isAr ? 'الموردون' : 'Vendors'}</h1>
            <div className='bv-header-actions'>
              <button
                className='bv-icon-btn'
                onClick={() => navigate('/search')}
              >
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
                  <circle cx='11' cy='11' r='8' />
                  <path d='m21 21-4.35-4.35' />
                </svg>
              </button>
              <button
                className='bv-icon-btn'
                onClick={() => navigate('/profile/notifications')}
              >
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
                  <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
                  <path d='M13.73 21a2 2 0 0 1-3.46 0' />
                </svg>
              </button>
              <button
                className='bv-icon-btn'
                onClick={() => navigate('/search')}
              >
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
                  <polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' />
                </svg>
              </button>
            </div>
          </div>

          <div className='bv-filters-scroll'>
            {filters.map((f) => (
              <button
                key={f.id}
                className={`bv-filter-btn ${activeFilter === f.id ? 'bv-filter-active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className='bv-sort-row'>
            <span className='bv-sort-label'>
              {isAr ? 'ترتيب: ' : 'Sort by: '}
            </span>
            <select
              className='bv-sort-select'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value='best_match'>
                {isAr ? 'الأنسب' : 'Best Match'} ▼
              </option>
              <option value='top_rated'>
                {isAr ? 'الأعلى تقييماً' : 'Top Rated'}
              </option>
              <option value='most_projects'>
                {isAr ? 'أكثر مشاريع' : 'Most Projects'}
              </option>
            </select>
          </div>
        </div>

        <div className='bv-list'>
          {filteredVendors.length === 0 && (
            <p style={{ color: '#6b7280', textAlign: 'center', marginTop: 40 }}>
              {isAr ? 'لا توجد نتائج' : 'No vendors found'}
            </p>
          )}
          {filteredVendors.map((vendor) => {
            const score = matchScores[vendor.id]
            const vendorName = isAr ? vendor.name_ar : vendor.name_en
            const category = isAr
              ? categories[vendor.category_id]?.name_ar
              : categories[vendor.category_id]?.name_en
            const location = isAr
              ? governorates[vendor.governorate_id]?.name_ar
              : governorates[vendor.governorate_id]?.name_en
            const description = isAr
              ? vendor.description_ar
              : vendor.description_en
            const rating = getAvgRating(vendor.id)
            const reviews = getReviewCount(vendor.id)
            const projects = getProjectsCount(vendor.id)
            const responseHrs = getResponseTime(vendor.id)
            const onTime = getOnTimePercent(vendor.id)
            const isSaved = savedIds.has(vendor.id)
            const isAnim = savedAnim[vendor.id]

            return (
              <div
                key={vendor.id}
                className='bv-card'
                onClick={() => navigate(`/vendor/${vendor.id}`)}
              >
                <div className='bv-card-top'>
                  <div className='bv-vendor-info'>
                    {vendor.logo_url ? (
                      <img
                        src={vendor.logo_url}
                        alt=''
                        className='bv-vendor-logo'
                      />
                    ) : (
                      <div className='bv-vendor-logo-placeholder'>
                        {getInitials(vendorName)}
                      </div>
                    )}
                    <div className='bv-vendor-text'>
                      <div className='bv-name-row'>
                        <span className='bv-vendor-name'>{vendorName}</span>
                        {vendor.is_verified && (
                          <svg
                            width='14'
                            height='14'
                            viewBox='0 0 24 24'
                            fill='none'
                          >
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
                      <div className='bv-rating-row'>
                        <svg
                          width='13'
                          height='13'
                          viewBox='0 0 24 24'
                          fill='#FFA500'
                          stroke='#FFA500'
                          strokeWidth='1'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                        </svg>
                        <span className='bv-rating-text'>
                          {rating} ({reviews} {isAr ? 'تقييم' : 'reviews'})
                        </span>
                      </div>
                    </div>
                  </div>
                  {score !== undefined && (
                    <span className='bv-match-badge'>{score}%</span>
                  )}
                </div>

                {category && (
                  <span className='bv-category-tag'>{category}</span>
                )}

                {location && (
                  <div className='bv-location-row'>
                    <svg
                      width='13'
                      height='13'
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
                    <span className='bv-location-text'>{location}</span>
                  </div>
                )}

                <div className='bv-stats-row'>
                  <span className='bv-stat'>
                    {projects} {isAr ? 'مشروع' : 'projects'}
                  </span>
                  <span className='bv-stat-sep'>|</span>
                  <span className='bv-stat'>
                    {responseHrs}
                    {isAr ? ' ساعة استجابة' : 'hrs response'}
                  </span>
                  <span className='bv-stat-sep'>|</span>
                  <span className='bv-stat'>
                    {onTime}% {isAr ? 'في الوقت' : 'on-time'}
                  </span>
                </div>

                {description && <p className='bv-desc'>{description}</p>}

                <div className='bv-trust-tags'>
                  <span className='bv-trust-tag'>
                    {isAr ? 'مرخّص' : 'Licensed'}
                  </span>
                  <span className='bv-trust-tag'>
                    {isAr ? 'مؤمّن' : 'Insured'}
                  </span>
                  <span className='bv-trust-tag'>
                    {isAr ? 'استجابة سريعة' : 'Fast Response'}
                  </span>
                </div>

                <div className='bv-card-actions'>
                  <button
                    className={`bv-action-btn bv-action-save ${isAnim ? 'bv-action-anim' : ''}`}
                    onClick={(e) => handleSave(e, vendor.id)}
                  >
                    <svg
                      width='14'
                      height='14'
                      viewBox='0 0 24 24'
                      fill={isSaved ? '#00a7e5' : 'none'}
                      stroke={isSaved ? '#00a7e5' : 'currentColor'}
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' />
                    </svg>
                    <span>
                      {isSaved
                        ? isAr
                          ? 'محفوظ'
                          : 'Saved'
                        : isAr
                          ? 'حفظ'
                          : 'Save'}
                    </span>
                  </button>
                  <button
                    className='bv-action-btn bv-action-contact'
                    onClick={(e) => handleContact(e, vendor)}
                  >
                    <svg
                      width='14'
                      height='14'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
                    </svg>
                    <span>{isAr ? 'تواصل' : 'Contact'}</span>
                  </button>
                  <button
                    className='bv-action-btn bv-action-view'
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/vendor/${vendor.id}`)
                    }}
                  >
                    <svg
                      width='14'
                      height='14'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                      <circle cx='12' cy='7' r='4' />
                    </svg>
                    <span>{isAr ? 'عرض الملف' : 'View Profile'}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ height: '80px' }} />
      </div>

      <BottomNav userType='buyer' />
    </div>
  )
}

export default BrowseVendors
