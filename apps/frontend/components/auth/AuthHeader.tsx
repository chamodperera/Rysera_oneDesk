"use client";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-2xl font-bold text-foreground">
        <span className="text-primary">OneDesk</span> {title}
      </h1>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
