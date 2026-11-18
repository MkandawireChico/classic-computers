import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { BackButton } from "@/components/navigation/back-button";
import { StorefrontAssistant } from "@/components/storefront/storefront-assistant";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <BackButton />
        {children}
      </main>
      <SiteFooter />
      <StorefrontAssistant />
    </div>
  );
}
