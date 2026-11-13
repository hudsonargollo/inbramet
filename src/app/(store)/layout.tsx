import { ConditionalHeader } from "@/components/conditional-header";
import { ConditionalFooter } from "@/components/conditional-footer";
import { SupportChat } from "@/components/support-chat";
import { getStoreSettings, renderAnnouncements } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <>
      <ConditionalHeader
        announcements={renderAnnouncements(settings)}
        clubName={settings.loyalty.enabled ? settings.loyalty.name : null}
      />
      <main className="flex-1">{children}</main>
      <ConditionalFooter settings={settings} />
      <SupportChat settings={settings} />
    </>
  );
}
