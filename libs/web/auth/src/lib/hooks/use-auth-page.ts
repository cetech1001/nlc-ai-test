'use client';

import {ReactNode, useEffect} from 'react';
import { useAuthLayout } from '../context';

interface UseAuthPageOptions {
  title: string;
  description: string | ReactNode;
}

export const useAuthPage = ({ title, description }: UseAuthPageOptions) => {
  const { setTitleAndDescription } = useAuthLayout();

  useEffect(() => {
    setTitleAndDescription(title, description);
  }, [title, description, setTitleAndDescription]);
};
