'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthLayoutContextType {
  title: string;
  description: string | ReactNode;
  setTitle: (title: string) => void;
  setDescription: (description: string | ReactNode) => void;
  setTitleAndDescription: (title: string, description: string | ReactNode) => void;
}

const AuthLayoutContext = createContext<AuthLayoutContextType | undefined>(undefined);

export const useAuthLayout = () => {
  const context = useContext(AuthLayoutContext);
  if (!context) {
    throw new Error('useAuthLayout must be used within an AuthLayoutProvider');
  }
  return context;
};

interface AuthLayoutProviderProps {
  children: ReactNode;
  defaultTitle?: string;
  defaultDescription?: string | ReactNode;
}

export const AuthLayoutProvider: React.FC<AuthLayoutProviderProps> = ({
  children,
  defaultTitle = '',
  defaultDescription = '',
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState<string | ReactNode>(defaultDescription);

  const setTitleAndDescription = (newTitle: string, newDescription: string | ReactNode) => {
    setTitle(newTitle);
    setDescription(newDescription);
  };

  return (
    <AuthLayoutContext.Provider
      value={{
        title,
        description,
        setTitle,
        setDescription,
        setTitleAndDescription,
      }}
    >
      {children}
    </AuthLayoutContext.Provider>
  );
};
