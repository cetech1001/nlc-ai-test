'use client'

import {FC, ReactNode, useEffect, useState} from 'react';
import {
  Brain,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  Sparkles,
  UserCheck,
  BarChart3,
  Zap
} from "lucide-react";
import {appConfig} from "@nlc-ai/web-shared";
import {CoachReplicaIcon, EmailAgentIcon, RetentionWhiteIcon} from "@/lib";
import {usePathname} from "next/navigation";

const AIAgentsLanding = ({ agent }: { agent: string; }) => {
  const [activeAgent, setActiveAgent] = useState(agent);

  useEffect(() => {
    setActiveAgent(agent);
  }, [agent]);

  const agents = [
    {
      id: 'replica',
      icon: CoachReplicaIcon,
      title: "Coach Replica",
      description: "Your AI twin that handles routine client questions 24/7",
      features: [
        "Trained on your coaching methodology",
        "24/7 client support and guidance",
        "Seamless handoff to you when needed",
        "Continuous learning from interactions"
      ],
      benefits: "Scale your coaching without losing the personal touch",
      color: "from-purple-700 via-purple-600 to-purple-500",
      textColor: "text-purple-200",
      iconColor: "text-purple-300"
    },
    {
      id: 'followup',
      icon: UserCheck,
      title: "Lead Follow-up",
      description: "Automatically nurture leads with personalized email sequences",
      features: [
        "Smart lead scoring and segmentation",
        "Personalized email sequences based on lead behavior",
        "Automated follow-up scheduling",
        "Integration with your CRM and email platforms"
      ],
      benefits: "Convert 50% more leads into paying clients",
      color: "from-blue-600 via-blue-500 to-cyan-400",
      textColor: "text-blue-200",
      iconColor: "text-blue-300"
    },
    {
      id: 'emails',
      icon: EmailAgentIcon,
      title: "Email",
      description: "AI-powered email responses for your existing clients",
      features: [
        "Context-aware email responses",
        "Maintains your unique coaching voice",
        "Learns from your past client interactions",
        "Smart escalation for complex queries"
      ],
      benefits: "Save 10+ hours per week on email management",
      color: "from-red-600 via-red-500 to-orange-500",
      textColor: "text-red-200",
      iconColor: "text-red-300"
    },
    {
      id: 'suggestion',
      icon: Zap,
      title: "Content Creation",
      description: "AI-powered content ideas tailored to your coaching niche",
      features: [
        "Trending topic analysis in your niche",
        "Content calendar planning",
        "Platform-specific content optimization",
        "Engagement prediction and optimization"
      ],
      benefits: "5x your content engagement rates",
      color: "from-orange-500 via-orange-400 to-yellow-400",
      textColor: "text-orange-200",
      iconColor: "text-orange-100"
    },
    {
      id: 'retention',
      icon: RetentionWhiteIcon,
      title: "Retention",
      description: "Proactively identify and re-engage at-risk clients",
      features: [
        "Early warning system for client churn",
        "Automated check-in sequences",
        "Personalized re-engagement campaigns",
        "Progress milestone celebrations"
      ],
      benefits: "Reduce client churn by up to 60%",
      color: "from-green-600 via-green-500 to-emerald-500",
      textColor: "text-green-200",
      iconColor: "text-green-300"
    },
  ];

  const stats = [
    { label: "Time Saved Weekly", value: "30+ Hours", icon: Clock },
    { label: "Lead Conversion", value: "+50%", icon: Target },
    { label: "Client Retention", value: "+60%", icon: TrendingUp },
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-8 max-w-full overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-fuchsia-400" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            AI Agents Suite
          </h1>
          <p className="text-xl text-stone-300 mb-8">
            Deploy intelligent AI agents that work 24/7 to grow your coaching business.
            From lead nurturing to client retention, let AI handle the routine while you focus on coaching.
          </p>

          <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-400/30 rounded-full text-fuchsia-300 text-lg font-medium">
            <Clock className="w-5 h-5" />
            Coming Soon - Private Beta
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden text-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-stone-300">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Agents Selection */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your AI Team</h2>
          <p className="text-stone-300 text-lg">Each agent specializes in a different aspect of your coaching business</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                activeAgent === agent.id
                  ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white'
                  : 'bg-neutral-800/50 text-stone-300 hover:bg-neutral-700/50'
              }`}
            >
              <agent.icon className="w-4 h-4" />
              {agent.title.replace(' Agent', '')}
            </button>
          ))}
        </div>

        {/* Agent Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`${activeAgent === agent.id ? 'block' : 'hidden'}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${agent.color}/20 rounded-xl flex items-center justify-center`}>
                      <agent.icon className={`w-6 h-6 ${agent.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{agent.title}</h3>
                  </div>

                  <p className="text-stone-300 text-lg mb-6">{agent.description}</p>

                  <div className="space-y-3 mb-6">
                    {agent.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-stone-200">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className={`p-4 bg-gradient-to-r ${agent.color}/10 border border-current/20 rounded-lg`}>
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className={`w-4 h-4 ${agent.iconColor}`} />
                      <span className={`${agent.textColor} font-medium`}>Expected Impact</span>
                    </div>
                    <p className="text-white font-semibold">{agent.benefits}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-white mb-4">How AI Agents Work</h4>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">1</div>
                  <div>
                    <div className="text-white font-medium">Learn Your Style</div>
                    <div className="text-stone-400 text-sm">AI studies your coaching approach and communication style</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold">2</div>
                  <div>
                    <div className="text-white font-medium">Monitor & Analyze</div>
                    <div className="text-stone-400 text-sm">Continuously monitors client interactions and business metrics</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">3</div>
                  <div>
                    <div className="text-white font-medium">Take Smart Action</div>
                    <div className="text-stone-400 text-sm">Executes personalized actions while maintaining your brand voice</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-600/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">Always Learning</span>
                </div>
                <p className="text-stone-300 text-sm">
                  Your AI agents get smarter over time, learning from every interaction to better serve your clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Agent Comparison */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center">Deploy Multiple Agents For Maximum Impact</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {agents.map((agent, index) => (
            <div key={index} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 overflow-hidden text-center">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-24 h-24 -left-4 -top-6 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px]" />
              </div>

              <div className="relative z-10">
                <div className={`w-12 h-12 bg-gradient-to-br ${agent.color}/20 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <agent.icon className={`w-6 h-6 ${agent.iconColor}`} />
                </div>
                <h4 className="text-white font-semibold mb-2 text-sm">{agent.title}</h4>
                <p className="text-stone-400 text-xs">{agent.benefits}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface IProps {
  children: ReactNode;
}

const AIAgentsPage: FC<IProps> = ({ children }) => {
  const pathname = usePathname();
  const agent = pathname.split('/')[2] ?? 'replica';

  if (appConfig.features.enableLanding) {
    return <AIAgentsLanding agent={agent} />;
  }

  return children;
};

export default AIAgentsPage;
