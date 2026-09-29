export function ComingSoonNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-surface-border bg-surface-muted p-4 text-sm text-gray-600">
      {children}
    </div>
  );
}
