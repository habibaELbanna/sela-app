import { useEffect, useState, useRef } from 'react'
import {
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from 'react-router-dom'
import { supabase } from '../../supabase'
import './ChatThread.css'

const DEMO_VENDOR_ID = 'a0000000-0000-0000-0000-000000000002'
const DEMO_BUYER_ID = 'a0000000-0000-0000-0000-000000000001'
const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/32.jpg'

const REPLIES_EN = [
  'Hi! Thanks for reaching out. Happy to discuss the details.',
  'Great question — let me check with the team and get back to you.',
  "Yes, we're flexible on the timeline if the quality meets our standards.",
  'Can you share some references or past work similar to this?',
  'The budget range is firm, but we can negotiate based on scope.',
  'Sounds good. When can you deliver a detailed proposal?',
  "We're looking for long-term partners, not just one-off vendors.",
  'Delivery location is our main office. Installation on-site is required.',
]

const REPLIES_AR = [
  'مرحباً! شكراً للتواصل. يسعدني مناقشة التفاصيل.',
  'سؤال ممتاز — دعني أتحقق مع الفريق وأعود إليك.',
  'نعم، لدينا مرونة في الجدول الزمني إذا كانت الجودة تلبي معاييرنا.',
  'هل يمكنك مشاركة بعض المراجع أو الأعمال السابقة المشابهة؟',
  'نطاق الميزانية ثابت، لكن يمكننا التفاوض بناءً على النطاق.',
  'يبدو جيداً. متى يمكنك تسليم عرض مفصل؟',
  'نبحث عن شركاء طويلي الأمد، وليس مجرد موردين لمرة واحدة.',
  'موقع التسليم هو مكتبنا الرئيسي. التركيب في الموقع مطلوب.',
]

const ChatThread = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const queryNeedId = searchParams.get('need')
  const queryVendorId = searchParams.get('vendor')
  const passed = location.state || {}
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  const isVendorChat = passed.fromVendor || !!queryVendorId
  const isBuyerChat =
    passed.fromNeed || !!queryNeedId || !!passed.buyerCompanyId

  const [need, setNeed] = useState(
    passed.needId
      ? {
          id: passed.needId,
          title_en: passed.needTitleEn,
          title_ar: passed.needTitleAr,
        }
      : null
  )

  const [other, setOther] = useState(() => {
    if (isVendorChat && passed.vendorCompanyId) {
      return {
        id: passed.vendorCompanyId,
        type: 'vendor',
        name_en: passed.vendorCompanyNameEn,
        name_ar: passed.vendorCompanyNameAr,
        logo_url:
          passed.vendorLogoUrl || passed.vendorAvatarUrl || DEFAULT_AVATAR,
        is_verified: passed.vendorIsVerified,
      }
    }
    if (passed.buyerCompanyId) {
      return {
        id: passed.buyerCompanyId,
        type: 'buyer',
        name_en: passed.buyerCompanyNameEn,
        name_ar: passed.buyerCompanyNameAr,
        logo_url: passed.buyerLogoUrl || DEFAULT_AVATAR,
        is_verified: passed.buyerIsVerified,
      }
    }
    return null
  })

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(!other)
  const [showContextCard, setShowContextCard] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const hydrate = async () => {
      if (queryVendorId && !other) {
        const { data: vendorData } = await supabase
          .from('companies')
          .select('id, name_en, name_ar, logo_url, is_verified')
          .eq('id', queryVendorId)
          .single()
        if (vendorData) {
          setOther({
            id: vendorData.id,
            type: 'vendor',
            name_en: vendorData.name_en,
            name_ar: vendorData.name_ar,
            logo_url: vendorData.logo_url || DEFAULT_AVATAR,
            is_verified: vendorData.is_verified,
          })
        }
        setLoading(false)
        return
      }

      const needIdToFetch =
        passed.needId || queryNeedId || (id && !isNaN(parseInt(id)) ? id : null)
      if (!needIdToFetch) {
        setLoading(false)
        return
      }

      if (!need || !other) {
        const { data: needData } = await supabase
          .from('needs')
          .select('*')
          .eq('id', needIdToFetch)
          .single()
        if (needData) {
          setNeed(needData)
          const { data: buyerData } = await supabase
            .from('companies')
            .select('id, name_en, name_ar, logo_url, is_verified')
            .eq('id', needData.buyer_company_id)
            .single()
          if (buyerData) {
            setOther({
              id: buyerData.id,
              type: 'buyer',
              name_en: buyerData.name_en,
              name_ar: buyerData.name_ar,
              logo_url: buyerData.logo_url || DEFAULT_AVATAR,
              is_verified: buyerData.is_verified,
            })
          }
        }
      }

      const { data: existingMsgs } = await supabase
        .from('messages')
        .select('*')
        .eq('need_id', needIdToFetch)
        .order('created_at', { ascending: true })
        .limit(50)

      if (existingMsgs && existingMsgs.length > 0) {
        setMessages(
          existingMsgs.map((m) => ({
            id: m.id,
            text: m.content,
            sender:
              m.sender_id === DEMO_VENDOR_ID || m.sender_id === DEMO_BUYER_ID
                ? 'me'
                : 'other',
            time: new Date(m.created_at),
          }))
        )
      }
      setLoading(false)
    }
    hydrate()
  }, [id, queryNeedId, queryVendorId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  const formatTime = (d) => {
    const date = d instanceof Date ? d : new Date(d)
    const h = date.getHours()
    const m = date.getMinutes().toString().padStart(2, '0')
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return
    const newMsg = {
      id: `local-${Date.now()}`,
      text,
      sender: 'me',
      time: new Date(),
    }
    setMessages((prev) => [...prev, newMsg])
    setInput('')
    inputRef.current?.focus()

    try {
      await supabase.from('messages').insert([
        {
          need_id: need?.id || null,
          sender_id: isVendorChat ? DEMO_BUYER_ID : DEMO_VENDOR_ID,
          recipient_company_id: other?.id || null,
          content: text,
          message_type: 'text',
        },
      ])
    } catch (e) {}

    setTimeout(() => setTyping(true), 600)
    setTimeout(() => {
      setTyping(false)
      const replies = isAr ? REPLIES_AR : REPLIES_EN
      const pick = replies[Math.floor(Math.random() * replies.length)]
      setMessages((prev) => [
        ...prev,
        {
          id: `other-${Date.now()}`,
          text: pick,
          sender: 'other',
          time: new Date(),
        },
      ])
    }, 2200)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const otherName = isAr ? other?.name_ar : other?.name_en
  const needTitle = isAr ? need?.title_ar : need?.title_en
  const avatarSrc = other?.logo_url || DEFAULT_AVATAR

  if (loading)
    return (
      <div className='ct-loading'>
        <div className='ct-pulse' />
      </div>
    )

  return (
    <div
      className='ct-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='ct-bg'>
        <div className='ct-bg-1' />
        <div className='ct-bg-2' />
      </div>

      <div className='ct-topbar'>
        <button className='ct-back' onClick={() => navigate(-1)}>
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

        <div
          className='ct-buyer-info'
          onClick={() => other && navigate(`/vendor/${other.id}`)}
        >
          <img
            src={avatarSrc}
            alt=''
            className='ct-buyer-logo'
            onError={(e) => {
              e.target.src = DEFAULT_AVATAR
            }}
          />
          <div className='ct-buyer-text'>
            <div className='ct-buyer-name-row'>
              <span className='ct-buyer-name'>
                {otherName ||
                  (isVendorChat
                    ? isAr
                      ? 'المورد'
                      : 'Vendor'
                    : isAr
                      ? 'المشتري'
                      : 'Buyer')}
              </span>
              {other?.is_verified && (
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none'>
                  <circle cx='12' cy='12' r='10' fill='#00a7e5' />
                  <path
                    d='M8 12l3 3 5-6'
                    stroke='#cccccc'
                    strokeWidth='2.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    fill='none'
                  />
                </svg>
              )}
            </div>
            <div className='ct-online-row'>
              <span className='ct-online-dot' />
              <span className='ct-online-text'>
                {isAr ? 'متصل الآن' : 'Online now'}
              </span>
            </div>
          </div>
        </div>

        <div className='ct-menu-wrap'>
          <button
            className='ct-icon-btn'
            onClick={() => setShowMenu(!showMenu)}
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
              <circle cx='12' cy='12' r='1' />
              <circle cx='12' cy='5' r='1' />
              <circle cx='12' cy='19' r='1' />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className='ct-menu-backdrop'
                onClick={() => setShowMenu(false)}
              />
              <div className='ct-menu-dropdown'>
                <button
                  className='ct-menu-item'
                  onClick={() => {
                    setShowMenu(false)
                    if (other) navigate(`/vendor/${other.id}`)
                  }}
                >
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
                    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                    <circle cx='12' cy='7' r='4' />
                  </svg>
                  <span>{isAr ? 'عرض الملف الشخصي' : 'View Profile'}</span>
                </button>
                <button
                  className='ct-menu-item'
                  onClick={() => {
                    setShowMenu(false)
                    alert(isAr ? 'تم حظر المستخدم' : 'User blocked')
                  }}
                >
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
                    <circle cx='12' cy='12' r='10' />
                    <line x1='4.93' y1='4.93' x2='19.07' y2='19.07' />
                  </svg>
                  <span>{isAr ? 'حظر' : 'Block'}</span>
                </button>
                <button
                  className='ct-menu-item ct-menu-item-danger'
                  onClick={() => {
                    setShowMenu(false)
                    alert(isAr ? 'تم الإبلاغ' : 'Reported')
                  }}
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#EF4444'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
                    <line x1='12' y1='9' x2='12' y2='13' />
                    <line x1='12' y1='17' x2='12.01' y2='17' />
                  </svg>
                  <span>{isAr ? 'إبلاغ' : 'Report'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {need && showContextCard && (
        <div className='ct-context-card'>
          <div className='ct-context-icon'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#00a7e5'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
              <polyline points='14 2 14 8 20 8' />
            </svg>
          </div>
          <div className='ct-context-text'>
            <span className='ct-context-label'>
              {isAr ? 'بخصوص الطلب' : 'About this need'}
            </span>
            <span
              className='ct-context-title'
              onClick={() => navigate(`/need/${need.id}`)}
            >
              {needTitle || (isAr ? 'طلب' : 'Need')}
            </span>
          </div>
          <button
            className='ct-context-close'
            onClick={() => setShowContextCard(false)}
          >
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#6b7280'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </button>
        </div>
      )}

      <div className='ct-scroll' ref={scrollRef}>
        {messages.length === 0 && (
          <div className='ct-empty'>
            <div className='ct-empty-icon'>
              <svg
                width='40'
                height='40'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#00a7e5'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
              </svg>
            </div>
            <p className='ct-empty-title'>
              {isAr ? 'ابدأ المحادثة' : 'Start the conversation'}
            </p>
            <p className='ct-empty-sub'>
              {isAr
                ? `أرسل رسالة إلى ${otherName || (isVendorChat ? 'المورد' : 'المشتري')}`
                : `Send a message to ${otherName || (isVendorChat ? 'the vendor' : 'the buyer')}`}
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const prev = messages[i - 1]
          const showTime =
            !prev ||
            new Date(msg.time) - new Date(prev.time) > 5 * 60 * 1000 ||
            prev.sender !== msg.sender
          return (
            <div
              key={msg.id}
              className={`ct-msg-wrap ${msg.sender === 'me' ? 'ct-msg-me' : 'ct-msg-them'}`}
            >
              {showTime && (
                <span className='ct-msg-time'>{formatTime(msg.time)}</span>
              )}
              <div
                className={`ct-bubble ${msg.sender === 'me' ? 'ct-bubble-me' : 'ct-bubble-them'}`}
              >
                {msg.text}
              </div>
            </div>
          )
        })}

        {typing && (
          <div className='ct-msg-wrap ct-msg-them'>
            <div className='ct-bubble ct-bubble-them ct-typing'>
              <span className='ct-typing-dot' />
              <span className='ct-typing-dot' />
              <span className='ct-typing-dot' />
            </div>
          </div>
        )}

        <div style={{ height: '12px' }} />
      </div>

      <div className='ct-inputbar'>
        <button className='ct-attach-btn'>
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#b0b0b0'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48' />
          </svg>
        </button>
        <input
          ref={inputRef}
          className='ct-input'
          placeholder={isAr ? 'اكتب رسالة...' : 'Type a message...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          className={`ct-send-btn ${input.trim() ? 'ct-send-active' : ''}`}
          onClick={sendMessage}
          disabled={!input.trim()}
        >
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
            <line x1='22' y1='2' x2='11' y2='13' />
            <polygon points='22 2 15 22 11 13 2 9 22 2' />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ChatThread
