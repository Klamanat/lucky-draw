import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Dashboard } from './pages/admin/Dashboard';
import { PrizeManager } from './pages/admin/PrizeManager';
import { SpinLogs } from './pages/admin/SpinLogs';
import { EmployeeManager } from './pages/admin/EmployeeManager';
import { EventSettings } from './pages/admin/EventSettings';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Top accent line */}
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-60" />
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/prizes" element={<PrizeManager />} />
          <Route path="/admin/logs" element={<SpinLogs />} />
          <Route path="/admin/employees" element={<EmployeeManager />} />
          <Route path="/admin/settings" element={<EventSettings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
