import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Dashboard } from './pages/admin/Dashboard';
import { PrizeManager } from './pages/admin/PrizeManager';
import { SpinLogs } from './pages/admin/SpinLogs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/prizes" element={<PrizeManager />} />
        <Route path="/admin/logs" element={<SpinLogs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
