'use client'

import Typewriter from 'typewriter-effect'

export default function HeroTypewriter({ titles }: { titles: string[] }) {
  const strings = titles.length > 0 ? titles : ['Full Stack Web Engineer']

  return (
    // Excluded from `LiveRefresh`'s stale-vs-fresh DOM diff: this text changes
    // on its own every few hundred milliseconds, so it would look like fresh
    // content on the very first check.
    <span className="text-indigo-600 dark:text-indigo-400" data-live-refresh-ignore>
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
