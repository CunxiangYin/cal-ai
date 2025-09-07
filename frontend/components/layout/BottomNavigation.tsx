'use client';

import React from 'react';
import { MessageCircle, User, Clock } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  id: 'chat' | 'history' | 'profile';
  label: string;
  icon: React.ReactNode;
  path: string;
}

export const BottomNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useUIStore();

  const navItems: NavItem[] = [
    {
      id: 'chat',
      label: '问答',
      icon: <MessageCircle className="h-5 w-5" />,
      path: '/',
    },
    {
      id: 'history',
      label: '历史',
      icon: <Clock className="h-5 w-5" />,
      path: '/history',
    },
    {
      id: 'profile',
      label: '我的',
      icon: <User className="h-5 w-5" />,
      path: '/profile',
    },
  ];

  const handleNavClick = (item: NavItem) => {
    setActiveTab(item.id);
    router.push(item.path);
  };

  // Determine active tab based on pathname
  React.useEffect(() => {
    if (pathname === '/profile') {
      setActiveTab('profile');
    } else if (pathname === '/history') {
      setActiveTab('history');
    } else {
      setActiveTab('chat');
    }
  }, [pathname, setActiveTab]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-3 h-16">
          {navItems.map((item) => {
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors",
                  "hover:bg-gray-50",
                  isActive && "text-blue-600"
                )}
              >
                <div className={cn(
                  "transition-colors",
                  isActive ? "text-blue-600" : "text-gray-500"
                )}>
                  {item.icon}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-blue-600" : "text-gray-500"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};