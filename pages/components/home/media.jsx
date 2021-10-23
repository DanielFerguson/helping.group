const posts = [
    {
        title: 'Helping Group: Who are we?',
        href: 'https://medium.com/helping-group/helpinggroup-who-are-we-71b2ee52a016',
        category: 'Article',
        description: 'Summer 2020. Australia is engulfed in flames. Unlike past fire seasons, this crisis is impossible to ignore.',
        date: 'Jan 5, 2021',
        datetime: '2020-01-5',
        imageUrl: 'https://miro.medium.com/max/1000/1*bjZXE9_KAmb5DRn7Q4l54A.jpeg',
        readingTime: '2 min',
    },
    {
        title: 'Helping Homes; Catch Me Up',
        href: 'https://medium.com/helping-group/helping-homes-catch-me-up-13e5ffb67a22',
        category: 'Catch Me Up',
        description: 'Last summer, Australia experienced its worst bush fire season on record. Helping Homes was created in direct response.',
        date: 'Dec 22, 2020',
        datetime: '2020-12-22',
        imageUrl: 'https://miro.medium.com/max/1400/1*FAFRhpOp8kG30_jtVUyo4w.jpeg',
        readingTime: '2 min',
    },
    {
        title: 'Helping Group; Catch Me Up',
        href: 'https://medium.com/helping-group/helping-group-catch-me-up-33ccad54fd94',
        category: 'Catch Me Up',
        description: 'Following the success of Helping Homes, the team behind the initiative moved forward ambitiously.',
        date: 'Dec 22, 2020',
        datetime: '2020-12-22',
        imageUrl: 'https://miro.medium.com/max/1400/1*N9wbqs43JRmzdJpBQ2cGDA.jpeg',
        readingTime: '2 min',
    },
    {
        title: 'Let’s Recap on 2020!',
        href: 'https://medium.com/helping-group/lets-recap-on-2020-2a8768353053',
        category: 'Let\'s Recap',
        description: 'Taking a moment to reflect on the good things, the milestones we reached, the ways in which we flourished and will continue doing so. This is our 2020 in review.',
        date: 'Dec 12, 2020',
        datetime: '2020-12-12',
        imageUrl: 'https://miro.medium.com/max/1280/1*4XfeLrxNyyQXneQytud4UQ.jpeg',
        readingTime: '5 min',
    },
]

export default function Media() {
    return (
        <div id="media" className="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
            <div className="absolute inset-0">
                <div className="bg-white h-1/3 sm:h-2/3" />
            </div>
            <div className="relative max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">Hot off the press</h2>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                        It is important to remember our past, so that we can build a better future.
                    </p>
                </div>
                <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-4 lg:max-w-none">
                    {posts.map((post) => (
                        <div key={post.title} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                            <div className="flex-shrink-0">
                                <img className="h-48 w-full object-cover" src={post.imageUrl} alt="" />
                            </div>
                            <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-600">{post.category}</p>
                                    <a href={post.href} target="_blank" rel="noreferrer" className="block mt-2">
                                        <p className="text-xl font-semibold text-gray-900">{post.title}</p>
                                        <p className="mt-3 text-base text-gray-500">{post.description}</p>
                                    </a>
                                </div>
                                <div className="mt-6 flex items-center">
                                    <div className="flex space-x-1 text-sm text-gray-500">
                                        <time dateTime={post.datetime}>{post.date}</time>
                                        <span aria-hidden="true">&middot;</span>
                                        <span>{post.readingTime} read</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}