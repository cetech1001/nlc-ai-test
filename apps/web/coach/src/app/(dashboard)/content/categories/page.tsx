'use client'

import {useState, useEffect, ComponentType} from 'react';
import { useRouter } from "next/navigation";
import {Lightbulb, MessageCircle, Play, Plus} from "lucide-react";
import { PageHeader } from "@nlc-ai/web-shared";
import { AlertBanner } from '@nlc-ai/web-ui';
import {CategoriesSkeleton, CategoryCard, sdkClient} from '@/lib';
import {Category} from "@nlc-ai/sdk-content";

const ContentCategories = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<(Category & { icon: ComponentType<any>; color: string; })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);

    try {
      const result = await sdkClient.content.categories.getCategories();
      const categories = result.data;
      setCategories(categories.map(v => {
        switch (v.name) {
          case 'Informative':
            return {
              ...v,
              icon: Lightbulb,
              color: 'from-blue-500 to-cyan-500'
            };
          case 'Controversial':
            return {
              ...v,
              icon: MessageCircle,
              color: 'from-red-500 to-orange-500'
            };
          default:
            return {
              ...v,
              icon: Play,
              color: 'from-purple-500 to-pink-500',
            }
        }
      }));
    } catch (e: any) {
      setError(e.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }

  const handleViewDetails = (categoryID: string) => {
    router.push(`/content/categories/${categoryID}`);
  };

  const handleEditCategory = (categoryID: string) => {
    console.log('Edit category:', categoryID);
  };

  const handleDeleteCategory = (categoryID: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(c => c.id !== categoryID));
    }
  };

  const handleCreateCategory = () => {
    console.log('Create new category');
  };

  return (
    <div className={'flex flex-col'}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={() => setError('')}/>
        )}

        <PageHeader
          title={"Content Categories"}
          actionButton={{
            label: 'Create New Category',
            onClick: handleCreateCategory,
            icon: <Plus className="w-4 h-4" />,
          }}
        />
        {isLoading ? (
          <CategoriesSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onViewDetails={() => handleViewDetails(category.id)}
                  onEdit={() => handleEditCategory(category.id)}
                  onDelete={() => handleDeleteCategory(category.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-stone-400 text-lg mb-2">No categories found</div>
                <div className="text-stone-500 text-sm">No content categories available</div>
                <button
                  onClick={handleCreateCategory}
                  className="mt-4 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Create Your First Category
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContentCategories;
