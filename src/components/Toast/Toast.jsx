import { createContext, useContext, useState, useCallback } from 'react'
import './Toast.css'

const ToastContext = createContext(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

let idCounter = 0

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((message, type = 'info', duration = 2800) => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => remove(id), duration)
    return id
  }, [remove])

  const success = useCallback((msg, duration) => show(msg, 'success', duration), [show])
  const error = useCallback((msg, duration) => show(msg, 'error', duration), [show])
  const info = useCallback((msg, duration) => show(msg, 'info', duration), [show])

  const lang = typeof window !== 'undefined' ? (localStorage.getItem('sela_lang') || 'en') : 'en'
  const isAr = lang === 'ar'

  const icon = (type) => {
    if (type === 'success') return (
      <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
        <circle cx='12' cy='12' r='10' fill='#10B981'/>
        <path d='M8 12l3 3 5-6' stroke='#ffffff' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' fill='none'/>
      </svg>
    )
    if (type === 'error') return (
      <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
        <circle cx='12' cy='12' r='10' fill='#EF4444'/>
        <line x1='12' y1='8' x2='12' y2='12' stroke='#ffffff' strokeWidth='2.4' strokeLinecap='round'/>
        <circle cx='12' cy='16' r='1' fill='#ffffff'/>
      </svg>
    )
    return (
      <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
        <circle cx='12' cy='12' r='10' fill='#00a7e5'/>
        <line x1='12' y1='8' x2='12' y2='12' stroke='#ffffff' strokeWidth='2.4' strokeLinecap='round'/>
        <circle cx='12' cy='16' r='1' fill='#ffffff'/>
      </svg>
    )
  }

  return (
    <ToastContext.Provider value={{ show, success, error, info, remove }}>
      {children}
      <div className='ts-stack' dir={isAr ? 'rtl' : 'ltr'} role='region' aria-live='polite'>
        {toasts.map((t) => (
          <div key={t.id} className={`ts-item ts-${t.type}`}>
            <span className='ts-icon'>{icon(t.type)}</span>
            <span className='ts-msg'>{t.message}</span>
            <button className='ts-close' aria-label='Close' onClick={() => remove(t.id)}>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
