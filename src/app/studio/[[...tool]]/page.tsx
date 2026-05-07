'use client'

import dynamic from 'next/dynamic'
import config from '../../../../sanity.config'

// Dynamic import with ssr: false prevents styled-components / Sanity UI from
// running during SSR, which would throw "window is not defined".
const NextStudio = dynamic(
  () => import('next-sanity/studio').then((mod) => mod.NextStudio),
  { ssr: false },
)

export default function StudioPage() {
  return <NextStudio config={config} />
}
