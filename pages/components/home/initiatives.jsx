import Link from 'next/link'
import { HomeIcon, ChatBubbleLeftRightIcon, FireIcon, GlobeAsiaAustraliaIcon } from '@heroicons/react/24/solid'

const supportLinks = [
    {
        name: 'Helping Homes',
        href: 'https://helpinghomes.com.au',
        description: 'An open service to connect those that need emergency housing, with the people who can provide it. ',
        icon: HomeIcon,
    },
    {
        name: 'Rainbow Restoration',
        href: null,
        description: 'A trading card series project that will normalise the existence of LGBTQIA+ figures from across history.',
        icon: ChatBubbleLeftRightIcon,
    },
    {
        name: 'Our Move',
        href: 'https://ourmove.com.au',
        description: 'A communal platform uniting people from all areas to help prepare for upcoming fire seasons.',
        icon: FireIcon,
    },
    {
        name: 'What\'s My Impact?',
        href: 'https://whatsmyimpact.com.au',
        description: 'Visualising how we are all changing the world through our investments to better align our values and investments.',
        icon: GlobeAsiaAustraliaIcon,
    },
]

export default function Initiatives() {
    return (
        <div id="initiatives" className="bg-white">
            {/* Header */}
            <div className="relative pb-32 bg-gray-800">
                <div className="absolute inset-0">
                    <img
                        className="w-full h-full object-cover"
                        src="https://images.unsplash.com/photo-1525130413817-d45c1d127c42?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1920&q=60&&sat=-100"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gray-800 mix-blend-multiply" aria-hidden="true" />
                </div>
                <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">Our Initiatives</h1>
                    <p className="mt-6 max-w-3xl text-xl text-gray-300">
                        Using digital means to create solutions to help people connect and thrive.
                    </p>
                </div>
            </div>

            {/* Overlapping cards */}
            <section
                className="-mt-32 max-w-7xl mx-auto relative z-10 pb-32 px-4 sm:px-6 lg:px-8"
                aria-labelledby="contact-heading"
            >
                <h2 className="sr-only" id="contact-heading">
                    Contact us
                </h2>
                <div className="grid grid-cols-1 gap-y-20 lg:grid-cols-4 lg:gap-y-0 lg:gap-x-8">
                    {supportLinks.map((link) => (
                        <div key={link.name} className="flex flex-col bg-white rounded-2xl shadow-xl">
                            <div className="flex-1 relative pt-16 px-6 pb-8 md:px-8">
                                <div className="absolute top-0 p-4 inline-block bg-green-600 rounded-xl shadow-lg transform -translate-y-1/2">
                                    <link.icon className='h-8 text-white' />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900">{link.name}</h3>
                                <p className="mt-4 text-base text-gray-500">{link.description}</p>
                            </div>
                            {
                                link.href &&
                                <div className="p-6 bg-gray-50 rounded-bl-2xl rounded-br-2xl md:px-8">
                                    <Link href={link.href} target="_blank" rel="noreferrer" className="text-base font-medium text-green-700 hover:text-green-600">
                                        <a>View <span aria-hidden="true"> &rarr;</span></a>
                                    </Link>
                                </div>
                            }
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}