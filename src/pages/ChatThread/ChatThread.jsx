import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom'
import Preloader from '../../components/Preloader/Preloader'
import { supabase } from '../../supabase'
import './ChatThread.css'

const DEMO_VENDOR_ID = 'a0000000-0000-0000-0000-000000000002'

const BUYER_REPLIES_EN = [
  "Hi! Thanks for reaching out. Happy to discuss the details.",
  "Great question — let me check with the team and get back to you.",
  "Yes, we're flexible on the timeline if the quality meets our standards.",
  "Can you share some references or past work similar to this?",
  "The budget range is firm, but we can negotiate based on scope.",
  "Sounds good. When can you deliver a detailed proposal?",
  "We're looking for long-term partners, not just one-off vendors.",
  "Delivery location is our main office. Installation on-site is required."
]

const BUYER_REPLIES_AR = [
  "مرحباً! شكراً للتواصل. يسعدني مناقشة التفاصيل.",
  "سؤال ممتاز — دعني أتحقق مع الفريق وأعود إليك.",
  "نعم، لدينا مرونة في الجدول الزمني إذا كانت الجودة تلبي معاييرنا.",
  "هل يمكنك مشاركة بعض المراجع أو الأعمال السابقة المشابهة؟",
  "نطاق الميزانية ثابت، لكن يمكننا التفاوض بناءً على النطاق.",
  "يبدو جيداً. متى يمكنك تسليم عرض مفصل؟",
  "نبحث عن شركاء طويلي الأمد، وليس مجرد موردين لمرة واحدة.",
  "موقع التسليم هو مكتبنا الرئيسي. التركيب في الموقع مطلوب."
]

const ChatThread = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const queryNeedId = searchParams.get('need')
  const passed = location.state || {}
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  const [need, setNeed] = useState(passed.needId ? {
    id: passed.needId,
    title_en: passed.needTitleEn,
    title_ar: passed.needTitleAr
  } : null)
  const [buyer, setBuyer] = useState(passed.buyerCompanyId ? {
    id: passed.buyerCompanyId,
    name_en: passed.buyerCompanyNameEn,
    name_ar: passed.buyerCompanyNameAr,
    logo_url: passed.buyerLogoUrl,
    is_verified: passed.buyerIsVerified
  } : null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(!passed.needId || !passed.buyerCompanyId)
  const [showContextCard, setShowContextCard] = useState(true)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const hydrate = async () => {
      const needIdToFetch = passed.needId || queryNeedId || (id && !isNaN(parseInt(id)) ? id : null)
      if (!needIdToFetch) { setLoading(false); return }

      if (!need || !buyer) {
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
          if (buyerData) setBuyer(buyerData)
        }
      }

      const { data: existingMsgs } = await supabase
        .from('messages')
        .select('*')
        .eq('need_id', needIdToFetch)
        .order('created_at', { ascending: true })
        .limit(50)

      if (existingMsgs && existingMsgs.length > 0) {
        setMessages(existingMsgs.map(m => ({
          id: m.id,
          text: m.content,
          sender: m.sender_id === DEMO_VENDOR_ID ? 'me' : 'buyer',
          time: new Date(m.created_at)
        })))
      }
      setLoading(false)
    }
    hydrate()
  }, [id, queryNeedId])

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
      time: new Date()
    }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    inputRef.current?.focus()

    try {
      await supabase.from('messages').insert([{
        need_id: need?.id || null,
        sender_id: DEMO_VENDOR_ID,
        recipient_company_id: buyer?.id || null,
        content: text,
        message_type: 'text'
      }])
    } catch (e) {}

    setTimeout(() => setTyping(true), 600)
    setTimeout(() => {
      setTyping(false)
      const replies = isAr ? BUYER_REPLIES_AR : BUYER_REPLIES_EN
      const pick = replies[Math.floor(Math.random() * replies.length)]
      setMessages(prev => [...prev, {
        id: `buyer-${Date.now()}`,
        text: pick,
        sender: 'buyer',
        time: new Date()
      }])
    }, 2200)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const buyerName = isAr ? buyer?.name_ar : buyer?.name_en
  const needTitle = isAr ? need?.title_ar : need?.title_en

  if (loading) return <div className='ct-loading'><div className='ct-pulse' /></div>

  return (
    <div className='ct-container' dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Tajawal, sans-serif' : 'Helvetica, Arial, sans-serif' }}>

      <div className='ct-bg'>
        <div className='ct-bg-1' />
        <div className='ct-bg-2' />
      </div>

      <div className='ct-topbar'>
        <button className='ct-back' onClick={() => navigate(-1)}>
          <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M19 12H5'/><polyline points='12 19 5 12 12 5'/>
          </svg>
        </button>

        <div className='ct-buyer-info' onClick={() => buyer && navigate(`/vendor/${buyer.id}`)}>
          {buyer?.logo_url ? (
            <img src={buyer.logo_url} alt='' className='ct-buyer-logo' />
          ) : (
            <div className='ct-buyer-logo-placeholder'>
              {(buyerName || '?').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className='ct-buyer-text'>
            <div className='ct-buyer-name-row'>
              <span className='ct-buyer-name'>{buyerName || (isAr ? 'المشتري' : 'Buyer')}</span>
              {buyer?.is_verified && (
                <svg width='13' height='13' viewBox='0 0 24 24' fill='#00a7e5'>
                  <path d='M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'/>
                </svg>
              )}
            </div>
            <div className='ct-online-row'>
              <span className='ct-online-dot' />
              <span className='ct-online-text'>{isAr ? 'متصل الآن' : 'Online now'}</span>
            </div>
          </div>
        </div>

        <button className='ct-icon-btn'>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <circle cx='12' cy='12' r='1'/><circle cx='12' cy='5' r='1'/><circle cx='12' cy='19' r='1'/>
          </svg>
        </button>
      </div>

      {need && showContextCard && (
        <div className='ct-context-card'>
          <div className='ct-context-icon'>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2'>
              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/>
              <polyline points='14 2 14 8 20 8'/>
            </svg>
          </div>
          <div className='ct-context-text'>
            <span className='ct-context-label'>{isAr ? 'بخصوص الطلب' : 'About this need'}</span>
            <span className='ct-context-title' onClick={() => navigate(`/need/${need.id}`)}>
              {needTitle || (isAr ? 'طلب' : 'Need')}
            </span>
          </div>
          <button className='ct-context-close' onClick={() => setShowContextCard(false)}>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='2'>
              <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
            </svg>
          </button>
        </div>
      )}

      <div className='ct-scroll' ref={scrollRef}>
        {messages.length === 0 && (
          <div className='ct-empty'>
            <div className='ct-empty-icon'>
              <svg width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='1.5'>
                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/>
              </svg>
            </div>
            <p className='ct-empty-title'>{isAr ? 'ابدأ المحادثة' : 'Start the conversation'}</p>
            <p className='ct-empty-sub'>
              {isAr
                ? `أرسل رسالة إلى ${buyerName || 'المشتري'} حول هذا الطلب`
                : `Send a message to ${buyerName || 'the buyer'} about this need`}
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const prev = messages[i - 1]
          const showTime = !prev || (new Date(msg.time) - new Date(prev.time)) > 5 * 60 * 1000 || prev.sender !== msg.sender
          return (
            <div key={msg.id} className={`ct-msg-wrap ${msg.sender === 'me' ? 'ct-msg-me' : 'ct-msg-them'}`}>
              {showTime && (
                <span className='ct-msg-time'>{formatTime(msg.time)}</span>
              )}
              <div className={`ct-bubble ${msg.sender === 'me' ? 'ct-bubble-me' : 'ct-bubble-them'}`}>
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
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#b0b0b0' strokeWidth='2'>
            <path d='M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48'/>
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
          <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <line x1='22' y1='2' x2='11' y2='13'/><polygon points='22 2 15 22 11 13 2 9 22 2'/>
          </svg>
        </button>
      </div>

    </div>
  )
}

export default ChatThread
