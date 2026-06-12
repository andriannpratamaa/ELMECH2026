interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function AdminPageHeader({ title, description, children }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">{title}</h1>
        {description && <p className="text-sm text-white/40 mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
}
