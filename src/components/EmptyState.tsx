import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'Tidak ada data ditemukan' }: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  );
}
