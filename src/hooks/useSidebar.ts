import { useState, useCallback } from 'react';

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    toggleSidebar,
  };
};
