import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import BottomNav from '../../components/BottomNav/BottomNav'
import Preloader from '../../components/Preloader/Preloader'
import { getAvatar } from '../../Avatars'
import './MessagesList.css'

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001'

const MessagesList = () => {
  const navigate = useNavigate()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  const FALLBACK_THREADS = [
    {
      id: 'fb-1',
      otherName: 'Ahmed Hassan',
      otherNameAr: 'أحمد حسن',
      company: 'BuildRight Construction',
      companyAr: 'BuildRight للإنشاءات',
      type: 'vendor',
      subject: 'Re: Office Furniture Supply',
      subjectAr: 'بخصوص توريد أثاث المكاتب',
      preview:
        'Thanks for the proposal. Can you confirm the delivery timeline for the full order?',
      previewAr: 'شكراً على العرض. هل يمكنك تأكيد جدول التسليم للطلب الكامل؟',
      time: '2m',
      unread: 2,
      avatar:
        'https://images.unsplash.com/photo-1718209881014-83732ea8376d?q=80&w=400&h=400&fit=crop&crop=faces',
    },
    {
      id: 'fb-2',
      otherName: 'Sara Ibrahim',
      otherNameAr: 'سارة إبراهيم',
      company: 'NileTech Solutions',
      companyAr: 'NileTech للحلول',
      type: 'buyer',
      subject: 'Re: IT Infrastructure Setup',
      subjectAr: 'بخصوص تجهيز البنية التحتية',
      preview:
        'We would like to schedule a site visit next week. Please share your availability.',
      previewAr:
        'نود تحديد موعد لزيارة الموقع الأسبوع القادم. برجاء مشاركة أوقاتك المتاحة.',
      time: '1h',
      unread: 1,
      avatar:
        'https://images.unsplash.com/photo-1627161683077-e34782c24d81?q=80&w=400&h=400&fit=crop&crop=faces',
    },
    {
      id: 'fb-3',
      otherName: 'Mohamed Ali',
      otherNameAr: 'محمد علي',
      company: 'Delta Engineering',
      companyAr: 'Delta للهندسة',
      type: 'vendor',
      subject: 'Re: Warehouse Renovation',
      subjectAr: 'بخصوص تجديد المستودع',
      preview:
        'Attached the updated blueprints with your requested changes. Let me know your thoughts.',
      previewAr: 'مرفق المخططات المحدثة بالتغييرات المطلوبة. أخبرني برأيك.',
      time: '3h',
      unread: 0,
      avatar: getAvatar('mohamed-ali', 'male'),
    },
    {
      id: 'fb-4',
      otherName: 'Nour El-Din',
      otherNameAr: 'نور الدين',
      company: 'Pyramid Foods',
      companyAr: 'Pyramid للأغذية',
      type: 'buyer',
      subject: 'Re: Conference Catering',
      subjectAr: 'بخصوص تقديم الطعام للمؤتمر',
      preview:
        'Perfect. Looking forward to the event. Final headcount confirmed at 250 guests.',
      previewAr: 'ممتاز. بانتظار الحدث. تم تأكيد العدد النهائي 250 ضيف.',
      time: '1d',
      unread: 0,
      avatar: getAvatar('nour-eldin', 'female'),
    },
    {
      id: 'fb-5',
      otherName: 'Youssef Mahmoud',
      otherNameAr: 'يوسف محمود',
      company: 'Cairo Logistics',
      companyAr: 'Cairo للخدمات اللوجستية',
      type: 'vendor',
      subject: 'Re: Transport Services',
      subjectAr: 'بخصوص خدمات النقل',
      preview:
        'Our team is ready to start on Monday. Do you need any additional documentation?',
      previewAr: 'فريقنا جاهز للبدء يوم الإثنين. هل تحتاج أي مستندات إضافية؟',
      time: '2d',
      unread: 3,
      avatar:
        'https://images.unsplash.com/photo-1605949405965-d49ada3f9189?q=80&w=400&h=400&fit=crop&crop=faces',
    },
    {
      id: 'fb-6',
      otherName: 'Mariam Hassan',
      otherNameAr: 'مريم حسن',
      company: 'El-Fanar Suppliers',
      companyAr: 'El-Fanar للتوريدات',
      type: 'buyer',
      subject: 'Re: Marketing Materials',
      subjectAr: 'بخصوص المواد التسويقية',
      preview: 'We approved the final design. When can production start?',
      previewAr: 'تمت الموافقة على التصميم النهائي. متى يمكن بدء الإنتاج؟',
      time: '3d',
      unread: 0,
      avatar: getAvatar('mariam-hassan', 'female'),
    },
  ]

  useEffect(() => {
    const fetchThreads = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${DEMO_USER_ID},receiver_id.eq.${DEMO_USER_ID}`)
        .order('created_at', { ascending: false })
        .limit(20)

      const realThreads = []
      if (data && data.length > 0) {
        const seen = new Set()
        data.forEach((m) => {
          const otherId =
            m.sender_id === DEMO_USER_ID ? m.receiver_id : m.sender_id
          if (!seen.has(otherId)) {
            seen.add(otherId)
            realThreads.push({
              id: m.id,
              otherId,
              otherName: 'User ' + otherId.slice(0, 6),
              otherNameAr: 'مستخدم ' + otherId.slice(0, 6),
              company: '',
              companyAr: '',
              type: 'buyer',
              subject: m.subject || (isAr ? 'محادثة' : 'Conversation'),
              subjectAr: m.subject || 'محادثة',
              preview: m.content?.slice(0, 80) || '',
              previewAr: m.content?.slice(0, 80) || '',
              time: new Date(m.created_at).toLocaleDateString(),
              unread: m.is_read ? 0 : 1,
              avatar: getAvatar(otherId),
            })
          }
        })
      }

      setThreads([...realThreads, ...FALLBACK_THREADS])
      setLoading(false)
    }
    fetchThreads()
  }, [isAr])

  const filteredThreads = () => {
    let list = threads
    if (activeTab === 'unread') list = list.filter((t) => t.unread > 0)
    if (activeTab === 'archived') list = []
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (t) =>
          t.otherName.toLowerCase().includes(q) ||
          t.company.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q)
      )
    }
    return list
  }

  const openThread = (t) => {
    navigate(`/messages/${t.id}`, {
      state: {
        otherName: isAr ? t.otherNameAr : t.otherName,
        otherCompany: isAr ? t.companyAr : t.company,
        otherAvatar: t.avatar,
        otherType: t.type,
        subject: isAr ? t.subjectAr : t.subject,
      },
    })
  }

  if (loading) return <Preloader />

  const results = filteredThreads()
  const unreadCount = threads.filter((t) => t.unread > 0).length

  return (
    <div
      className='ml-container'
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isAr
          ? 'Tajawal, sans-serif'
          : 'Helvetica, Arial, sans-serif',
      }}
    >
      <div className='ml-bg'>
        <div className='ml-bg-1' />
        <div className='ml-bg-2' />
      </div>

      <div className='ml-scroll'>
        <div className='ml-topbar'>
          <h1 className='ml-topbar-title'>{isAr ? 'الرسائل' : 'Messages'}</h1>
          <div className='ml-topbar-actions'>
            <button
              className='ml-icon-btn'
              aria-label='Search'
              onClick={() => setShowSearch(!showSearch)}
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
              className='ml-icon-btn'
              aria-label='Notifications'
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
              className='ml-icon-btn'
              aria-label='New message'
              onClick={() => navigate('/messages/new')}
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
                <line x1='12' y1='5' x2='12' y2='19' />
                <line x1='5' y1='12' x2='19' y2='12' />
              </svg>
            </button>
          </div>
        </div>

        {showSearch && (
          <div className='ml-search-wrap'>
            <input
              type='text'
              className='ml-search-input'
              placeholder={
                isAr ? 'ابحث في المحادثات...' : 'Search conversations...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className='ml-tabs'>
          <button
            className={`ml-tab ${activeTab === 'all' ? 'ml-tab-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          <button
            className={`ml-tab ${activeTab === 'unread' ? 'ml-tab-active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            <span>{isAr ? 'غير مقروءة' : 'Unread'}</span>
            {unreadCount > 0 && (
              <span className='ml-tab-badge'>{unreadCount}</span>
            )}
          </button>
          <button
            className={`ml-tab ${activeTab === 'archived' ? 'ml-tab-active' : ''}`}
            onClick={() => setActiveTab('archived')}
          >
            {isAr ? 'مؤرشفة' : 'Archived'}
          </button>
        </div>

        {results.length === 0 && (
          <div className='ml-empty'>
            <svg
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#00a7e5'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
            </svg>
            <h3 className='ml-empty-title'>
              {activeTab === 'unread'
                ? isAr
                  ? 'لا رسائل غير مقروءة'
                  : 'No Unread Messages'
                : activeTab === 'archived'
                  ? isAr
                    ? 'لا رسائل مؤرشفة'
                    : 'No Archived Messages'
                  : isAr
                    ? 'لا رسائل بعد'
                    : 'No Messages Yet'}
            </h3>
            <p className='ml-empty-sub'>
              {isAr
                ? 'ابدأ محادثة مع مورد أو مشتري من قائمة التصفح'
                : 'Start a conversation from Browse'}
            </p>
          </div>
        )}

        <div className='ml-list'>
          {results.map((t) => (
            <div key={t.id} className='ml-thread' onClick={() => openThread(t)}>
              <img
                src={t.avatar}
                alt=''
                className='ml-avatar'
                onError={(e) => {
                  e.target.src = getAvatar('default', 'male')
                }}
              />
              <div className='ml-thread-body'>
                <div className='ml-row-top'>
                  <div className='ml-name-row'>
                    <span className='ml-name'>
                      {isAr ? t.otherNameAr : t.otherName}
                    </span>
                    <span
                      className={`ml-type-badge ${t.type === 'vendor' ? 'ml-type-vendor' : 'ml-type-buyer'}`}
                    >
                      {t.type === 'vendor'
                        ? isAr
                          ? 'مورد'
                          : 'Vendor'
                        : isAr
                          ? 'مشتري'
                          : 'Buyer'}
                    </span>
                  </div>
                  <span className='ml-time'>{t.time}</span>
                </div>
                {(t.company || t.companyAr) && (
                  <span className='ml-company'>
                    {isAr ? t.companyAr : t.company}
                  </span>
                )}
                <span className='ml-subject'>
                  {isAr ? t.subjectAr : t.subject}
                </span>
                <div className='ml-preview-row'>
                  <p className='ml-preview'>{isAr ? t.previewAr : t.preview}</p>
                  {t.unread > 0 && (
                    <span className='ml-unread-count'>{t.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: '90px' }} />
      </div>

      <BottomNav />
    </div>
  )
}

export default MessagesList
