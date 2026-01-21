import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';

function AppContent() {
  const { user, isLoading } = useAuth();
  useFrameworkReady();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
      </View>
    );
  }

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        // Disable web navigation bar
        presentation: 'card',
        // Prevent automatic tab opening on web
        animation: 'none',
      }}>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="project/[id]" 
        options={{ 
          headerShown: false,
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="+not-found" 
        options={{
          presentation: 'card',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Hide Expo Router web navigation breadcrumbs and project/undefined links
    // Also style the tab bar for symmetric distribution on web
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Style tab bar for symmetric distribution
      const styleTabBar = () => {
        const style = document.createElement('style');
        style.id = 'tab-bar-symmetric-style';
        style.textContent = `
          /* Make tab bar symmetric on web */
          [role="tablist"],
          [class*="tab-bar"],
          nav[class*="tab"],
          div[class*="tab-bar"] {
            display: flex !important;
            justify-content: space-around !important;
            align-items: center !important;
            width: 100% !important;
            padding: 0 !important;
          }
          
          [role="tab"],
          [class*="tab-item"],
          button[class*="tab"],
          a[class*="tab"] {
            flex: 1 !important;
            max-width: none !important;
            min-width: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 8px 4px !important;
          }
          
          /* Ensure equal spacing */
          [role="tablist"] > *,
          [class*="tab-bar"] > * {
            flex: 1 1 auto !important;
            min-width: 0 !important;
          }
          
          /* Hide triangle icons in navigation (except tab bar) */
          nav:not([role="tablist"]):not([class*="tab-bar"]) svg polygon,
          nav:not([role="tablist"]):not([class*="tab-bar"]) svg path,
          [role="navigation"]:not([role="tablist"]) svg polygon,
          [role="navigation"]:not([role="tablist"]) svg path {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Hide navigation breadcrumbs with triangles */
          nav:not([role="tablist"]):not([class*="tab-bar"]) svg,
          [role="navigation"]:not([role="tablist"]) svg {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Hide all navigation bars except tab bar */
          nav:not([role="tablist"]):not([class*="tab-bar"]),
          [role="navigation"]:not([role="tablist"]):not([class*="tab-bar"]) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          
          /* Prevent automatic tab opening - hide Expo Router navigation */
          [data-exp-router] > nav:not([role="tablist"]),
          [data-exp-router] > [role="navigation"]:not([role="tablist"]) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
          }
          
          /* Hide sub menus / breadcrumbs next to tab bar icons on mobile */
          [role="tab"] > *:not([class*="tab-icon"]):not([class*="tab-label"]),
          [role="tab"] > a:not([href*="tab"]),
          [role="tab"] > nav,
          [role="tab"] > [role="navigation"],
          [class*="tab-item"] > *:not([class*="tab-icon"]):not([class*="tab-label"]),
          [class*="tab-item"] > a:not([href*="tab"]),
          [class*="tab-item"] > nav,
          [class*="tab-item"] > [role="navigation"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          
          /* Hide any navigation elements that appear next to tab items */
          [role="tablist"] ~ nav,
          [role="tablist"] ~ [role="navigation"],
          [class*="tab-bar"] ~ nav,
          [class*="tab-bar"] ~ [role="navigation"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
          }
        `;
        
        // Remove existing style if present
        const existingStyle = document.getElementById('tab-bar-symmetric-style');
        if (existingStyle) {
          existingStyle.remove();
        }
        
        document.head.appendChild(style);
      };
      
      // Apply tab bar styling
      styleTabBar();
      
      const hideBreadcrumbs = () => {
        // Re-apply tab bar styling
        styleTabBar();
        
        // Only hide breadcrumb navigation, NOT tab bar items
        // Target specific Expo Router breadcrumb elements that are NOT part of tab bar
        const hideSpecificBreadcrumbs = () => {
          // Hide breadcrumb navigation that contains project paths and is NOT inside tab bar
          const allNavs = document.querySelectorAll('nav, [role="navigation"]');
          allNavs.forEach((nav) => {
            // Skip if it's part of tab bar
            const isTabBar = nav.closest('[role="tablist"]') || 
                           nav.closest('[class*="tab-bar"]') ||
                           nav.querySelector('[role="tab"]');
            
            if (isTabBar) {
              return; // Don't hide tab bar
            }
            
            // Check if it's a breadcrumb navigation (has project paths)
            const text = nav.textContent || '';
            const html = nav.innerHTML || '';
            
            // Only hide if it contains project paths and is a breadcrumb (not tab bar)
            if ((text.includes('/project/') || text.includes('project/undefined') || 
                 html.includes('/project/') || html.includes('project/undefined')) &&
                !nav.closest('[role="tablist"]') &&
                !nav.closest('[class*="tab-bar"]')) {
              nav.style.display = 'none';
              nav.style.visibility = 'hidden';
              nav.style.height = '0';
              nav.style.overflow = 'hidden';
            }
          });

          // Hide specific links with project/undefined that are NOT in tab bar
          const allLinks = document.querySelectorAll('a[href*="project/undefined"], a[href*="project/["]');
          allLinks.forEach((link) => {
            const href = link.getAttribute('href') || '';
            // Skip if it's part of tab bar
            const isTabBarLink = link.closest('[role="tablist"]') || 
                                link.closest('[role="tab"]') ||
                                link.closest('[class*="tab-bar"]');
            
            if (!isTabBarLink && (href.includes('project/undefined') || href.includes('project/['))) {
              link.style.display = 'none';
              link.style.visibility = 'hidden';
            }
          });

          // Hide breadcrumb containers that are NOT tab bars
          const breadcrumbs = document.querySelectorAll('[class*="breadcrumb"], [data-breadcrumb]');
          breadcrumbs.forEach((breadcrumb) => {
            const isTabBar = breadcrumb.closest('[role="tablist"]') || 
                           breadcrumb.closest('[class*="tab-bar"]');
            
            if (!isTabBar) {
              const text = breadcrumb.textContent || '';
              if (text.includes('project/') || text.includes('project[') || text.includes('undefined')) {
                breadcrumb.style.display = 'none';
                breadcrumb.style.visibility = 'hidden';
                breadcrumb.style.height = '0';
                breadcrumb.style.overflow = 'hidden';
              }
            }
          });

          // Hide triangle icons (SVG polygons/paths) that are NOT in tab bar
          const allSvgs = document.querySelectorAll('svg');
          allSvgs.forEach((svg) => {
            const isTabBar = svg.closest('[role="tablist"]') || 
                           svg.closest('[role="tab"]') ||
                           svg.closest('[class*="tab-bar"]') ||
                           svg.closest('[class*="tab-item"]');
            
            // Only hide if it's a triangle icon (has polygon with triangle shape or path with triangle)
            if (!isTabBar) {
              const polygons = svg.querySelectorAll('polygon, path');
              polygons.forEach((poly) => {
                const points = poly.getAttribute('points') || '';
                const d = poly.getAttribute('d') || '';
                // Check if it's a triangle shape (3 points or triangle path)
                if (points.split(' ').length === 3 || 
                    d.includes('M') && d.includes('L') && (d.match(/L/g) || []).length >= 2) {
                  // Check if it's in navigation/breadcrumb context
                  const parent = svg.closest('nav, [role="navigation"], a[href*="project"], [class*="breadcrumb"]');
                  if (parent && !parent.closest('[role="tablist"]') && !parent.closest('[class*="tab-bar"]')) {
                    svg.style.display = 'none';
                    svg.style.visibility = 'hidden';
                  }
                }
              });
            }
          });

          // Hide all navigation elements with triangle icons (except tab bar)
          const navElements = document.querySelectorAll('nav, [role="navigation"]');
          navElements.forEach((nav) => {
            const isTabBar = nav.closest('[role="tablist"]') || 
                           nav.closest('[class*="tab-bar"]') ||
                           nav.querySelector('[role="tab"]');
            
            if (!isTabBar) {
              // Check if it contains triangle SVG
              const triangleSvgs = nav.querySelectorAll('svg');
              let hasTriangle = false;
              triangleSvgs.forEach((svg) => {
                const polygons = svg.querySelectorAll('polygon, path');
                polygons.forEach((poly) => {
                  const points = poly.getAttribute('points') || '';
                  const d = poly.getAttribute('d') || '';
                  if (points.split(' ').length === 3 || 
                      (d.includes('M') && d.includes('L') && (d.match(/L/g) || []).length >= 2)) {
                    hasTriangle = true;
                  }
                });
              });
              
              if (hasTriangle) {
                nav.style.display = 'none';
                nav.style.visibility = 'hidden';
                nav.style.height = '0';
                nav.style.overflow = 'hidden';
              }
            }
          });

          // Hide sub menus / breadcrumbs next to tab bar icons
          const tabItems = document.querySelectorAll('[role="tab"], [class*="tab-item"]');
          tabItems.forEach((tab) => {
            // Hide any navigation elements inside tab items
            const navInsideTab = tab.querySelectorAll('nav, [role="navigation"], a[href*="project"], svg:not([class*="tab-icon"])');
            navInsideTab.forEach((element) => {
              // Only hide if it's not the main tab icon or label
              const isMainContent = element.closest('[class*="tab-icon"]') || 
                                   element.closest('[class*="tab-label"]') ||
                                   element.classList.contains('tab-icon') ||
                                   element.classList.contains('tab-label');
              
              if (!isMainContent) {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.height = '0';
                element.style.overflow = 'hidden';
              }
            });
          });

          // Hide any navigation elements that appear next to tab bar
          const tabBar = document.querySelector('[role="tablist"], [class*="tab-bar"]');
          if (tabBar) {
            // Hide next sibling navigation elements
            let nextSibling = tabBar.nextElementSibling;
            while (nextSibling) {
              if (nextSibling.tagName === 'NAV' || nextSibling.getAttribute('role') === 'navigation') {
                const text = nextSibling.textContent || '';
                if (text.includes('project/') || text.includes('undefined') || nextSibling.querySelector('svg')) {
                  nextSibling.style.display = 'none';
                  nextSibling.style.visibility = 'hidden';
                  nextSibling.style.height = '0';
                  nextSibling.style.overflow = 'hidden';
                }
              }
              nextSibling = nextSibling.nextElementSibling;
            }
          }
        };
        
        hideSpecificBreadcrumbs();
      };

      // Run after a short delay to ensure DOM is ready
      const timeout = setTimeout(hideBreadcrumbs, 100);

      // Run after DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideBreadcrumbs);
      } else {
        hideBreadcrumbs();
      }

      // Use MutationObserver to catch dynamically added elements
      // But throttle it to avoid performance issues
      let observerTimeout: NodeJS.Timeout | null = null;
      const observer = new MutationObserver(() => {
        if (observerTimeout) {
          clearTimeout(observerTimeout);
        }
        observerTimeout = setTimeout(() => {
          hideBreadcrumbs();
          styleTabBar();
          
          // Aggressively hide any new navigation elements that appear
          const allNavs = document.querySelectorAll('nav, [role="navigation"]');
          allNavs.forEach((nav) => {
            const isTabBar = nav.closest('[role="tablist"]') || 
                           nav.closest('[class*="tab-bar"]') ||
                           nav.querySelector('[role="tab"]');
            
            if (!isTabBar) {
              // Check for triangle SVG or breadcrumb indicators
              const hasTriangle = nav.querySelector('svg polygon, svg path');
              const hasProjectLink = nav.querySelector('a[href*="project"]');
              const text = nav.textContent || '';
              
              if (hasTriangle || hasProjectLink || text.includes('project/') || text.includes('undefined')) {
                nav.style.display = 'none';
                nav.style.visibility = 'hidden';
                nav.style.height = '0';
                nav.style.overflow = 'hidden';
              }
            }
          });
        }, 100); // Throttle to 100ms
      });
      
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class'],
        });
      }

      return () => {
        clearTimeout(timeout);
        if (observerTimeout) {
          clearTimeout(observerTimeout);
        }
        observer.disconnect();
        const style = document.getElementById('tab-bar-symmetric-style');
        if (style) {
          style.remove();
        }
      };
    }
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
        <StatusBar style="auto" />
      </LanguageProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#236ecf', // Blue background
  },
});