export const UrgencySection = () => {
    return (
        <div className="container mx-auto px-6">
            <div className="mx-auto max-w-5xl">
                <div className="text-center mb-8">
                    <p className="text-3xl font-semibold text-fuchsia-50">
                        Take the quiz below<br className="sm:hidden" /> to access the <span className={"text-primary"}>AI Vault.</span>
                    </p>
                    <div className="text-center my-6">
                        <span className="text-white text-2xl">↓</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center">
                    <div className="flex-1 text-center sm:text-left sm:-ml-10">
                        <h2 className="text-4xl sm:text-[45px] font-bold mb-6 leading-tight w-auto sm:w-2xl">
                            <span className="text-white">Once the 100 spots are gone, </span>
                            <span className="text-primary">they're gone for good.</span>
                        </h2>

                        <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto sm:mx-0">
                            If you're serious about scaling smarter and staying ahead of the curve, this is your moment.
                        </p>
                    </div>

                    <div className="flex-shrink-0 w-full max-w-md sm:max-w-xl xl:max-w-2xl sm:-mt-[88px] sm:-mr-56 hidden sm:flex">
                        <img
                            src="/images/bg/urgency-large-bg.png"
                            alt="Growth analytics visualization"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
