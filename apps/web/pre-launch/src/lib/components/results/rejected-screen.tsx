import {SiInstagram, SiTiktok, SiX, SiYoutube} from "react-icons/si";
import {Mail} from "lucide-react";
import React from "react";

export const RejectedScreen = () => (
    <>
        <h2 className="text-[40px] sm:text-[45px] font-semibold text-[#FF3E14] mb-6">
            You Didn't Qualify — Yet
        </h2>
        <p className="text-lg text-white/90 mb-4">
            Thanks for taking the quiz. Based on your answers, you're not quite ready for Next Level Coach AI.
        </p>
        <p className="text-lg text-white/80 mb-6">
            But businesses evolve and when things shift, we'd love to reconnect.
        </p>
        <p className="text-[16px] text-white/60">
            Keep doing great work. We'll be here when the timing makes sense.
        </p>
        <div className="flex justify-center space-x-6 mt-8">
            <a href="https://x.com/nextlvlcoachai" target="_blank" rel="noopener noreferrer">
                <SiX size={24} color="#FFFFFF" />
            </a>
            <a href="https://instagram.com/nextlevelcoach.ai" target="_blank" rel="noopener noreferrer">
                <SiInstagram size={24} color="#FFFFFF" />
            </a>
            <a href="https://tiktok.com/@nextlevelcoach.ai" target="_blank" rel="noopener noreferrer">
                <SiTiktok size={24} color="#FFFFFF" />
            </a>
            <a href="https://www.youtube.com/@NextLevelCoachAI" target="_blank" rel="noopener noreferrer">
                <SiYoutube size={24} color="#FFFFFF" />
            </a>
            <a href="mailto:support@nextlevelcoach.ai" target="_blank" rel="noopener noreferrer">
                <Mail size={24} color="#FFFFFF" />
            </a>
        </div>
    </>
);
