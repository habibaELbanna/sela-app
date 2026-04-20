const AVATARS_MEN = [
  'https://images.unsplash.com/photo-1615813967515-e1838c1c5116?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1589386417686-0d34b5903d23?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1610088441520-4352457e7095?w=400&h=400&fit=crop&crop=faces',
]

const AVATARS_WOMEN = [
  'https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1619346386696-13e06b01ab6d?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1590649613149-a8dfa7fdf28a?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1564415637254-92c66292cd4c?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1634896941598-b6b500a502a7?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1611432579402-7037e3e2c1e4?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=400&h=400&fit=crop&crop=faces',
]

const hashString = (str) => {
  let hash = 0
  const s = String(str || '')
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export const getAvatar = (seed, gender = 'mixed') => {
  const hash = hashString(seed)

  if (gender === 'female') {
    return AVATARS_WOMEN[hash % AVATARS_WOMEN.length]
  }
  if (gender === 'male') {
    return AVATARS_MEN[hash % AVATARS_MEN.length]
  }

  const pool = hash % 2 === 0 ? AVATARS_MEN : AVATARS_WOMEN
  return pool[hash % pool.length]
}

export const DEFAULT_AVATAR = AVATARS_MEN[0]
export const DEFAULT_MALE_AVATAR = AVATARS_MEN[0]
export const DEFAULT_FEMALE_AVATAR = AVATARS_WOMEN[0]

export const ALL_AVATARS_MEN = AVATARS_MEN
export const ALL_AVATARS_WOMEN = AVATARS_WOMEN
