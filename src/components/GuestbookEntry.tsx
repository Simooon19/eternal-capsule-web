interface GuestbookEntryProps {
  id: string;
  author: string;
  message: string;
  date: string;
  isApproved: boolean;
  onApprove?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function GuestbookEntry({
  id,
  author,
  message,
  date,
  isApproved,
  onApprove,
  onDelete,
}: GuestbookEntryProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-display text-lg font-medium text-granite-900 dark:text-white">
            {author}
          </h4>
          <p className="text-sm text-granite-900/60 dark:text-white/60">
            {new Date(date).toLocaleDateString()}
          </p>
        </div>
        {!isApproved && onApprove && (
          <div className="flex space-x-2">
            <button
              onClick={() => onApprove(id)}
              className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              Approve
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      <p className="mt-4 text-granite-900/80 dark:text-white/80">{message}</p>
      {!isApproved && (
        <div className="mt-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Pending Approval
          </span>
        </div>
      )}
    </div>
  );
} 