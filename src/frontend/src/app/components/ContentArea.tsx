import { PageRouter } from './PageRouter';

interface ContentAreaProps {
  activeSection: string;
}

export function ContentArea({ activeSection }: ContentAreaProps) {
  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-auto">
      <PageRouter activeSection={activeSection} />
    </div>
  );
}