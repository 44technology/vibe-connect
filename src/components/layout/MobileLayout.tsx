import { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

const MobileLayout = ({ children, hideNav = false }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default MobileLayout;
