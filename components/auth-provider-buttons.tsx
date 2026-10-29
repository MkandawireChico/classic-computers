import type { ComponentType, SVGProps } from "react";
import { Button } from "@/components/ui/button";

type OAuthProvider = "google" | "azure";
type ProviderIcon = ComponentType<SVGProps<SVGSVGElement>>;

const providers: { provider: OAuthProvider; label: string; Icon: ProviderIcon }[] = [
  { provider: "google", label: "Google", Icon: GoogleIcon },
  { provider: "azure", label: "Microsoft", Icon: MicrosoftIcon },
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
          className="w-full"
          onClick={() => onProviderSelect(provider)}
        >
          <span className="relative flex w-full items-center justify-center">
            <Icon aria-hidden="true" className="absolute left-0 h-5 w-5" />
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