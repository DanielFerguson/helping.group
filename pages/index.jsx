import Head from 'next/head'

import Hero from './components/home/hero'
import Initiatives from './components/home/initiatives'
import Partners from './components/home/partners'
import Publishers from './components/home/publishers'
import Media from './components/home/media'
import Footer from './components/footer'

export default function Home() {
  return (
    <main className="flex flex-col">
      <Head>
        <title>Combating current events with digital solutions. | Helping Group</title>
        <meta name="description" content="Helping Group's mission is to combat current events with digital solutions so the Australian people can connect and thrive together." />
        <meta name="keywords" content="social, enterprise, helping, group, helpinggroup, charity, digital, initiative, initiatives, australia, connect, homes, thrive, bushfire, bushfires" />
      </Head>
      <Hero />
      <Partners />
      <Initiatives />
      {/* <CTA /> */}
      <Media />
      <Publishers />
      {/* Acknowledgement */}
      <Footer />
    </main>
  )
}
