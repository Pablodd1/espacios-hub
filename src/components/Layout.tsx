import { Outlet } from 'react-router';
import AppShell from './AppShell';

/**
 * Layout route — renders the shared AppShell around nested pages.
 * Pattern B (nested routes): this renders <Outlet/>, so App.tsx MUST
 * nest all page routes under `<Route element={<Layout/>}>`.
 */
export default function Layout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
