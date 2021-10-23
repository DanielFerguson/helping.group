import Hero from './components/about/hero'
import CTA from './components/cta'
import Footer from './components/footer'

export default function About() {
    return (
        <main className="flex flex-col">
            <Hero />

            {/* Who are we? */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-green-600 tracking-wide uppercase">We are a group of</h2>
                        <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                            innovators, leaders and entreprenures
                        </p>
                        <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                            Making direct impact on the world around us.
                            Start building for free, then add a site plan to go live. Account plans unlock additional features.
                        </p>
                    </div>
                </div>
            </div>

            {/* Our Values */}
            {/* Our Culture */}
            {/* Internships */}
            {/* <CTA />
            <Footer /> */}
        </main>
    )
}
