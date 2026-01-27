import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Shield, HelpCircle, LogOut, Trash2, User, Mail, Phone, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    toast.error('Account deletion not implemented yet');
    setShowDeleteDialog(false);
  };

  const handleLanguageChange = (lang: 'en' | 'es') => {
    setLanguage(lang);
    setShowLanguageDialog(false);
    toast.success(lang === 'es' ? 'Idioma cambiado a español' : 'Language changed to English');
  };

  const settingsSections = [
    {
      title: t('account'),
      items: [
        { icon: User, label: 'Edit Profile', onClick: () => navigate('/profile') },
        { icon: Mail, label: 'Email Settings', onClick: () => toast.info('Coming soon') },
        { icon: Phone, label: 'Phone Number', onClick: () => toast.info('Coming soon') },
        { icon: Globe, label: t('language'), onClick: () => setShowLanguageDialog(true) },
      ],
    },
    {
      title: t('privacy'),
      items: [
        { icon: Shield, label: 'Privacy Settings', onClick: () => toast.info('Coming soon') },
        { icon: Bell, label: 'Notifications', onClick: () => toast.info('Coming soon') },
      ],
    },
    {
      title: t('support'),
      items: [
        { icon: HelpCircle, label: 'Help Center', onClick: () => toast.info('Coming soon') },
        { icon: Mail, label: 'Contact Us', onClick: () => toast.info('Coming soon') },
      ],
    },
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <motion.button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">{t('settings')}</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* User Info */}
        {user && (
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {user.displayName || `${user.firstName} ${user.lastName}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.email || user.phone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full p-4 rounded-xl bg-card flex items-center justify-between"
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">{item.label}</span>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
            Danger Zone
          </h3>
          <div className="space-y-1">
            <motion.button
              onClick={() => setShowLogoutDialog(true)}
              className="w-full p-4 rounded-xl bg-card flex items-center justify-between border-2 border-destructive/20"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-destructive" />
                <span className="font-medium text-foreground">Log Out</span>
              </div>
              <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
            </motion.button>

            <motion.button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full p-4 rounded-xl bg-card flex items-center justify-between border-2 border-destructive/20"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-destructive" />
                <span className="font-medium text-destructive">Delete Account</span>
              </div>
              <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Language Selection Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('language')}</DialogTitle>
            <DialogDescription>
              Select your preferred language
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <motion.button
              onClick={() => handleLanguageChange('en')}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('english')}</span>
                {language === 'en' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-primary-foreground flex items-center justify-center"
                  >
                    <span className="text-primary text-xs">✓</span>
                  </motion.div>
                )}
              </div>
            </motion.button>
            <motion.button
              onClick={() => handleLanguageChange('es')}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                language === 'es'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('spanish')}</span>
                {language === 'es' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-primary-foreground flex items-center justify-center"
                  >
                    <span className="text-primary text-xs">✓</span>
                  </motion.div>
                )}
              </div>
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default SettingsPage;
