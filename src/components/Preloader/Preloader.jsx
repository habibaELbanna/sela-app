import { useEffect, useState } from 'react'
import './Preloader.css'

const Preloader = ({ onFinish }) => {
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    if (!onFinish) {
      const t = setTimeout(() => setPhase('fly'), 1200)
      return () => clearTimeout(t)
    }
    const t1 = setTimeout(() => setPhase('fly'), 1200)
    const t2 = setTimeout(() => setPhase('fadeout'), 2400)
    const t3 = setTimeout(() => onFinish(), 2900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  return (
    <div className={`sela-pre__wrap ${phase === 'fadeout' ? 'sela-pre__wrap--out' : ''}`}>
      <div className='sela-pre__content'>

        <div className={`sela-pre__logo-wrap ${phase !== 'enter' ? 'sela-pre__logo-wrap--visible' : ''}`}>
          <svg width='108' height='38' viewBox='0 0 54 19' fill='none' xmlns='http://www.w3.org/2000/svg' className='sela-pre__logo-svg'>
            <path d='M31.8517 0H28.3145V14.5182V18.1516H31.8517H38.9313V14.5182H31.8517V0Z' fill='white'/>
            <path d='M49.9862 0H42.4688V18.1516H46.006V10.8899H46.0171V10.892H49.5483V18.1516H53.0856V0H49.9862ZM46.006 7.26168V3.62928H49.5473V7.2596H46.0161V7.26168H46.005H46.006Z' fill='white'/>
            <path d='M0 0.000198364V3.62844V7.26188V7.67565V10.8901H3.53725H3.90314H7.07957V14.5184H0V18.1518H10.6168V18.1497V14.5204V7.26188H3.90314H3.53725V3.62844H10.6168V0.000198364H3.53725H0Z' fill='white'/>
            <path d='M14.1543 0V3.62824V7.26168V10.8899V11.4066V14.5202V18.1495V18.1516H24.7721V14.5182H17.6966V11.4066V10.8899H17.7696H24.7721V7.26168H17.7696H17.6966V3.62824H24.7721V0H17.6966H14.1543Z' fill='white'/>
          </svg>
        </div>

        <div className={`sela-pre__bird-wrap ${phase === 'fly' || phase === 'fadeout' ? 'sela-pre__bird-wrap--fly' : ''}`}>
          <svg width='74' height='38' viewBox='0 0 37 19' fill='none' xmlns='http://www.w3.org/2000/svg' className='sela-pre__bird-svg'>
            <path d='M1.1828 1.59372L15.1646 9.42823L0 18.1111C0 18.1111 10.1678 18.1027 12.3854 18.0944L29.9146 4.383L36.5249 5.04731L30.8288 0L15.942 2.1811C14.9943 2.32041 14.0355 2.36096 13.0797 2.30378L1.1828 1.59268V1.59372Z' fill='#00A7E5'/>
          </svg>
        </div>

      </div>
    </div>
  )
}

export default Preloader