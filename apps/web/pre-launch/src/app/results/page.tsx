'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {PageBackground, QualifiedScreen, RejectedScreen} from '@/lib/components';
import Image from "next/image";

const ResultsPage = () => {
    const router = useRouter();
    const [qualified, setQualified] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedQualified = sessionStorage.getItem('qualified');
        const storedLeadInfo = sessionStorage.getItem('leadInfo');

        if (!storedQualified || !storedLeadInfo) {
            router.push('/quiz');
            return;
        }

        setQualified(JSON.parse(storedQualified));
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <PageBackground>
                <div className="container mx-auto px-6 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="glass-card rounded-3xl p-8 md:p-12 border border-purple-500/20">
                            <p className="text-2xl text-white">Loading your results...</p>
                        </div>
                    </div>
                </div>
            </PageBackground>
        );
    }

    return (
        <PageBackground>
            <div className="glow-orb -top-72 -right-72 sm:-top-96 sm:-right-96 opacity-70" />
            <div className="glow-orb glow-orb--purple -bottom-72 -left-72 sm:-bottom-96 sm:-left-96 opacity-70" />

            <div className="container mx-auto px-6 py-10 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass-card rounded-3xl p-8 md:p-12 border border-purple-500/20 relative overflow-hidden">
                        <div className="glow-orb glow-orb--md -top-24 -left-28 sm:-top-28 sm:-left-24 opacity-60" />
                        <div className="glow-orb glow-orb--sm glow-orb--purple -bottom-16 -right-20 opacity-50" />
                        <div className="relative z-10">
                            <div>
                                <div className="flex justify-center mb-6 w-full" >
                                    <Image src={'/images/logo.png'} height={57} width={67} alt={'Logo'}
                                           className={"cursor-pointer"}
                                           onClick={() => router.push('/')}/>
                                </div>
                                {qualified ? <QualifiedScreen/> : <RejectedScreen />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageBackground>
    );
};

export default ResultsPage;
