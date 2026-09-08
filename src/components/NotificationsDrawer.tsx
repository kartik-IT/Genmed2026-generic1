import React from 'react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionType: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n1',
      title: 'Price Drop Alert',
      body: 'Atorvastatin Calcium 20mg rate dropped to $9.20 at Metro Health Rx (-$1.30 vs prior fill).',
      time: '24m ago',
      type: 'price',
      icon: 'trending_down',
      actionText: 'View Rate',
    },
    {
      id: 'n2',
      title: 'Refill Due in 6 Days',
      body: 'Your 30-day supply of Atorvastatin Ca is ready for scheduled refill dispatch.',
      time: '2h ago',
      type: 'refill',
      icon: 'event_repeat',
      actionText: 'Reserve Refill',
    },
    {
      id: 'n3',
      title: 'Regional Supply Watch',
      body: 'Sertraline 50mg inventory is running low in 2 Austin regional stores.',
      time: 'Yesterday',
      type: 'stock',
      icon: 'warning',
      actionText: 'Lock Supply',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-xs p-3 animate-fadeIn">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container flex flex-col mt-12">
        <div className="px-4 py-3 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              notifications
            </span>
            <span className="font-headline-sm text-[15px] font-bold text-on-surface">
              Live Clinical Alerts
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface text-xs"
          >
            ✕
          </button>
        </div>

        <div className="p-3 flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-secondary font-bold text-[12px]">
                  <span className="material-symbols-outlined text-[16px]">{n.icon}</span>
                  <span>{n.title}</span>
                </div>
                <span className="text-[10px] text-on-surface-variant">{n.time}</span>
              </div>
              <p className="text-[12px] text-on-surface leading-snug">{n.body}</p>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectAction(n.type);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded bg-secondary text-on-secondary font-label-sm text-[11px] font-bold hover:opacity-95"
                >
                  {n.actionText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
