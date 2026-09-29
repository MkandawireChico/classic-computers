import { getMyNotifications } from "@/lib/data/account-notifications";
import { NotificationList } from "@/components/storefront/notification-list";

export default async function AccountNotificationsPage() {
  const notifications = await getMyNotifications();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Notifications</h1>
      <NotificationList notifications={notifications} />
    </div>
  );
}
