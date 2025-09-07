'use client';

import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Cal AI',
  showMenu = false,
  onMenuClick,
  onSettingsClick,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        {/* Menu button (optional) */}
        {showMenu ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-10" />
        )}

        {/* Title */}
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

        {/* Settings button (optional) */}
        {onSettingsClick ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
          >
            <Settings className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  );
};