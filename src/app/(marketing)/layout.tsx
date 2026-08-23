import { MaintenanceBanner } from "@/components/marketing/maintenance-banner";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <SiteHeader />
      <MaintenanceBanner />
      {children}
      <SiteFooter />
    </div>
  );
}
