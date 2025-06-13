import React from 'react';

interface PageShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ title, subtitle, children }) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
};

export default PageShell;
