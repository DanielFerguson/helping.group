import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons'

const navigation = [
    { name: 'Home', href: '/' },
    // { name: 'About', href: '/about' },
    { name: 'Initiatives', href: '#initiatives' },
    { name: 'Team', href: '/team' },
    { name: 'Media', href: '#media' },
];

const socials = [
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/HelpingGroup',
        icon: faFacebook
    },
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/helpinggroupaus/',
        icon: faInstagram
    },
    {
        name: 'Twitter',
        href: 'https://twitter.com/HelpingGroupAU',
        icon: faTwitter
    },
]

export default function Footer() {
    return (
        <footer className="bg-white">
            <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">

                <img src="/icons/acnc.png" alt="Charity status logo" className="h-32 mx-auto" />
                <nav className="mt-8 flex flex-wrap justify-center" aria-label="Footer">
                    {navigation.map((item) => (
                        <div key={item.name} className="px-5 py-2">
                            <a href={item.href} className="text-base text-gray-500 hover:text-gray-900">
                                {item.name}
                            </a>
                        </div>
                    ))}
                </nav>
                <div className="mt-8 flex justify-center space-x-6">
                    {socials.map((item) => (
                        <a key={item.name} href={item.href} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">{item.name}</span>
                            <FontAwesomeIcon icon={item.icon} size="lg" aria-hidden="true" />
                        </a>
                    ))}
                </div>
                <p className="mt-8 text-center text-base text-gray-400">&copy; 2021 Helping Group, Inc. All rights reserved.</p>
            </div>
        </footer>
    )
}