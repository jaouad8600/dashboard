"use client";
export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
    </header>
  );
}
