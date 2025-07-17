'use client'

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search, Copy, Trash2, Plus } from "lucide-react";
import { PageHeader } from "@nlc-ai/shared";
import { AlertBanner } from '@nlc-ai/ui';
import RetentionStats from "@/lib/components/client-retention/stats";

interface EmailTemplate {
  id: string;
  title: string;
  type: 'feedback' | 'retention' | 'survey' | 'followup';
  status: 'active' | 'archived';
  createdAt: string;
  preview: string;
  usageCount: number;
  lastUsed?: string;
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    title: 'Feedback Survey 01',
    type: 'feedback',
    status: 'active',
    createdAt: 'Apr 14, 2025 | 10:30 AM',
    preview: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 234,
    lastUsed: 'Mar 15, 2025'
  },
  {
    id: '2',
    title: 'User Drop-Off at 25%',
    type: 'retention',
    status: 'active',
    createdAt: 'Apr 14, 2025 | 10:30 AM',
    preview: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 156,
    lastUsed: 'Mar 20, 2025'
  },
  {
    id: '3',
    title: 'User Drop-Off at 50%',
    type: 'retention',
    status: 'active',
    createdAt: 'Apr 14, 2025 | 10:30 AM',
    preview: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 89,
    lastUsed: 'Mar 18, 2025'
  },
  {
    id: '4',
    title: 'Client Didn\'t Show Up On Call',
    type: 'followup',
    status: 'active',
    createdAt: 'Apr 14, 2025 | 10:30 AM',
    preview: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 45,
    lastUsed: 'Mar 10, 2025'
  },
  {
    id: '5',
    title: 'Feedback Survey 02',
    type: 'feedback',
    status: 'active',
    createdAt: 'Apr 14, 2025 | 10:30 AM',
    preview: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 123,
    lastUsed: 'Mar 25, 2025'
  },
  {
    id: '6',
    title: 'User Drop-Off at 75%',
    type: 'retention',
    status: 'active',
    createdAt: 'Apr 14, 2025 | 10:30 AM',
    preview: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 67,
    lastUsed: 'Mar 12, 2025'
  }
];

const templateTypeColors = {
  feedback: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  retention: 'bg-red-500/20 text-red-400 border-red-500/30',
  survey: 'bg-green-500/20 text-green-400 border-green-500/30',
  followup: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

const templateTypeLabels = {
  feedback: 'Feedback',
  retention: 'Retention',
  survey: 'Survey',
  followup: 'Follow-up'
};

interface TemplateCardProps {
  template: EmailTemplate;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

const TemplateCard = ({ template, onEdit, onDuplicate, onDelete }: TemplateCardProps) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
        <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-neutral-700">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-stone-50 text-lg font-semibold leading-tight flex-1 line-clamp-2">
            {template.title}
          </h3>

          <div className="flex items-center gap-2 ml-3">
            <button
              onClick={() => onDuplicate(template.id)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-70 hover:opacity-100"
              title="Duplicate template"
            >
              <Copy className="w-4 h-4 text-stone-50" />
            </button>
            <button
              onClick={() => onDelete(template.id)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-70 hover:opacity-100"
              title="Delete template"
            >
              <Trash2 className="w-4 h-4 text-stone-50" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${templateTypeColors[template.type]}`}>
            {templateTypeLabels[template.type]}
          </span>

          <div className="text-stone-400 text-xs">
            Created: {template.createdAt}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 space-y-4">
        <div>
          <div className="text-stone-300 text-sm font-medium mb-2">Automated Email Template</div>
          <p className="text-stone-400 text-sm leading-relaxed line-clamp-3">
            {template.preview}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-4">
            <span>Used {template.usageCount} times</span>
            {template.lastUsed && (
              <span>Last used: {template.lastUsed}</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => onEdit(template.id)}
            className="text-fuchsia-400 text-sm font-medium underline hover:text-fuchsia-300 transition-colors"
          >
            View & Edit Template
          </button>
        </div>
      </div>
    </div>
  );
};

const TemplatesSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 animate-pulse">
        <div className="border-b border-neutral-700 pb-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="h-6 bg-neutral-700 rounded w-3/4"></div>
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-neutral-700 rounded"></div>
              <div className="w-6 h-6 bg-neutral-700 rounded"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-5 bg-neutral-700 rounded w-20"></div>
            <div className="h-4 bg-neutral-700 rounded w-32"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-neutral-700 rounded w-40"></div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-neutral-700 rounded w-4/5"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/5"></div>
          </div>
          <div className="h-4 bg-neutral-700 rounded w-32"></div>
          <div className="h-4 bg-neutral-700 rounded w-36"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function RetentionTemplates() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'stats'>('active');
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setTemplates(mockTemplates);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTemplateEdit = (templateId: string) => {
    router.push(`/client-retention/template-editor`);
  };

  const handleTemplateDuplicate = (templateId: string) => {
    console.log('Duplicate template:', templateId);
    // Handle duplication logic
  };

  const handleTemplateDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleCreateNew = () => {
    router.push('/client-retention/template-editor');
  };

  const filteredTemplates = templates.filter(template => {
    const matchesTab = activeTab === 'active' ? template.status === 'active' : template.status === 'archived';
    const matchesSearch = searchQuery === "" ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;

    return matchesTab && matchesSearch && matchesType;
  });

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'retention', label: 'Retention' },
    { value: 'survey', label: 'Survey' },
    { value: 'followup', label: 'Follow-up' }
  ];

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
                placeholder="Search templates by name"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create New Template
            </button>
          </>
        </PageHeader>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8 border-b border-neutral-700">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-4 text-lg font-medium transition-colors border-b-2 ${
                activeTab === 'active'
                  ? 'text-fuchsia-400 border-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50 border-transparent'
              }`}
            >
              Active Templates
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`pb-4 text-lg font-medium transition-colors border-b-2 ${
                activeTab === 'archived'
                  ? 'text-fuchsia-400 border-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50 border-transparent'
              }`}
            >
              Archived
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-4 text-lg font-medium transition-colors border-b-2 ${
                activeTab === 'stats'
                  ? 'text-fuchsia-400 border-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50 border-transparent'
              }`}
            >
              Stats
            </button>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-3">
            <span className="text-stone-300 text-sm">Filter by type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg text-sm focus:border-purple-500 outline-none"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <TemplatesSkeleton />
        ) : activeTab === 'stats' ? (
          /*<div className="text-center py-12">
            <div className="text-stone-400 text-lg mb-2">Stats View</div>
            <div className="text-stone-500 text-sm">Statistics functionality coming soon</div>
          </div>*/
          <RetentionStats/>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleTemplateEdit}
                  onDuplicate={handleTemplateDuplicate}
                  onDelete={handleTemplateDelete}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-stone-400 text-lg mb-2">
                  No {activeTab} templates found
                </div>
                <div className="text-stone-500 text-sm">
                  {searchQuery
                    ? `No templates match your search for "${searchQuery}"`
                    : `No ${activeTab} templates available`
                  }
                </div>
                {activeTab === 'active' && (
                  <button
                    onClick={handleCreateNew}
                    className="mt-4 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Create Your First Template
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
