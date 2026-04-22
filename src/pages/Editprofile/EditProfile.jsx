import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import Preloader from '../../components/Preloader/Preloader'
import './EditProfile.css'

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000002'
const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/32.jpg'

const EditProfile = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const [companyId, setCompanyId] = useState(null)

  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bio, setBio] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyNameAr, setCompanyNameAr] = useState('')
  const [governorateId, setGovernorateId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const [governorates, setGovernorates] = useState([])
  const [categories, setCategories] = useState([])

  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarUrlInput, setAvatarUrlInput] = useState('')

  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  useEffect(() => {
    const fetchAll = async () => {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', DEMO_USER_ID)
        .single()

      if (user) {
        setFullName(user.full_name || '')
        setJobTitle(user.job_title || user.position || '')
        setEmail(user.email || '')
        setPhone(user.phone || '')
        setAvatarUrl(user.avatar_url || '')
        setBio(user.bio || '')

        if (user.company_id) {
          setCompanyId(user.company_id)
          const { data: company } = await supabase
            .from('companies')
            .select('*')
            .eq('id', user.company_id)
            .single()
          if (company) {
            setCompanyName(company.name_en || '')
            setCompanyNameAr(company.name_ar || '')
            setGovernorateId(company.governorate_id || '')
            setCategoryId(company.category_id || '')
          }
        }
      }

      const { data: govs } = await supabase
        .from('governorates')
        .select('id, name_en, name_ar')
        .order('name_en')
      setGovernorates(govs || [])

      const { data: cats } = await supabase
        .from('categories')
        .select('id, name_en, name_ar')
        .order('name_en')
      setCategories(cats || [])

      setLoading(false)
    }
    fetchAll()
  }, [])

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError(isAr ? 'الاسم الكامل مطلوب' : 'Full name is required')
      return
    }

    setSaving(true)
    setError(null)

    const userUpdate = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar_url: avatarUrl.trim(),
      job_title: jobTitle.trim(),
      bio: bio.trim(),
    }

    const { error: userError } = await supabase
      .from('users')
      .update(userUpdate)
      .eq('id', DEMO_USER_ID)

    if (userError) {
      console.warn('User update warning:', userError.message)
      const fallbackUpdate = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl.trim(),
      }
      await supabase.from('users').update(fallbackUpdate).eq('id', DEMO_USER_ID)
    }

    if (companyId) {
      const companyUpdate = {
        name_en: companyName.trim(),
        name_ar: companyNameAr.trim(),
      }
      if (governorateId) companyUpdate.governorate_id = governorateId
      if (categoryId) companyUpdate.category_id = categoryId

      const { error: companyError } = await supabase
        .from('companies')
        .update(companyUpdate)
        .eq('id', companyId)
      if (companyError)
        console.warn('Company update warning:', companyError.message)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      navigate('/profile')
    }, 900)
  }

  const handleAvatarSave = () => {
    if (avatarUrlInput.trim()) {
      setAvatarUrl(avatarUrlInput.trim())
    }
    setShowAvatarModal(false)
    setAvatarUrlInput('')
  }

  const handleAvatarRemove = () => {
    setAvatarUrl('')
    setShowAvatarModal(false)
    setAvatarUrlInput('')
  }

  if (loading) return <Preloader />

  const displayAvatar = avatarUrl || DEFAULT_AVATAR

  return (
    <div
      className='ep-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='ep-bg'>
        <div className='ep-bg-1' />
        <div className='ep-bg-2' />
      </div>

      <div className='ep-topbar'>
        <button className='ep-back' onClick={() => navigate(-1)}>
          <svg
            width='22'
            height='22'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M19 12H5' />
            <polyline points='12 19 5 12 12 5' />
          </svg>
        </button>
        <span className='ep-topbar-title'>
          {isAr ? 'تعديل الملف الشخصي' : 'Edit Profile'}
        </span>
        <button
          className={`ep-save-top ${saving ? 'ep-save-loading' : ''} ${saved ? 'ep-save-done' : ''}`}
          onClick={handleSave}
          disabled={saving || saved}
        >
          {saved ? (
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
            >
              <polyline points='20 6 9 17 4 12' />
            </svg>
          ) : saving ? (
            <span className='ep-mini-spinner' />
          ) : (
            <span>{isAr ? 'حفظ' : 'Save'}</span>
          )}
        </button>
      </div>

      <div className='ep-scroll'>
        {error && (
          <div className='ep-error'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#EF4444'
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='12' y1='8' x2='12' y2='12' />
              <line x1='12' y1='16' x2='12.01' y2='16' />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className='ep-avatar-section'>
          <div
            className='ep-avatar-wrap'
            onClick={() => {
              setAvatarUrlInput(avatarUrl)
              setShowAvatarModal(true)
            }}
          >
            <img src={displayAvatar} alt='' className='ep-avatar' />
            <div className='ep-avatar-overlay'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#cccccc'
                strokeWidth='2'
              >
                <path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' />
                <circle cx='12' cy='13' r='4' />
              </svg>
            </div>
          </div>
          <button
            className='ep-change-photo'
            onClick={() => {
              setAvatarUrlInput(avatarUrl)
              setShowAvatarModal(true)
            }}
          >
            {isAr ? 'تغيير الصورة' : 'Change Photo'}
          </button>
        </div>

        <h3 className='ep-section-title'>
          {isAr ? 'المعلومات الشخصية' : 'Personal Information'}
        </h3>

        <div className='ep-field'>
          <label className='ep-label'>
            {isAr ? 'الاسم الكامل' : 'Full Name'}{' '}
            <span className='ep-required'>*</span>
          </label>
          <input
            className='ep-input'
            type='text'
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={isAr ? 'أحمد حسن' : 'Ahmed Hassan'}
          />
        </div>

        <div className='ep-field'>
          <label className='ep-label'>
            {isAr ? 'المسمى الوظيفي' : 'Job Title'}
          </label>
          <input
            className='ep-input'
            type='text'
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder={isAr ? 'مدير مشروع أول' : 'Senior Project Manager'}
          />
        </div>

        <div className='ep-field'>
          <label className='ep-label'>
            {isAr ? 'البريد الإلكتروني' : 'Email'}
          </label>
          <input
            className='ep-input'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='ahmed@buildright.com'
          />
        </div>

        <div className='ep-field'>
          <label className='ep-label'>
            {isAr ? 'رقم الهاتف' : 'Phone Number'}
          </label>
          <input
            className='ep-input'
            type='tel'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder='+20 2 1234 5678'
            dir='ltr'
          />
        </div>

        <div className='ep-field'>
          <label className='ep-label'>{isAr ? 'نبذة عنك' : 'Bio'}</label>
          <textarea
            className='ep-textarea'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={
              isAr
                ? 'اكتب نبذة قصيرة عن نفسك...'
                : 'Write a short bio about yourself...'
            }
            rows={4}
          />
          <span className='ep-hint'>{bio.length} / 300</span>
        </div>

        <h3 className='ep-section-title'>
          {isAr ? 'معلومات الشركة' : 'Company Information'}
        </h3>

        <div className='ep-field'>
          <label className='ep-label'>
            {isAr ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}
          </label>
          <input
            className='ep-input'
            type='text'
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder='BuildRight Construction'
          />
        </div>

        <div className='ep-field'>
          <label className='ep-label'>
            {isAr ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}
          </label>
          <input
            className='ep-input'
            type='text'
            value={companyNameAr}
            onChange={(e) => setCompanyNameAr(e.target.value)}
            placeholder='بيلد رايت للإنشاءات'
            dir='rtl'
          />
        </div>

        <div className='ep-field'>
          <label className='ep-label'>{isAr ? 'الصناعة' : 'Industry'}</label>
          <select
            className='ep-select'
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value=''>
              {isAr ? 'اختر الصناعة' : 'Select industry'}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {isAr ? cat.name_ar : cat.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className='ep-field'>
          <label className='ep-label'>{isAr ? 'الموقع' : 'Location'}</label>
          <select
            className='ep-select'
            value={governorateId}
            onChange={(e) => setGovernorateId(e.target.value)}
          >
            <option value=''>
              {isAr ? 'اختر المحافظة' : 'Select governorate'}
            </option>
            {governorates.map((gov) => (
              <option key={gov.id} value={gov.id}>
                {isAr ? gov.name_ar : gov.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className='ep-bottom-actions'>
          <button
            className='ep-cancel-btn'
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            className={`ep-save-btn ${saving ? 'ep-save-btn-loading' : ''} ${saved ? 'ep-save-btn-done' : ''}`}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saved ? (
              <>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                >
                  <polyline points='20 6 9 17 4 12' />
                </svg>
                <span>{isAr ? 'تم الحفظ' : 'Saved'}</span>
              </>
            ) : saving ? (
              <>
                <span className='ep-mini-spinner' />
                <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
              </>
            ) : (
              <span>{isAr ? 'حفظ التغييرات' : 'Save Changes'}</span>
            )}
          </button>
        </div>

        <div style={{ height: '40px' }} />
      </div>

      {showAvatarModal && (
        <div
          className='ep-modal-overlay'
          onClick={() => setShowAvatarModal(false)}
        >
          <div className='ep-modal' onClick={(e) => e.stopPropagation()}>
            <div className='ep-modal-handle' />
            <h3 className='ep-modal-title'>
              {isAr ? 'تغيير صورة الملف الشخصي' : 'Change Profile Photo'}
            </h3>
            <p className='ep-modal-sub'>
              {isAr
                ? 'الصق رابط الصورة من الإنترنت'
                : 'Paste an image URL from the web'}
            </p>

            <div className='ep-modal-preview'>
              <img
                src={avatarUrlInput || displayAvatar}
                alt=''
                className='ep-modal-preview-img'
                onError={(e) => {
                  e.target.src = DEFAULT_AVATAR
                }}
              />
            </div>

            <input
              className='ep-modal-input'
              type='url'
              value={avatarUrlInput}
              onChange={(e) => setAvatarUrlInput(e.target.value)}
              placeholder='https://example.com/photo.jpg'
              dir='ltr'
              autoFocus
            />

            <button className='ep-modal-save' onClick={handleAvatarSave}>
              {isAr ? 'تطبيق' : 'Apply'}
            </button>
            <button className='ep-modal-remove' onClick={handleAvatarRemove}>
              {isAr ? 'إزالة الصورة' : 'Remove Photo'}
            </button>
            <button
              className='ep-modal-cancel'
              onClick={() => setShowAvatarModal(false)}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditProfile
