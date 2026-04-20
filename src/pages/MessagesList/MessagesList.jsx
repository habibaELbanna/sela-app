import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import BottomNav from '../../components/BottomNav/BottomNav'
import Preloader from '../../components/Preloader/Preloader'
import './MessagesList.css'

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000002'

const FALLBACK_THREADS = [
  {
    id: 'fb-1',
    name: 'Ahmed Hassan - TechCorp',
    type: 'buyer',
    subject: 'Re: Office Furniture',
    preview: 'Thanks for the quick response. When can you start the project? We need to finalize',
    time: '2h ago',
    unread: 2,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    archived: false,
    vendorId: null,
    needId: 101,
  },
  {
    id: 'fb-2',
    name: 'Mariam Youssef - BuildRight',
    type: 'vendor',
    subject: 'Re: Construction Project',
    preview: "We can deliver by next week as discussed. I'll send over the final contract",
    time: '5h ago',
    unread: 1,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    archived: false,
    vendorId: 1,
    needId: null,
  },
  {
    id: 'fb-3',
    name: 'Omar Khalil - StartupHub',
    type: 'buyer',
    subject: 'Re: IT Equipment',
    preview: "Great! Let's finalize the proposal details. When can we schedule a call?",
    time: '1d ago',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
    archived: false,
    vendorId: null,
    needId: 102,
  },
  {
    id: 'fb-4',
    name: 'Sara Ahmed - CaterPro',
    type: 'vendor',
    subject: 'Re: Catering Services',
    preview: "I've sent the updated pricing. Please review and let me know if you have any questions.",
    time: '2d ago',
    unread: 5,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    archived: false,
    vendorId: 2,
    needId: null,
  },
  {
    id: 'fb-5',
    name: 'Mohamed Adel - Digital Solutions',
    type: 'vendor',
    subject: 'Re: Software Development',
    preview: "Perfect! I'll prepare the demo for next Tuesday. Looking forward to showing you.",
    time: '3d ago',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    archived: false,
    vendorId: 3,
    needId: null,
  },
  {
    id: 'fb-6',
    name: 'Layla Ibrahim - GreenSpace',
    type: 'buyer',
    subject: 'Re: Office Plants',
    preview: 'The samples look great. Can we arrange delivery for next Monday?',
    time: '4d ago',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    archived: false,
    vendorId: null,
    needId: 103,
  },
]

const MessagesList = () => {
  const navigate = useNavigate()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  useEffect(() => {
    const fetchThreads = async () => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${DEMO_USER_ID},recipient_company_id.eq.${DEMO_USER_ID}`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (msgs && msgs.length > 0) {
        const byThread = {}
        msgs.forEach((m) => {
          const key = m.need_id || m.recipient_company_id || m.sender_id
          if (!byThread[key]) byThread[key] = []
          byThread[key].push(m)
        })

        const threadList = []
        for (const key of Object.keys(byThread)) {
          const sorted = byThread[key].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          const last = sorted[0]
          threadList.push({
            id: `real-${key}`,
            name: 'Contact',
            type: last.need_id ? 'buyer' : 'vendor',
            subject: 'Conversation',
            preview: last.content,
            time: getTimeAgo(last.created_at),
            unread: 0,
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            archived: false,
            needId: last.need_id,
            vendorId: last.recipient_company_id,
          })
        }

        if (threadList.length > 0) {
          setThreads([...threadList, ...FALLBACK_THREADS])
        } else {
          setThreads(FALLBACK_THREADS)
        }
      } else {
        setThreads(FALLBACK_THREADS)
      }
      setLoading(false)
    }
    fetchThreads()
  }, [])

  const getTimeAgo = (date) => {
    const diff = (new Date() - new Date(date)) / 1000
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const openThread = (thread) => {
    if (thread.needId) {
      navigate(`/messages/${thread.id}?need=${thread.needId}`)
    } else if (thread.vendorId) {
      navigate(`/messages/${thread.id}?vendor=${thread.vendorId}`, {
        state: {
          vendorCompanyId: thread.vendorId,
          vendorCompanyName: thread.name,
          vendorCompanyNameEn: thread.name,
          vendorCompanyNameAr: thread.name,
          vendorLogoUrl: thread.avatar,
          vendorAvatarUrl: thread.avatar,
          vendorIsVerified: false,
          fromVendor: true,
        },
      })
    } else {
      navigate(`/messages/${thread.id}`)
    }
  }

  const getFiltered = () => {
    if (activeTab === 'unread') return threads.filter((t) => t.unread > 0 && !t.archived)
    if (activeTab === 'archived') return threads.filter((t) => t.archived)
    return threads.filter((t) => !t.archived)
  }

  if (loading) return <Preloader />

  const filtered = getFiltered()

  return (
    <div className='ml-container' dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Tajawal, sans-serif' : 'Helvetica, Arial, sans-serif' }}>

      <div className='ml-bg'>
        <div className='ml-bg-1' />
        <div className='ml-bg-2' />
      </div>

      <div className='ml-scroll-area'>

        <div className='ml-header'>
          <div className='ml-header-row'>
            <h1 className='ml-title'>{isAr ? 'الرسائل' : 'Messages'}</h1>
            <div className='ml-header-actions'>
              <button className='ml-icon-btn' onClick={() => navigate('/search')}>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
                </svg>
              </button>
              <button className='ml-icon-btn' onClick={() => navigate('/profile/notifications')}>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/>
                </svg>
              </button>
              <button className='ml-icon-btn'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3'/>
                </svg>
              </button>
            </div>
          </div>

          <div className='ml-tabs'>
            {['all', 'unread', 'archived'].map((t) => (
              <button
                key={t}
                className={`ml-tab ${activeTab === t ? 'ml-tab-active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t === 'all' ? (isAr ? 'الكل' : 'All') :
                 t === 'unread' ? (isAr ? 'غير مقروء' : 'Unread') :
                 (isAr ? 'المؤرشفة' : 'Archived')}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && activeTab === 'archived' && (
          <div className='ml-empty'>
            <div className='ml-empty-emoji'>
              <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M22 12h-4l-3 9L9 3l-3 9H2'/>
              </svg>
            </div>
            <h2 className='ml-empty-title'>{isAr ? 'لا توجد رسائل مؤرشفة' : 'No Archived Messages'}</h2>
            <p className='ml-empty-sub'>{isAr ? 'ستظهر الرسائل المؤرشفة هنا' : 'Archived conversations will appear here'}</p>
          </div>
        )}

        {filtered.length === 0 && activeTab === 'unread' && (
          <div className='ml-empty'>
            <div className='ml-empty-emoji'>
              <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='#10B981' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                <polyline points='20 6 9 17 4 12'/>
              </svg>
            </div>
            <h2 className='ml-empty-title'>{isAr ? 'لا توجد رسائل غير مقروءة' : 'All Caught Up!'}</h2>
            <p className='ml-empty-sub'>{isAr ? 'لقد قرأت جميع رسائلك' : "You've read all your messages"}</p>
          </div>
        )}

        {filtered.length === 0 && activeTab === 'all' && (
          <div className='ml-empty'>
            <div className='ml-empty-emoji'>
              <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/>
              </svg>
            </div>
            <h2 className='ml-empty-title'>{isAr ? 'لا توجد رسائل بعد' : 'No Messages Yet'}</h2>
            <p className='ml-empty-sub'>{isAr ? 'ابدأ محادثة مع الموردين أو المشترين' : 'Start a conversation with vendors or buyers'}</p>
            <button className='ml-empty-btn' onClick={() => navigate('/browse-needs')}>
              {isAr ? 'تصفح الفرص' : 'Browse Opportunities'}
            </button>
          </div>
        )}

        <div className='ml-list'>
          {filtered.map((thread) => (
            <div key={thread.id} className='ml-thread' onClick={() => openThread(thread)}>
              <img src={thread.avatar} alt='' className='ml-avatar' onError={(e) => { e.target.src = 'https://randomuser.me/api/portraits/men/32.jpg' }} />

              <div className='ml-thread-body'>
                <div className='ml-thread-top'>
                  <div className='ml-thread-name-row'>
                    <span className='ml-thread-name'>{thread.name}</span>
                    <span className={`ml-type-badge ml-type-${thread.type}`}>
                      {thread.type === 'buyer' ? (isAr ? 'مشتري' : 'Buyer') : (isAr ? 'مورد' : 'Vendor')}
                    </span>
                  </div>
                  <span className='ml-thread-time'>{thread.time}</span>
                </div>

                <span className='ml-thread-subject'>{thread.subject}</span>

                <div className='ml-thread-bottom'>
                  <p className='ml-thread-preview'>{thread.preview}</p>
                  {thread.unread > 0 && (
                    <span className='ml-unread-badge'>{thread.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: '80px' }} />
      </div>

      <BottomNav />
    </div>
  )
}

export default MessagesList
