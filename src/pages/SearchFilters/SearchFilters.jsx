import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchFilters.css'

const SearchFilters = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [mode, setMode] = useState(localStorage.getItem('sela_user_type') || 'vendor')
  const [keywords, setKeywords] = useState(['Construction', 'Cairo', 'Cement'])
  const [newKeyword, setNewKeyword] = useState('')
  const [showAddKeyword, setShowAddKeyword] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Construction')
  const [budgetMin, setBudgetMin] = useState(50000)
  const [budgetMax, setBudgetMax] = useState(500000)
  const [locations, setLocations] = useState(['Cairo', 'Giza'])
  const [showAllLocations, setShowAllLocations] = useState(false)
  const [useGps, setUseGps] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [openOnly, setOpenOnly] = useState(false)
  const [acceptingOnly, setAcceptingOnly] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  const categories = [
    {
      id: 'Construction',
      label_en: 'Construction',
      label_ar: 'البناء',
      icon: (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <line x1='20' y1='6' x2='4' y2='6'/>
          <path d='M12 6v12'/>
          <path d='M4 6l4 12'/>
          <path d='M20 6l-4 12'/>
          <line x1='4' y1='18' x2='20' y2='18'/>
        </svg>
      ),
    },
    {
      id: 'Technology',
      label_en: 'Technology',
      label_ar: 'التكنولوجيا',
      icon: (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <rect x='3' y='4' width='18' height='12' rx='0'/>
          <line x1='8' y1='20' x2='16' y2='20'/>
          <line x1='12' y1='16' x2='12' y2='20'/>
        </svg>
      ),
    },
    {
      id: 'Manufacturing',
      label_en: 'Manufacturing',
      label_ar: 'التصنيع',
      icon: (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M2 20h20'/>
          <path d='M4 20v-9l5 3v-3l5 3v-3l5 3v6'/>
        </svg>
      ),
    },
    {
      id: 'Logistics',
      label_en: 'Logistics',
      label_ar: 'الخدمات اللوجستية',
      icon: (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <rect x='1' y='3' width='15' height='13' rx='0'/>
          <polygon points='16 8 20 8 23 11 23 16 16 16 16 8'/>
          <circle cx='5.5' cy='18.5' r='2.5'/>
          <circle cx='18.5' cy='18.5' r='2.5'/>
        </svg>
      ),
    },
    {
      id: 'Healthcare',
      label_en: 'Healthcare',
      label_ar: 'الرعاية الصحية',
      icon: (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'/>
        </svg>
      ),
    },
    {
      id: 'Energy',
      label_en: 'Energy',
      label_ar: 'الطاقة',
      icon: (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='#FFA500' stroke='#FFA500' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/>
        </svg>
      ),
    },
  ]

  const locationOptions = ['Cairo', 'Giza', 'Alexandria', 'Luxor', 'Aswan', 'New Cairo', 'Sharm El Sheikh', '6th of October', 'Mansoura', 'Port Said', 'Suez']

  const sortOptions = [
    { id: 'newest', label_en: 'Newest', label_ar: 'الأحدث' },
    { id: 'budget_up', label_en: 'Budget ↑', label_ar: 'الميزانية ↑' },
    { id: 'budget_down', label_en: 'Budget ↓', label_ar: 'الميزانية ↓' },
    { id: 'relevance', label_en: 'Relevance', label_ar: 'الصلة' },
  ]

  const removeKeyword = (k) => {
    setKeywords(prev => prev.filter(kw => kw !== k))
  }

  const addKeyword = () => {
    const trimmed = newKeyword.trim()
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed])
      setNewKeyword('')
      setShowAddKeyword(false)
    }
  }

  const toggleLocation = (loc) => {
    setLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc])
  }

  const handleReset = () => {
    setSearchText('')
    setKeywords([])
    setSelectedCategory(null)
    setBudgetMin(0)
    setBudgetMax(1000000)
    setLocations([])
    setVerifiedOnly(false)
    setOpenOnly(false)
    setAcceptingOnly(false)
    setSortBy('newest')
  }

  const handleApply = () => {
    const destination = mode === 'vendor' ? '/browse-needs' : '/browse-vendors'
    navigate(destination, {
      state: { searchText, keywords, selectedCategory, budgetMin, budgetMax, locations, verifiedOnly, openOnly, acceptingOnly, sortBy }
    })
  }

  const visibleLocations = showAllLocations ? locationOptions : locationOptions.slice(0, 5)

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), budgetMax - 10000)
    setBudgetMin(val)
  }

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), budgetMin + 10000)
    setBudgetMax(val)
  }

  const minPct = (budgetMin / 1000000) * 100
  const maxPct = (budgetMax / 1000000) * 100

  const Toggle = ({ value, onChange }) => (
    <button
      className={`sf-toggle ${value ? 'sf-toggle-on' : ''}`}
      onClick={() => onChange(!value)}
      aria-label='Toggle'
    >
      <span className='sf-toggle-thumb' />
    </button>
  )

  return (
    <div className='sf-container' dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Tajawal, sans-serif' : 'Helvetica, Arial, sans-serif' }}>

      <div className='sf-bg'>
        <div className='sf-bg-1' />
        <div className='sf-bg-2' />
      </div>

      <div className='sf-topbar'>
        <button className='sf-back' onClick={() => navigate(-1)}>
          <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M19 12H5'/><polyline points='12 19 5 12 12 5'/>
          </svg>
        </button>
        <div className='sf-search-wrap'>
          <input
            type='text'
            className='sf-search-input'
            placeholder={isAr ? 'مواد البناء' : 'Construction materials'}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <svg className='sf-search-icon' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
          </svg>
        </div>
      </div>

      <div className='sf-scroll'>

        <div className='sf-section'>
          <span className='sf-section-label'>{isAr ? 'التصفح كـ' : 'BROWSING AS'}</span>
          <div className='sf-mode-row'>
            <button
              className={`sf-mode-btn ${mode === 'vendor' ? 'sf-mode-active' : ''}`}
              onClick={() => setMode('vendor')}
            >
              {isAr ? 'مورد — ابحث عن طلبات' : 'Vendor — Find Needs'}
            </button>
            <button
              className={`sf-mode-btn ${mode === 'buyer' ? 'sf-mode-active' : ''}`}
              onClick={() => setMode('buyer')}
            >
              {isAr ? 'مشتري — ابحث عن موردين' : 'Buyer — Find Vendors'}
            </button>
          </div>
        </div>

        <div className='sf-divider' />

        <div className='sf-section'>
          <span className='sf-section-label'>{isAr ? 'الكلمات المفتاحية' : 'KEYWORDS'}</span>
          <div className='sf-keyword-list'>
            {keywords.map((k) => (
              <span key={k} className='sf-keyword-chip'>
                {k}
                <button className='sf-keyword-remove' onClick={() => removeKeyword(k)}>
                  <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                    <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
                  </svg>
                </button>
              </span>
            ))}
            {showAddKeyword ? (
              <div className='sf-keyword-input-wrap'>
                <input
                  type='text'
                  className='sf-keyword-input'
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addKeyword()
                    if (e.key === 'Escape') { setShowAddKeyword(false); setNewKeyword('') }
                  }}
                  placeholder={isAr ? 'اكتب...' : 'Type...'}
                  autoFocus
                />
                <button className='sf-keyword-confirm' onClick={addKeyword}>
                  <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                    <polyline points='20 6 9 17 4 12'/>
                  </svg>
                </button>
              </div>
            ) : (
              <button className='sf-keyword-add' onClick={() => setShowAddKeyword(true)}>
                + {isAr ? 'أضف كلمة' : 'Add keyword'}
              </button>
            )}
          </div>
        </div>

        <div className='sf-divider' />

        <div className='sf-section'>
          <span className='sf-section-label'>{isAr ? 'الفئة' : 'CATEGORY'}</span>
          <div className='sf-cat-grid'>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`sf-cat-btn ${selectedCategory === c.id ? 'sf-cat-active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
              >
                <div className='sf-cat-icon'>{c.icon}</div>
                <span className='sf-cat-label'>{isAr ? c.label_ar : c.label_en}</span>
              </button>
            ))}
          </div>
        </div>

        <div className='sf-divider' />

        <div className='sf-section'>
          <span className='sf-section-label'>{isAr ? 'نطاق الميزانية (جنيه)' : 'BUDGET RANGE (EGP)'}</span>
          <div className='sf-budget-inputs'>
            <input
              type='number'
              className='sf-budget-input'
              value={budgetMin}
              onChange={(e) => setBudgetMin(Number(e.target.value))}
            />
            <span className='sf-budget-dash'>—</span>
            <input
              type='number'
              className='sf-budget-input'
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
            />
          </div>

          <div className='sf-slider-wrap'>
            <div className='sf-slider-track'>
              <div
                className='sf-slider-range'
                style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
              />
            </div>
            <input
              type='range'
              min='0'
              max='1000000'
              step='10000'
              value={budgetMin}
              onChange={handleMinChange}
              className='sf-slider-thumb'
            />
            <input
              type='range'
              min='0'
              max='1000000'
              step='10000'
              value={budgetMax}
              onChange={handleMaxChange}
              className='sf-slider-thumb'
            />
          </div>

          <div className='sf-slider-labels'>
            <span>0</span>
            <span>250K</span>
            <span>500K</span>
            <span>1M+</span>
          </div>
        </div>

        <div className='sf-section'>
          <div className='sf-action-row'>
            <button className='sf-reset-btn' onClick={handleReset}>
              {isAr ? 'إعادة' : 'Reset'}
            </button>
            <button className='sf-apply-btn' onClick={handleApply}>
              {isAr ? `تطبيق · 142 نتيجة` : 'Apply Filters · 142 results'}
            </button>
          </div>
        </div>

        <div className='sf-section'>
          <div className='sf-gps-row'>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#b0b0b0' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/>
            </svg>
            <span className='sf-gps-text'>{isAr ? 'استخدم موقعي الحالي' : 'Use my current location'}</span>
            <button
              className={`sf-gps-btn ${useGps ? 'sf-gps-active' : ''}`}
              onClick={() => setUseGps(!useGps)}
            >
              GPS
            </button>
          </div>

          <div className='sf-location-list'>
            {visibleLocations.map((loc) => (
              <button
                key={loc}
                className={`sf-location-chip ${locations.includes(loc) ? 'sf-location-active' : ''}`}
                onClick={() => toggleLocation(loc)}
              >
                {loc}
              </button>
            ))}
            {!showAllLocations && locationOptions.length > 5 && (
              <button className='sf-location-more' onClick={() => setShowAllLocations(true)}>
                + {isAr ? 'المزيد' : 'More'}
              </button>
            )}
          </div>
        </div>

        <div className='sf-divider' />

        <div className='sf-section'>
          <span className='sf-section-label'>{isAr ? 'الفلاتر' : 'FILTERS'}</span>

          <div className='sf-filter-row'>
            <div className='sf-filter-text'>
              <span className='sf-filter-title'>{isAr ? 'الموردون الموثقون فقط' : 'Verified vendors only'}</span>
              <span className='sf-filter-sub'>{isAr ? 'عرض الملفات الموثقة فقط' : 'Show only SELA-verified profiles'}</span>
            </div>
            <Toggle value={verifiedOnly} onChange={setVerifiedOnly} />
          </div>

          <div className='sf-filter-row'>
            <div className='sf-filter-text'>
              <span className='sf-filter-title'>{isAr ? 'الطلبات المفتوحة فقط' : 'Open needs only'}</span>
              <span className='sf-filter-sub'>{isAr ? 'إخفاء الطلبات المنتهية' : 'Hide expired or fulfilled needs'}</span>
            </div>
            <Toggle value={openOnly} onChange={setOpenOnly} />
          </div>

          <div className='sf-filter-row'>
            <div className='sf-filter-text'>
              <span className='sf-filter-title'>{isAr ? 'يقبل العروض' : 'Accepting proposals'}</span>
              <span className='sf-filter-sub'>{isAr ? 'المشتري يراجع العروض حالياً' : 'Buyer is actively reviewing bids'}</span>
            </div>
            <Toggle value={acceptingOnly} onChange={setAcceptingOnly} />
          </div>
        </div>

        <div className='sf-divider' />

        <div className='sf-section'>
          <span className='sf-section-label'>{isAr ? 'الترتيب حسب' : 'SORT BY'}</span>
          <div className='sf-sort-list'>
            {sortOptions.map((s) => (
              <button
                key={s.id}
                className={`sf-sort-btn ${sortBy === s.id ? 'sf-sort-active' : ''}`}
                onClick={() => setSortBy(s.id)}
              >
                {isAr ? s.label_ar : s.label_en}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '40px' }} />
      </div>

    </div>
  )
}

export default SearchFilters
