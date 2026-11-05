import React from "react";
import { LucideIcon, FolderKey } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionButton?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Data Found",
  description = "There is no information available to show right now.",
  icon: Icon = FolderKey,
  actionButton,
}) => {
  return (
    <div className="flex min-h-75 w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-800 p-8 text-center my-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800/60 mb-4">
        <Icon className="h-7 w-7 text-gray-500 dark:text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {actionButton && <div className="mt-5">{actionButton}</div>}
    </div>
  );
};
