export const ExclusiveAccessSection = () => {
    return (
        <div className="container mx-auto px-6 py-10">
            <div className="text-center max-w-5xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    <span className="text-white">Only 100 Coaches<br className="sm:hidden" /> Will Get In.</span>
                </h2>
                <h3 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                  <span className="bg-gradient-to-t from-purple-300 via-fuchsia-400 to-[#7B26F0] bg-clip-text text-transparent">
                    Will You Be One of Them?
                  </span>
                </h3>

                <p className="text-lg md:text-xl text-gray-300 mb-16">
                    Access to the Next Level Coach Vault{' '}<br className="sm:hidden" />
                    <span className="bg-gradient-to-t from-purple-300 via-fuchsia-400 to-[#7B26F0] bg-clip-text text-transparent">(exclusive early-access community)</span>
                </p>

                <div className="glass-card rounded-3xl p-8 md:p-12 mb-16 bg-gradient-exclusive border border-purple-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-purple-600/10 via-fuchsia-600/10 to-violet-600/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <h4 className="text-2xl md:text-3xl font-bold mb-8 text-white">
                            This is not for everyone.
                        </h4>

                        <p className="text-lg md:text-xl mb-8 text-gray-300 leading-relaxed">
                            Only the first 100 coaches who qualify will be granted access to our private AI Vault, a behind-the-scenes community where you'll
                        </p>

                        <div className="grid md:grid-cols-3 gap-8 text-left">
                            <div className="flex gap-3 items-start">
                                <img src={"/images/icons/light-bulb.png"} alt="icon" className="w-6 h-6"/>
                                <div>
                                    <p className="text-lg text-white font-medium mb-2">
                                        Get first access to the platform before public launch
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <img src={"/images/icons/message.png"} alt="icon" className="w-6 h-6"/>
                                <div>
                                    <p className="text-lg text-white font-medium mb-2">
                                        Receive insider drops with automation, retention, and scaling strategies
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <img src={"/images/icons/community.png"} alt="icon" className="w-6 h-6"/>
                                <div>
                                    <p className="text-lg text-white font-medium mb-2">
                                        Join a private circle of elite coaches pioneering the future of AI
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
