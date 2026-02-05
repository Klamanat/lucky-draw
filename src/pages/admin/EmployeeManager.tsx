import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllowedEmployees, setAllowedEmployees } from '../../services/api';

export function EmployeeManager() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState<string[]>([]);
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setEmployees(getAllowedEmployees());
  }, []);

  const handleAdd = () => {
    const id = newEmployeeId.trim().toUpperCase();
    if (id && !employees.includes(id)) {
      const updated = [...employees, id];
      setEmployees(updated);
      setAllowedEmployees(updated);
      setNewEmployeeId('');
      showSavedMessage();
    }
  };

  const handleRemove = (id: string) => {
    const updated = employees.filter(e => e !== id);
    setEmployees(updated);
    setAllowedEmployees(updated);
    showSavedMessage();
  };

  const handleBulkAdd = () => {
    const ids = bulkInput
      .split(/[\n,;]+/)
      .map(id => id.trim().toUpperCase())
      .filter(id => id && !employees.includes(id));

    if (ids.length > 0) {
      const updated = [...employees, ...ids];
      setEmployees(updated);
      setAllowedEmployees(updated);
      setBulkInput('');
      setShowBulkInput(false);
      showSavedMessage();
    }
  };

  const handleClearAll = () => {
    if (confirm('ต้องการล้างรายชื่อทั้งหมด? (ทุกคนจะสามารถเข้าร่วมได้)')) {
      setEmployees([]);
      setAllowedEmployees([]);
      showSavedMessage();
    }
  };

  const showSavedMessage = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card rounded-lg p-6 text-center shadow-xl border border-amber-600/10">
          <p className="text-gray-600 mb-4">ไม่มีสิทธิ์เข้าถึง</p>
          <Link to="/" className="px-6 py-3 btn-premium rounded-lg inline-block">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-amber-100">จัดการรหัสพนักงาน</h1>
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent mt-2" />
          </div>
          <Link
            to="/admin"
            className="glass-card px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 font-medium shadow-md border border-gray-200"
          >
            กลับ
          </Link>
        </div>

        {/* Saved notification */}
        {saved && (
          <div className="mb-4 bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg text-center text-sm">
            บันทึกแล้ว
          </div>
        )}

        {/* Info */}
        <div className="glass-card rounded-lg p-4 mb-6 border border-amber-600/10">
          <p className="text-gray-600 text-sm">
            {employees.length === 0 ? (
              <span className="text-amber-600 font-medium">ยังไม่มีการจำกัด - ทุกคนสามารถเข้าร่วมได้</span>
            ) : (
              <>มีสิทธิ์เข้าร่วม <span className="font-bold text-amber-700">{employees.length}</span> รหัส</>
            )}
          </p>
        </div>

        {/* Add single */}
        <div className="glass-card rounded-lg p-4 mb-4 border border-amber-600/10">
          <label className="block text-gray-700 text-sm font-medium mb-2">เพิ่มรหัสพนักงาน</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newEmployeeId}
              onChange={(e) => setNewEmployeeId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="เช่น EMP001"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 font-mono"
            />
            <button
              onClick={handleAdd}
              disabled={!newEmployeeId.trim()}
              className="px-6 py-2 btn-gold rounded-lg font-medium disabled:opacity-50"
            >
              เพิ่ม
            </button>
          </div>
        </div>

        {/* Bulk add toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            className="text-amber-600 text-sm hover:underline"
          >
            {showBulkInput ? '- ซ่อน' : '+ เพิ่มหลายรหัสพร้อมกัน'}
          </button>
        </div>

        {/* Bulk add */}
        {showBulkInput && (
          <div className="glass-card rounded-lg p-4 mb-4 border border-amber-600/10">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              เพิ่มหลายรหัส (คั่นด้วย , หรือขึ้นบรรทัดใหม่)
            </label>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value.toUpperCase())}
              placeholder="EMP006&#10;EMP007&#10;EMP008"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 font-mono text-sm"
            />
            <button
              onClick={handleBulkAdd}
              disabled={!bulkInput.trim()}
              className="mt-2 px-6 py-2 btn-gold rounded-lg font-medium disabled:opacity-50"
            >
              เพิ่มทั้งหมด
            </button>
          </div>
        )}

        {/* Employee list */}
        <div className="glass-card rounded-lg p-4 border border-amber-600/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-700 font-medium">รายชื่อรหัสพนักงาน</h3>
            {employees.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-red-500 text-sm hover:underline"
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>

          {employees.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm">
              ยังไม่มีรายชื่อ (ทุกคนสามารถเข้าร่วมได้)
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {employees.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 border border-amber-200"
                  >
                    <span className="font-mono text-sm text-gray-700">{id}</span>
                    <button
                      onClick={() => handleRemove(id)}
                      className="text-red-400 hover:text-red-600 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
