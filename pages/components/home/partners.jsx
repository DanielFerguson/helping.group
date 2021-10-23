export default function Partners() {
    return (
        <div className="bg-green-200 bg-opacity-25">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                    <div className="max-w-md mx-auto text-green-900 text-center lg:max-w-xl lg:text-left">
                        <h2 className="text-3xl font-extrabold ">
                            Making world-changing software is hard.
                        </h2>
                        <p className="mt-4 max-w-lg">
                            That's why we like to appreciate
                            the organisations that make it a little easier for us.
                        </p>
                    </div>
                    <div className="flow-root self-center mt-8 lg:mt-0">
                        <div className="-mt-4 -ml-8 flex flex-wrap justify-between lg:-ml-4">
                            <div className="mt-4 ml-8 flex flex-grow flex-shrink-0 justify-center lg:flex-grow-0 lg:ml-4">
                                <img className="h-12" src="/icons/yacvic.png" alt="YAC Vic" />
                            </div>
                            <div className="mt-4 ml-8 flex flex-grow flex-shrink-0 justify-center lg:flex-grow-0 lg:ml-4">
                                <img className="h-12" src="/icons/aws.png" alt="AWS" />
                            </div>
                            <div className="mt-4 ml-8 flex flex-grow flex-shrink-0 justify-center lg:flex-grow-0 lg:ml-4">
                                <img className="h-12" src="/icons/dfat.png" alt="DFAT" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}