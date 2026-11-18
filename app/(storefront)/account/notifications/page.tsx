import { getMyNotifications } from "@/lib/data/account-notifications";
import { NotificationList } from "@/components/storefront/notification-list";

export default async function AccountNotificationsPage() {
  const notifications = await getMyNotifications();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-brand-50/70 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">Communication</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Notifications</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Updates about your orders, repairs, rentals and account activity.</p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
