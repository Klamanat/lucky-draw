import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Dashboard } from './pages/admin/Dashboard';
import { PrizeManager } from './pages/admin/PrizeManager';
import { SpinLogs } from './pages/admin/SpinLogs';
import { EmployeeManager } from './pages/admin/EmployeeManager';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Premium decorative line at top */}
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
          <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/prizes" element={<PrizeManager />} />
          <Route path="/admin/logs" element={<SpinLogs />} />
          <Route path="/admin/employees" element={<EmployeeManager />} />
        </Routes>

        {/* Premium decorative line at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
          <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
