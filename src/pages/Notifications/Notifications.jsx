import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Notifications.css'

const Notifications = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [notifs, setNotifs] = useState([
    {
      id: 1,
      type: 'proposal_accepted',
      category: 'proposals',
      unread: true,
      title_en: 'Proposal Accepted!',
      title_ar: 'تم قبول العرض!',
      desc_en: 'TechCorp accepted your proposal for Office Furniture',
      desc_ar: 'قبلت TechCorp عرضك لأثاث المكاتب',
      time_en: '2 hours ago',
      time_ar: 'منذ ساعتين',
      group: 'today',
      action_en: 'View Details',
      action_ar: 'عرض التفاصيل',
      actionPath: '/browse-needs',
    },
    {
      id: 2,
      type: 'message',
      category: 'messages',
      unread: true,
      title_en: 'New Message from Ahmed Hassan',
      title_ar: 'رسالة جديدة من أحمد حسن',
      desc_en: 'Thanks for the quick response. When can you...',
      desc_ar: 'شكراً للاستجابة السريعة. متى يمكنك...',
      time_en: '5 hours ago',
      time_ar: 'منذ 5 ساعات',
      group: 'today',
      action_en: 'Reply',
      action_ar: 'رد',
      actionPath: '/messages',
    },
    {
      id: 3,
      type: 'proposal_received',
      category: 'proposals',
      unread: false,
      title_en: 'New Proposal Received',
      title_ar: 'تم استلام عرض جديد',
      desc_en: 'BuildRight Construction submitted a proposal for your Construction Project need',
      desc_ar: 'قدمت BuildRight Construction عرضاً لمشروع البناء الخاص بك',
      time_en: '1 day ago',
      time_ar: 'منذ يوم',
      group: 'week',
      action_en: 'Review Proposal',
      action_ar: 'مراجعة العرض',
      actionPath: '/my-proposals',
    },
    {
      id: 4,
      type: 'deadline',
      category: 'proposals',
      unread: false,
      urgent: true,
      title_en: 'Proposal Deadline Soon!',
      title_ar: 'اقتراب موعد تقديم العرض!',
      desc_en: 'Office Furniture need closes in 2 hours',
      desc_ar: 'طلب أثاث المكاتب يغلق خلال ساعتين',
      time_en: '2 days ago',
      time_ar: 'منذ يومين',
      group: 'week',
      action_en: 'Extend Deadline',
      action_ar: 'تمديد الموعد',
      actionPath: '/my-needs',
    },
    {
      id: 5,
      type: 'payment',
      category: 'proposals',
      unread: false,
      title_en: 'Payment Received',
      title_ar: 'تم استلام الدفعة',
      desc_en: 'EGP 4,500 has been credited to your account',
      desc_ar: 'تم إيداع 4,500 جنيه في حسابك',
      time_en: '3 days ago',
      time_ar: 'منذ 3 أيام',
      group: 'week',
      action_en: 'View Transaction',
      action_ar: 'عرض المعاملة',
      actionPath: '/profile',
    },
    {
      id: 6,
      type: 'review',
      category: 'proposals',
      unread: false,
      title_en: 'New 5-Star Review!',
      title_ar: 'تقييم جديد 5 نجوم!',
      desc_en: 'BuildCo rated you 5 stars for IT Services project',
      desc_ar: 'قام BuildCo بتقييمك 5 نجوم لمشروع خدمات IT',
      time_en: '5 days ago',
      time_ar: 'منذ 5 أيام',
      group: 'week',
      action_en: 'View Review',
      action_ar: 'عرض التقييم',
      actionPath: '/profile',
    },
    {
      id: 7,
      type: 'match',
      category: 'proposals',
      unread: false,
      title_en: 'High Match Opportunity',
      title_ar: 'فرصة تطابق عالي',
      desc_en: '8 new needs match your profile (95%+ match)',
      desc_ar: '8 طلبات جديدة تطابق ملفك (95%+ تطابق)',
      time_en: '1 week ago',
      time_ar: 'منذ أسبوع',
      group: 'earlier',
      action_en: 'Browse Needs',
      action_ar: 'تصفح الطلبات',
      actionPath: '/browse-needs',
    },
    {
      id: 8,
      type: 'update',
      category: 'system',
      unread: false,
      title_en: 'Platform Update',
      title_ar: 'تحديث المنصة',
      desc_en: 'New features available! Check out the improved proposal system',
      desc_ar: 'ميزات جديدة متاحة! تحقق من نظام العروض المحسّن',
      time_en: '2 weeks ago',
      time_ar: 'منذ أسبوعين',
      group: 'earlier',
      action_en: 'Learn More',
      action_ar: 'اعرف المزيد',
      actionPath: '/profile/settings',
    },
  ])
  const lang = localStorage.getItem('sela_lang') || 'en'
  const isAr = lang === 'ar'

  const unreadCount = notifs.filter((n) => n.unread).length

  const getFiltered = () => {
    if (activeTab === 'unread') return notifs.filter((n) => n.unread)
    if (activeTab === 'proposals') return notifs.filter((n) => n.category === 'proposals')
    if (activeTab === 'messages') return notifs.filter((n) => n.category === 'messages')
    return notifs
  }

  const filtered = getFiltered()

  const groups = {
    today: filtered.filter((n) => n.group === 'today'),
    week: filtered.filter((n) => n.group === 'week'),
    earlier: filtered.filter((n) => n.group === 'earlier'),
  }

  const handleAction = (notif) => {
    setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, unread: false } : n))
    if (notif.actionPath) navigate(notif.actionPath)
  }

  const renderIcon = (type) => {
    if (type === 'proposal_accepted') {
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#10B981' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
          <polyline points='20 6 9 17 4 12'/>
        </svg>
      )
    }
    if (type === 'message') {
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/>
        </svg>
      )
    }
    if (type === 'proposal_received') {
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#FFA500' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/>
          <polyline points='14 2 14 8 20 8'/>
          <line x1='16' y1='13' x2='8' y2='13'/>
          <line x1='16' y1='17' x2='8' y2='17'/>
        </svg>
      )
    }
    if (type === 'deadline') {
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#EF4444' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <circle cx='12' cy='12' r='10'/>
          <polyline points='12 6 12 12 16 14'/>
        </svg>
      )
    }
    if (type === 'payment') {
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#10B981' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <line x1='12' y1='1' x2='12' y2='23'/>
          <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/>
        </svg>
      )
    }
    if (type === 'review') {
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='#FFA500' stroke='#FFA500' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
          <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/>
        </svg>
      )
    }
    if (type === 'match') {
      return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <circle cx='12' cy='12' r='10'/>
          <circle cx='12' cy='12' r='6'/>
          <circle cx='12' cy='12' r='2' fill='#00a7e5'/>
        </svg>
      )
    }
    return (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <circle cx='12' cy='12' r='10'/>
        <line x1='12' y1='16' x2='12' y2='12'/>
        <line x1='12' y1='8' x2='12.01' y2='8'/>
      </svg>
    )
  }

  const renderGroup = (label_en, label_ar, items) => {
    if (items.length === 0) return null
    return (
      <div className='nt-group'>
        <span className='nt-group-label'>{isAr ? label_ar : label_en}</span>
        {items.map((n) => (
          <div key={n.id} className='nt-item' onClick={() => handleAction(n)}>
            {n.unread && <span className='nt-unread-dot' />}
            <div className='nt-icon'>{renderIcon(n.type)}</div>
            <div className='nt-body'>
              <div className='nt-title-row'>
                <span className='nt-title'>{isAr ? n.title_ar : n.title_en}</span>
                {n.urgent && <span className='nt-urgent'>{isAr ? 'عاجل' : 'URGENT'}</span>}
              </div>
              <p className='nt-desc'>{isAr ? n.desc_ar : n.desc_en}</p>
              <div className='nt-bottom'>
                <span className='nt-time'>{isAr ? n.time_ar : n.time_en}</span>
                {n.action_en && (
                  <button className='nt-action' onClick={(e) => { e.stopPropagation(); handleAction(n) }}>
                    {isAr ? n.action_ar : n.action_en}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='nt-container' dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Tajawal, sans-serif' : 'Helvetica, Arial, sans-serif' }}>

      <div className='nt-bg'>
        <div className='nt-bg-1' />
        <div className='nt-bg-2' />
      </div>

      <div className='nt-topbar'>
        <button className='nt-back' onClick={() => navigate(-1)}>
          <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M19 12H5'/><polyline points='12 19 5 12 12 5'/>
          </svg>
        </button>
        <h1 className='nt-topbar-title'>{isAr ? 'الإشعارات' : 'Notifications'}</h1>
        <div className='nt-topbar-actions'>
          <button className='nt-icon-btn' onClick={() => navigate('/search')}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
            </svg>
          </button>
          <button className='nt-icon-btn'>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/>
              <path d='M13.73 21a2 2 0 0 1-3.46 0'/>
            </svg>
          </button>
          <button className='nt-icon-btn'>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3'/>
            </svg>
          </button>
        </div>
      </div>

      <div className='nt-tabs'>
        {['all', 'unread', 'proposals', 'messages'].map((t) => (
          <button
            key={t}
            className={`nt-tab ${activeTab === t ? 'nt-tab-active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            <span>
              {t === 'all' ? (isAr ? 'الكل' : 'All') :
               t === 'unread' ? (isAr ? 'غير مقروء' : 'Unread') :
               t === 'proposals' ? (isAr ? 'العروض' : 'Proposals') :
               (isAr ? 'الرسائل' : 'Messages')}
            </span>
            {t === 'unread' && unreadCount > 0 && (
              <span className='nt-tab-badge'>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className='nt-scroll'>

        {filtered.length === 0 && (
          <div className='nt-empty'>
            <div className='nt-empty-icon'>
              <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='#00a7e5' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/>
                <path d='M13.73 21a2 2 0 0 1-3.46 0'/>
              </svg>
            </div>
            <h2 className='nt-empty-title'>
              {activeTab === 'unread'
                ? (isAr ? 'لا توجد إشعارات جديدة' : 'All Caught Up!')
                : (isAr ? 'لا توجد إشعارات' : 'No Notifications')}
            </h2>
            <p className='nt-empty-sub'>
              {activeTab === 'unread'
                ? (isAr ? 'لقد قرأت جميع إشعاراتك' : "You've read everything")
                : (isAr ? 'ستظهر الإشعارات هنا' : 'Notifications will appear here')}
            </p>
          </div>
        )}

        {renderGroup('Today', 'اليوم', groups.today)}
        {renderGroup('This Week', 'هذا الأسبوع', groups.week)}
        {renderGroup('Earlier', 'سابقاً', groups.earlier)}

        <div style={{ height: '40px' }} />
      </div>

    </div>
  )
}

export default Notifications
