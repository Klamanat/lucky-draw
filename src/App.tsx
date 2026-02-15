import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Dashboard } from './pages/admin/Dashboard';
import { PrizeManager } from './pages/admin/PrizeManager';
import { SpinLogs } from './pages/admin/SpinLogs';
import { EmployeeManager } from './pages/admin/EmployeeManager';
import { EventSettings } from './pages/admin/EventSettings';
import { Participants } from './pages/admin/Participants';

function App() {
  return (
    <BrowserRouter>
      {/* Modern overlays on bg image */}
      <div className="bg-overlay" />
      <div className="bg-grid" />
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />

      <div className="app-container">
        {/* Top accent line */}
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
          <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          <div className="h-px mt-px bg-gradient-to-r from-transparent via-yellow-500/25 to-transparent" />
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/prizes" element={<PrizeManager />} />
          <Route path="/admin/logs" element={<SpinLogs />} />
          <Route path="/admin/employees" element={<EmployeeManager />} />
          <Route path="/admin/settings" element={<EventSettings />} />
          <Route path="/admin/participants" element={<Participants />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
