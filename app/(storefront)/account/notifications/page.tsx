import { AccountPageHeader } from "@/components/storefront/account-page-header";
import { getMyNotifications } from "@/lib/data/account-notifications";
import { NotificationList } from "@/components/storefront/notification-list";

export default async function AccountNotificationsPage() {
  const notifications = await getMyNotifications();

  return (
    <div className="space-y-6">
      <AccountPageHeader eyebrow="Communication · Account updates" title="Notifications" description="Updates about your orders, repairs, rentals and account activity." />
      <NotificationList notifications={notifications} />
    </div>
  );
}
