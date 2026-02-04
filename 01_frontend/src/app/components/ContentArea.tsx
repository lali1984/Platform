import { Outlet } from 'react-router-dom';

export function ContentArea() {
  return (
    <div className="h-full overflow-y-auto">
      <Outlet />
    </div>
  );
}