import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import logoword from '../../Assets/logoword.svg'
import logoicon from '../../Assets/logoicon.svg'
import './Splash.css'

const Splash = () => {
  const navigate = useNavigate()
  const birdRef = useRef(null)
  const wordRef = useRef(null)
  const blueRef = useRef(null)
  const continueRef = useRef(null)

  useEffect(() => {
    gsap.set(wordRef.current, { y: 60, opacity: 0 })
    gsap.set(birdRef.current, { y: -60, opacity: 0, scale: 1 })
    gsap.set(blueRef.current, { opacity: 0 })
    gsap.set(continueRef.current, { opacity: 0 })

    const tl = gsap.timeline()

    tl.to(wordRef.current, {
      opacity: 1,
      y: 60,
      duration: 0.6,
      ease: 'power2.out',
    })
      .to(
        birdRef.current,
        { opacity: 1, y: -60, duration: 0.5, ease: 'back.out(2)' },
        '-=0.3'
      )
      .to(
        birdRef.current,
        { scale: 1.12, duration: 0.4, ease: 'sine.inOut' },
        '+=0.3'
      )
      .to(birdRef.current, { scale: 0.95, duration: 0.35, ease: 'sine.inOut' })
      .to(birdRef.current, { scale: 1.08, duration: 0.3, ease: 'sine.inOut' })
      .to(birdRef.current, { scale: 1, duration: 0.25, ease: 'sine.inOut' })
      .to(
        birdRef.current,
        { scale: 30, duration: 0.55, ease: 'power3.in' },
        '+=0.2'
      )
      .to(blueRef.current, { opacity: 1, duration: 0.01 }, '-=0.25')
      .to(birdRef.current, { opacity: 0, duration: 0.1 }, '-=0.2')
      .to(
        wordRef.current,
        {
          y: 0,
          filter: 'brightness(0) invert(1)',
          duration: 0.35,
          ease: 'power2.out',
        },
        '-=0.2'
      )
      .to(
        blueRef.current,
        { x: '-100%', duration: 0.7, ease: 'power3.inOut' },
        '+=0.9'
      )
      .to(wordRef.current, { filter: 'none', duration: 0.3 }, '-=0.5')
      .to(
        continueRef.current,
        { opacity: 1, duration: 0.5, ease: 'power2.out' },
        '-=0.1'
      )
  }, [])

  return (
    <div className='splash-container'>
      <div ref={blueRef} className='splash-blue' />
      <img ref={birdRef} src={logoicon} alt='bird' className='splash-bird' />
      <img ref={wordRef} src={logoword} alt='SELA' className='splash-word' />
      <button
        ref={continueRef}
        className='splash-continue'
        onClick={() => navigate('/onboarding')}
      >
        CONTINUE
      </button>
    </div>
  )
}

export default Splash
