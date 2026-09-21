'use client'

import Typewriter from 'typewriter-effect'

export default function HeroTypewriter({ titles }: { titles: string[] }) {
  const strings = titles.length > 0 ? titles : ['Full Stack Web Engineer']

  return (
    <span className="text-indigo-600 dark:text-indigo-400">
      <Typewriter
        options={{
          strings,
          autoStart: true,
          loop: true,
          delay: 60,
          deleteSpeed: 40,
        }}
      />
    </span>
  )
}
