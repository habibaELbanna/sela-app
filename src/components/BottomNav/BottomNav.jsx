import { useNavigate, useLocation } from 'react-router-dom'
import './BottomNav.css'

const BottomNav = ({ userType }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const vendorTabs = [
    { label: 'Browse', path: '/browse-needs', icon: 'grid' },
    { label: 'Discover', path: '/discover-needs', icon: 'compass' },
    { label: 'Messages', path: '/messages', icon: 'chat' },
    { label: 'Profile', path: '/profile', icon: 'person' },
  ]

  const buyerTabs = [
    { label: 'Browse', path: '/browse-vendors', icon: 'grid' },
    { label: 'Discover', path: '/discover-vendors', icon: 'compass' },
    { label: 'Messages', path: '/messages', icon: 'chat' },
    { label: 'Profile', path: '/profile', icon: 'person' },
  ]

  const tabs = userType === 'buyer' ? buyerTabs : vendorTabs

  const icons = {
    grid: (
      <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <rect x='3' y='3' width='7' height='7'/><rect x='14' y='3' width='7' height='7'/>
        <rect x='3' y='14' width='7' height='7'/><rect x='14' y='14' width='7' height='7'/>
      </svg>
    ),
    compass: (
      <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <circle cx='12' cy='12' r='10'/>
        <polygon points='16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76'/>
      </svg>
    ),
    chat: (
      <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/>
      </svg>
    ),
    person: (
      <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/>
        <circle cx='12' cy='7' r='4'/>
      </svg>
    ),
  }

  return (
    <div className='bottom-nav'>
      {tabs.map((tab) => {
        const active = path === tab.path
        return (
          <button
            key={tab.path}
            className={`bottom-nav-tab ${active ? 'bottom-nav-active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className='bottom-nav-icon'>{icons[tab.icon]}</span>
            <span className='bottom-nav-label'>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default BottomNav
