// https://www.thecourier.com.au/story/6566053/new-website-offers-places-to-stay-for-families-devastated-by-fire/
// https://studentedge.org/article/where-to-find-emergency-accommodation-if-youre-impacted-by-australias-busfires
// https://www.stockandland.com.au/story/6570125/fire-victims-need-cash-not-goods-as-new-fund-established/?src=rss
// https://www.bushfirehelp.org/organisations/helping-homes
// https://3ne.com.au/articles/local-bushfire-assistance/
// https://us7.campaign-archive.com/?u=bd618aab747cdfbc9535ac587&id=09e7d8d7a4
// https://vcoss.org.au/analysis/2020/01/support-during-bushfires/
// https://9now.nine.com.au/the-block/bushfires-australia-how-to-find-accommodation-offer-room-airbnb-findabed/10eb03d3-51b3-4455-af42-f1a57440144b
// https://thelight.com.au/latest-news/heres-how-you-can-help-to-bushfire-relief/
// https://www.afr.com/politics/federal/nsw-government-calls-for-holiday-home-owners-to-open-doors-to-evacuees-20200114-p53r91

export default function Publishers() {
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
            <p className="text-center text-base font-semibold uppercase text-gray-600 tracking-wider">
                Thank you to all the publishers helping us to help others
            </p>
            <div className="mt-6 grid grid-cols-2 gap-0.5 md:grid-cols-3 justify-center lg:mt-8">
                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                    <img className="h-8 opacity-50" src="/logos/courier.png" alt="Tuple" />
                </div>
                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                    <img className="h-8 opacity-50" src="/logos/9now.png" alt="Mirage" />
                </div>
                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                    <img className="h-8 opacity-50" src="/logos/afr.png" alt="StaticKit" />
                </div>
                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                    <img className="h-8 opacity-50" src="/logos/the-light.png" alt="Transistor" />
                </div>
                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                    <img className="h-8 opacity-50" src="/logos/vcoss.png" alt="Workcation" />
                </div>
                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                    <img className="h-8 opacity-50" src="/logos/stock-and-land.png" alt="Workcation" />
                </div>
                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                    <img className="h-8 opacity-50" src="/logos/student-edge.png" alt="Workcation" />
                </div>
                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                    <img className="h-8 opacity-50" src="/logos/3ne.png" alt="Workcation" />
                </div>
                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                    <img className="h-8 opacity-50" src="/logos/bushfire-help.png" alt="Workcation" />
                </div>
            </div>
        </div>
    );
}