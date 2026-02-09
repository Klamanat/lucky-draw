import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchAllowedEmployees, saveAllowedEmployees } from '../../services/api';

export function EmployeeManager() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState<string[]>([]);
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllowedEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleAdd = async () => {
    const id = newEmployeeId.trim().toUpperCase();
    if (id && !employees.includes(id)) {
      const updated = [...employees, id];
      setEmployees(updated);
      setNewEmployeeId('');
      setSaving(true);
      const success = await saveAllowedEmployees(updated);
      setSaving(false);
      if (success) {
        showSavedMessage();
      }
    }
  };

  const handleRemove = async (id: string) => {
    const updated = employees.filter(e => e !== id);
    setEmployees(updated);
    setSaving(true);
    const success = await saveAllowedEmployees(updated);
    setSaving(false);
    if (success) {
      showSavedMessage();
    }
  };

  const handleBulkAdd = async () => {
    const ids = bulkInput
      .split(/[\n,;]+/)
      .map(id => id.trim().toUpperCase())
      .filter(id => id && !employees.includes(id));

    if (ids.length > 0) {
      const updated = [...employees, ...ids];
      setEmployees(updated);
      setBulkInput('');
      setShowBulkInput(false);
      setSaving(true);
      const success = await saveAllowedEmployees(updated);
      setSaving(false);
      if (success) {
        showSavedMessage();
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('ต้องการล้างรายชื่อทั้งหมด? (ทุกคนจะสามารถเข้าร่วมได้)')) {
      setEmployees([]);
      setSaving(true);
      const success = await saveAllowedEmployees([]);
      setSaving(false);
      if (success) {
        showSavedMessage();
      }
    }
  };

  const showSavedMessage = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-xl" />
          <div className="relative glass-card rounded-2xl p-10 text-center border border-red-500/20">
            <p className="text-gray-700 font-semibold text-lg mb-6">ไม่มีสิทธิ์เข้าถึง</p>
            <Link to="/" className="px-8 py-3 btn-premium rounded-xl inline-block font-semibold">
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gold-shimmer">จัดการรหัสพนักงาน</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-transparent mt-3" />
          </div>
          <Link
            to="/admin"
            className="glass-card px-6 py-3 text-gray-600 rounded-xl hover:bg-white/80 font-semibold border border-gray-200 hover:border-amber-500/30 transition-all"
          >
            กลับ
          </Link>
        </div>

        {/* Notifications */}
        {saving && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-xl flex items-center justify-center gap-3 shadow-sm">
            <div className="w-5 h-5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
            <span className="font-medium">กำลังบันทึก...</span>
          </div>
        )}
        {saved && !saving && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center justify-center gap-3 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">บันทึกเรียบร้อยแล้ว</span>
          </div>
        )}

        {/* Info Card */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-xl" />
          <div className="relative glass-card rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-600">
                  {loading ? (
                    <span className="text-gray-400">กำลังโหลดข้อมูล...</span>
                  ) : employees.length === 0 ? (
                    <span className="text-amber-600 font-semibold">ยังไม่มีการจำกัด - ทุกคนสามารถเข้าร่วมได้</span>
                  ) : (
                    <>มีสิทธิ์เข้าร่วม <span className="font-bold text-amber-700 text-lg">{employees.length}</span> รหัส</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Single Employee */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/5 blur-xl" />
          <div className="relative glass-card rounded-2xl p-6 border border-amber-500/10">
            <label className="block text-gray-700 font-semibold mb-3">เพิ่มรหัสพนักงาน</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={newEmployeeId}
                onChange={(e) => setNewEmployeeId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="เช่น EMP001"
                className="flex-1 px-5 py-4 rounded-xl input-premium font-mono text-lg tracking-wider"
              />
              <button
                onClick={handleAdd}
                disabled={!newEmployeeId.trim() || saving}
                className="px-8 py-4 btn-gold rounded-xl font-bold disabled:opacity-50 transition-all"
              >
                เพิ่ม
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Add Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            className="text-amber-600 font-medium hover:text-amber-700 transition-colors flex items-center gap-2"
          >
            {showBulkInput ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                ซ่อน
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มหลายรหัสพร้อมกัน
              </>
            )}
          </button>
        </div>

        {/* Bulk Add Section */}
        {showBulkInput && (
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-2xl bg-amber-500/5 blur-xl" />
            <div className="relative glass-card rounded-2xl p-6 border border-amber-500/10">
              <label className="block text-gray-700 font-semibold mb-3">
                เพิ่มหลายรหัส (คั่นด้วย , หรือขึ้นบรรทัดใหม่)
              </label>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value.toUpperCase())}
                placeholder="EMP006&#10;EMP007&#10;EMP008"
                rows={5}
                className="w-full px-5 py-4 rounded-xl input-premium font-mono tracking-wider resize-none"
              />
              <button
                onClick={handleBulkAdd}
                disabled={!bulkInput.trim() || saving}
                className="mt-4 px-8 py-3 btn-gold rounded-xl font-bold disabled:opacity-50"
              >
                เพิ่มทั้งหมด
              </button>
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/5 blur-xl" />
          <div className="relative glass-card rounded-2xl p-6 border border-amber-500/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-800 font-bold text-lg">รายชื่อรหัสพนักงาน</h3>
              {employees.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={saving}
                  className="text-red-500 font-medium hover:text-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  ล้างทั้งหมด
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-12 gap-4">
                <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-medium">กำลังโหลด...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 font-medium">ยังไม่มีรายชื่อ</p>
                <p className="text-gray-400 text-sm mt-1">(ทุกคนสามารถเข้าร่วมได้)</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {employees.map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl px-4 py-3 border border-amber-200 group hover:border-amber-400 transition-colors"
                    >
                      <span className="font-mono font-medium text-gray-700 tracking-wider">{id}</span>
                      <button
                        onClick={() => handleRemove(id)}
                        disabled={saving}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
}
