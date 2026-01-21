import { ReactNode } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

const MobileLayout = ({ children, hideNav = false }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">
        {children}
      </div>
      {!hideNav && <div className="h-20" />} {/* Spacer for bottom nav */}
    </div>
  );
};

export default MobileLayout;
