'use client'

import { useState, useEffect } from 'react';
import {useParams, useRouter} from "next/navigation";
import { Search } from "lucide-react";
import { PageHeader } from "@nlc-ai/shared";
import { AlertBanner } from '@nlc-ai/ui';

interface EmailItem {
  id: string;
  title: string;
  recipient: {
    name: string;
    email: string;
    avatar?: string;
  };
  date: string;
  time: string;
  preview: string;
  status: 'pending' | 'approved';
}

const mockEmails: EmailItem[] = [
  {
    id: '1',
    title: 'How Can I Get More Out of This Course?',
    recipient: {
      name: 'Maria Sharapova',
      email: 'maria.sharapova@email.com'
    },
    date: 'Apr 14, 2025',
    time: '10:30 AM',
    preview: 'Hi Coach, I\'m really enjoying the course so far but wondering if there\'s any additional material I should focus on to enhan...',
    status: 'pending'
  },
  {
    id: '2',
    title: 'I\'m Struggling with Module 3, Any Tips?',
    recipient: {
      name: 'Maria Sharapova',
      email: 'maria.sharapova@email.com'
    },
    date: 'Apr 14, 2025',
    time: '10:30 AM',
    preview: 'Hey Coach, I\'m stuck on Module 3 and could really use some guidance. Could you offer any suggestions or insights to h...',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Can You Recommend Any Additional Resources?',
    recipient: {
      name: 'Maria Sharapova',
      email: 'maria.sharapova@email.com'
    },
    date: 'Apr 14, 2025',
    time: '10:30 AM',
    preview: 'Hello, I\'ve finished the first two modules, but I\'m eager to dive deeper into the subject. Do you have any other resources...',
    status: 'pending'
  },
  {
    id: '4',
    title: 'When Will I Be Able to Access the Next Module?',
    recipient: {
      name: 'Maria Sharapova',
      email: 'maria.sharapova@email.com'
    },
    date: 'Apr 14, 2025',
    time: '10:30 AM',
    preview: 'Hi, I\'m excited to continue with the course! Can you let me know when I\'ll be able to access the next module?',
    status: 'pending'
  },
  {
    id: '5',
    title: 'I Missed Last Week\'s Lesson, Can You Help?',
    recipient: {
      name: 'Maria Sharapova',
      email: 'maria.sharapova@email.com'
    },
    date: 'Apr 14, 2025',
    time: '10:30 AM',
    preview: 'Hey Coach, I couldn\'t make it to the session last week. Could you share a summary or any important points I missed?',
    status: 'pending'
  },
  {
    id: '6',
    title: 'Will There Be Any Live Q&A Sessions?',
    recipient: {
      name: 'Maria Sharapova',
      email: 'maria.sharapova@email.com'
    },
    date: 'Apr 14, 2025',
    time: '10:30 AM',
    preview: 'I\'ve been going through the course, and I was wondering if there are any upcoming live Q&A sessions where I can ask q...',
    status: 'pending'
  },
  {
    id: '7',
    title: 'Can I Get a Certificate After Completion?',
    recipient: {
      name: 'Maria Sharapova',
      email: 'maria.sharapova@email.com'
    },
    date: 'Apr 14, 2025',
    time: '10:30 AM',
    preview: 'Hi Coach, I was wondering if there\'s a certificate of completion at the end of the course. Let me know!',
    status: 'approved'
  },
  {
    id: '8',
    title: 'How Do I Track My Progress?',
    recipient: {
      name: 'Maria Sharapova',
      email: 'maria.sharapova@email.com'
    },
    date: 'Apr 14, 2025',
    time: '10:30 AM',
    preview: 'Hello, I\'ve been going through the course at my own pace. Is there a way to track my progress and see how far I\'ve come?',
    status: 'approved'
  }
];

interface EmailCardProps {
  email: EmailItem;
  onClick: () => void;
}

const EmailCard = ({ email, onClick }: EmailCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-purple-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      onClick={onClick}
      className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200 group"
    >
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>

      <div className="relative z-10 space-y-3">
        <h3 className="text-stone-50 text-lg font-semibold leading-tight line-clamp-2">
          {email.title}
        </h3>

        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(email.recipient.name)} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-xs font-semibold">
              {getInitials(email.recipient.name)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-stone-50 text-sm font-medium truncate">
              {email.recipient.name}
            </p>
            <p className="text-stone-400 text-xs truncate">
              {email.recipient.email}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-stone-300 text-sm">{email.date}</p>
            <p className="text-stone-400 text-xs">{email.time}</p>
          </div>
        </div>

        <p className="text-stone-300 text-sm leading-relaxed line-clamp-3">
          {email.preview}
        </p>

        <div className="pt-2">
          <button className="text-fuchsia-400 text-sm font-medium underline hover:text-fuchsia-300 transition-colors">
            View Automated Response
          </button>
        </div>
      </div>
    </div>
  );
};

const EmailsSkeleton = () => (
  <div className="space-y-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 animate-pulse">
        <div className="space-y-3">
          <div className="h-6 bg-neutral-700 rounded w-3/4"></div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neutral-700 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-neutral-700 rounded w-32"></div>
              <div className="h-3 bg-neutral-700 rounded w-48"></div>
            </div>
            <div className="text-right space-y-1">
              <div className="h-4 bg-neutral-700 rounded w-20"></div>
              <div className="h-3 bg-neutral-700 rounded w-16"></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-neutral-700 rounded w-4/5"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/5"></div>
          </div>

          <div className="pt-2">
            <div className="h-4 bg-neutral-700 rounded w-40"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function EmailsList() {
  const router = useRouter();
  const params = useParams();

  const clientID = params.clientID as string;

  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEmailClick = (emailID: string) => {
    router.push(`/clients/${clientID}/emails/${emailID}`);
  };

  const filteredEmails = mockEmails.filter(email => {
    const matchesTab = email.status === activeTab;
    const matchesSearch = searchQuery === "" ||
      email.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.recipient.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={() => setError('')}/>
        )}

        <PageHeader title="">
          <>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search emails using title, name"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>
          </>
        </PageHeader>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-neutral-700">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-4 text-lg font-medium transition-colors border-b-2 ${
              activeTab === 'pending'
                ? 'text-fuchsia-400 border-fuchsia-400'
                : 'text-stone-300 hover:text-stone-50 border-transparent'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-4 text-lg font-medium transition-colors border-b-2 ${
              activeTab === 'approved'
                ? 'text-fuchsia-400 border-fuchsia-400'
                : 'text-stone-300 hover:text-stone-50 border-transparent'
            }`}
          >
            Approved
          </button>
        </div>

        {/* Email Grid */}
        {isLoading ? (
          <EmailsSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onClick={() => handleEmailClick(email.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-stone-400 text-lg mb-2">
                  No {activeTab} emails found
                </div>
                <div className="text-stone-500 text-sm">
                  {searchQuery
                    ? `No emails match your search for "${searchQuery}"`
                    : `No ${activeTab} emails available`
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
