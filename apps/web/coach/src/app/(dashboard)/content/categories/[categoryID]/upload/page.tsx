'use client'

import { useState } from 'react';
import {useParams, useRouter} from 'next/navigation';
import { UploadContentModal } from '@/lib';

export default function UploadContentPage() {
  const router = useRouter();
  const params = useParams();
  const preselectedCategory = params.categoryID as string;

  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleUpload = async (file: File, category: string) => {
    // Simulate upload process
    console.log('Uploading file:', file.name, 'to category:', category);

    // Here you would typically:
    // 1. Upload file to storage (S3, etc.)
    // 2. Save metadata to database
    // 3. Process video if needed

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Redirect back to the category or main content page
    if (preselectedCategory) {
      router.push(`/content/categories/${preselectedCategory}`);
    } else {
      router.push('/content/categories');
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    // Navigate back to previous page
    if (preselectedCategory) {
      router.push(`/content/categories/${preselectedCategory}`);
    } else {
      router.push('/content/categories');
    }
  };

  return (
    <UploadContentModal
      isOpen={isModalOpen}
      onCloseAction={handleClose}
      onUploadAction={handleUpload}
      preselectedCategory={preselectedCategory}
    />
  );
}
