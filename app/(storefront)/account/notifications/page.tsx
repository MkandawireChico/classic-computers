import { getMyNotifications } from "@/lib/data/account-notifications";
import { NotificationList } from "@/components/storefront/notification-list";

export default async function AccountNotificationsPage() {
  const notifications = await getMyNotifications();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Communication</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">Notifications</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Updates about your orders, repairs, rentals and account activity.</p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
