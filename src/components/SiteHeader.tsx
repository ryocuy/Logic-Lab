
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Kelompok6Logo from '@/components/Kelompok6Logo';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Logic Gates' },
  { href: '/circuit-builder', label: 'Circuit Builder' },
  { href: '/converter', label: 'Converter' },
  { href: '/learning-center', label: 'Learning' },
  { href: '/team-manager', label: 'Team' },
  { href: '/documentation', label: 'Documentation' },
];

const SiteHeader: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (scrollTop > lastScrollTop && scrollTop > 100) { // If scrolling down and past 100px
        setIsHeaderHidden(true);
      } else if (scrollTop < lastScrollTop) { // If scrolling up
        setIsHeaderHidden(false);
      }
      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-md' : 'bg-transparent'} ${isHeaderHidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                KELOMPOK
              </h1>
            </div>
            <Kelompok6Logo className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'default' : 'ghost'}
                asChild
                className={`transition-all duration-200 ease-in-out hover:shadow-lg ${pathname === item.href ? 'shadow-md scale-105' : 'hover:scale-105'}`}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <nav className="flex flex-col space-y-2 p-6 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.href}
                      variant={pathname === item.href ? 'default' : 'ghost'}
                      asChild
                      className="justify-start text-lg py-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
