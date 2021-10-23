import CTA from './components/cta'
import Footer from './components/footer'

import Hero from './components/team/hero'
import Leadership from './components/team/leadership'
import TeamList from './components/team/team'
import Board from './components/team/board'

export default function Team() {
    return (
        <main className="flex flex-col">
            <Hero />

            <Leadership />
            <TeamList />
            <Board />


            {/* Team */}
            {/* Board */}
            {/* Community Legends */}

            {/* <CTA /> */}
            {/* <Footer /> */}
        </main>
    )
}
