import type { ComponentType, SVGProps } from "react";
import { Button } from "@/components/ui/button";

type OAuthProvider = "google" | "azure" | "apple";
type ProviderIcon = ComponentType<SVGProps<SVGSVGElement>>;

const providers: { provider: OAuthProvider; label: string; Icon: ProviderIcon }[] = [
  { provider: "google", label: "Google", Icon: GoogleIcon },
  { provider: "azure", label: "Microsoft", Icon: MicrosoftIcon },
  { provider: "apple", label: "Apple", Icon: AppleIcon },
];

export function AuthProviderButtons({
  onProviderSelect,
}: {
  onProviderSelect: (provider: OAuthProvider) => void;
}) {
  return (
    <div className="space-y-3">
      {providers.map(({ provider, label, Icon }) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          className="min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 focus-visible:ring-offset-2"
          onClick={() => onProviderSelect(provider)}
        >
          <span className="relative flex w-full items-center justify-center gap-3">
            <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>Continue with {label}</span>
          </span>
        </Button>
      ))}
    </div>
  );
}

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.05 5.05 0 0 1-2.2 3.31v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.29-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.72 1.06-2.87 0-5.3-1.94-6.17-4.55H2.15v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.83 14.08a6.6 6.6 0 0 1 0-4.16V7.08H2.15a11 11 0 0 0 0 9.84l3.68-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.37c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 1.09 14.97 0 12 0a11 11 0 0 0-9.85 6.08l3.68 2.84C6.7 6.31 9.13 4.37 12 4.37Z"
      />
    </svg>
  );
}

function MicrosoftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
      <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
      <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
      <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
    </svg>
  );
}

function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}