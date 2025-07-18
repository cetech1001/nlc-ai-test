'use client'

import {useState, useEffect, useMemo} from 'react';
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { DataFilter } from "@nlc-ai/shared";
import { AlertBanner } from '@nlc-ai/ui';
import RetentionStats from "@/lib/components/retention/stats";
import {emptyTemplateFilterValues, mockTemplates, TemplateCard, templateFilters, TemplatesSkeleton} from "@/lib";
import {EmailTemplate, FilterValues} from "@nlc-ai/types";

const RetentionTemplates = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'stats'>('active');
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyTemplateFilterValues);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
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
  };

  const handleTemplateDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleCreateNew = () => {
    router.push('/client-retention/template-editor');
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
  };

  const handleResetFilters = () => {
    setFilterValues(emptyTemplateFilterValues);
    setSearchQuery("");
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesTab = activeTab === 'active' ? template.isActive : !template.isActive;
      const matchesSearch = searchQuery === "" ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.bodyTemplate.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !filterValues.type?.length || filterValues.type.includes(template.category);

      const matchesUsage = (!filterValues.usageRange?.min || (template.usageCount || 0) >= parseInt(filterValues.usageRange.min)) &&
        (!filterValues.usageRange?.max || (template.usageCount || 0) <= parseInt(filterValues.usageRange.max));

      const templateDate = new Date(template.createdAt || '');
      const matchesDate = (!filterValues.dateRange?.start || templateDate >= new Date(filterValues.dateRange.start)) &&
        (!filterValues.dateRange?.end || templateDate <= new Date(filterValues.dateRange.end));

      return matchesTab && matchesSearch && matchesType && matchesUsage && matchesDate;
    });
  }, [templates, activeTab]);

  return (
    <div className={`flex flex-col ${ isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' }`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={() => setError('')}/>
        )}

        <div className={"flex flex-col xl:flex-row justify-between gap-3 xl:gap-0"}>
          <div className="flex justify-center xl:justify-start items-center gap-8 w-full xl:w-2/5 order-3 xl:order-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`text-lg font-medium transition-colors ${
                activeTab === 'active'
                  ? 'text-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50'
              }`}
            >
              Active Templates
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`text-lg font-medium transition-colors ${
                activeTab === 'archived'
                  ? 'text-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50'
              }`}
            >
              Archived
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`text-lg font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'text-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50'
              }`}
            >
              Stats
            </button>
          </div>
          <div className={"flex w-full xl:w-3/5 order-1 xl:order-2 justify-end gap-2"}>
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

            <DataFilter
              filters={templateFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />

            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity hidden md:flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create New Template
            </button>
          </div>
          <div className={"w-full flex md:hidden order-2"}>
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity items-center gap-2 font-medium flex"
            >
              <Plus className="w-4 h-4" />
              Create New Template
            </button>
          </div>
        </div>

        {isLoading ? (
          <TemplatesSkeleton />
        ) : activeTab === 'stats' ? (
          <RetentionStats/>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
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

export default RetentionTemplates;
