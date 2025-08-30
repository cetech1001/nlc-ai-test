import { FC } from 'react';

interface QuizCTASectionProps {
    onStartQuiz: () => void;
}

export const QuizCTASection: FC<QuizCTASectionProps> = ({ onStartQuiz }) => {
    return (
        <div className="container mx-auto px-6 py-10">
            <div className="max-w-4xl mx-auto flex flex-col justify-center items-center sm:block">
                <div className="glass-card bg-gradient-exclusive rounded-3xl p-8 md:p-12 border border-purple-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-purple-600/10 via-fuchsia-600/10 to-violet-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-r from-fuchsia-600/10 via-purple-600/10 to-violet-600/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            <span className="text-white">
                                What's Your <span className={"text-primary"}>AI</span>
                                <span className={"hidden sm:inline"}>{" "}</span>
                                <br className="sm:hidden" />
                            </span>
                            <span className="text-primary">
                                Automation<br className="sm:hidden" /> Score?
                            </span>
                        </h2>

                        <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
                            Discover where your coaching business is bleeding time, dropping clients, and
                            how AI could boost your income, without hiring another team member.
                        </p>

                        <button onClick={onStartQuiz} className="btn-primary">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                            <span className="relative z-10 flex items-center justify-center">
                                Take The Quiz →
                            </span>
                        </button>
                    </div>
                </div>
                <div className="flex justify-center w-full sm:hidden">
                    <img src={"/images/bg/urgency-large-bg.png"} alt="" />
                </div>
            </div>
        </div>
    );
};
