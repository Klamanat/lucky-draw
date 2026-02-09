import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchAllowedEmployees, saveAllowedEmployees } from '../../services/api';
import { UsersIcon, LockIcon, ClipboardIcon, DocumentIcon, TrashIcon, PlusIcon, MinusIcon, CheckCircleIcon, CloseIcon, InboxIcon } from '../../components/icons';

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
      if (success) showSavedMessage();
    }
  };

  const handleRemove = async (id: string) => {
    const updated = employees.filter(e => e !== id);
    setEmployees(updated);
    setSaving(true);
    const success = await saveAllowedEmployees(updated);
    setSaving(false);
    if (success) showSavedMessage();
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
      if (success) showSavedMessage();
    }
  };

  const handleClearAll = async () => {
    if (confirm('ต้องการล้างรายชื่อทั้งหมด?')) {
      setEmployees([]);
      setSaving(true);
      const success = await saveAllowedEmployees([]);
      setSaving(false);
      if (success) showSavedMessage();
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
          <div className="absolute inset-0 rounded-2xl bg-red-500/30 blur-xl" />
          <div className="relative glass-card rounded-2xl p-10 text-center border-2 border-yellow-500/30">
            <span className="text-4xl mb-4 block">🔒</span>
            <p className="text-red-700 font-bold text-lg mb-6">ไม่มีสิทธิ์เข้าถึง</p>
            <Link to="/" className="px-8 py-3 btn-premium rounded-xl inline-block font-bold">
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
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">👥</span>
              <h1 className="text-3xl font-bold">
                <span className="gold-shimmer">จัดการรหัสพนักงาน</span>
              </h1>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-transparent mt-2 ml-12" />
          </div>
          <Link
            to="/admin"
            className="glass-card px-6 py-3 text-red-700 rounded-xl hover:bg-white/80 font-bold border-2 border-yellow-500/30 transition-all"
          >
            กลับ
          </Link>
        </div>

        {/* Notifications */}
        {saving && (
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 text-yellow-700 px-6 py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg">
            <div className="w-5 h-5 border-2 border-yellow-400 border-t-yellow-700 rounded-full animate-spin" />
            <span className="font-bold">กำลังบันทึก...</span>
          </div>
        )}
        {saved && !saving && (
          <div className="mb-6 bg-green-50 border-2 border-green-400 text-green-700 px-6 py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg">
            <span className="text-xl">✅</span>
            <span className="font-bold">บันทึกเรียบร้อยแล้ว</span>
          </div>
        )}

        {/* Info Card */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-2xl bg-yellow-500/20 blur-xl" />
          <div className="relative glass-card rounded-2xl p-6 border-2 border-yellow-500/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg border-2 border-yellow-400">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <p className="text-red-700 font-medium">
                  {loading ? (
                    <span className="text-gray-400">กำลังโหลดข้อมูล...</span>
                  ) : employees.length === 0 ? (
                    <span className="text-yellow-600 font-bold">ยังไม่มีการจำกัด - ทุกคนสามารถเข้าร่วมได้</span>
                  ) : (
                    <>มีสิทธิ์เข้าร่วม <span className="font-bold text-red-800 text-xl">{employees.length}</span> รหัส</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Single Employee */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-2xl bg-yellow-500/10 blur-xl" />
          <div className="relative glass-card rounded-2xl p-6 border-2 border-yellow-500/20">
            <label className="block text-red-700 font-bold mb-3">เพิ่มรหัสพนักงาน</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={newEmployeeId}
                onChange={(e) => setNewEmployeeId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="เช่น EMP001"
                className="flex-1 px-5 py-4 rounded-xl bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-yellow-400 font-mono text-lg tracking-wider text-red-800 focus:border-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-400/30"
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
            className="text-yellow-300 font-bold hover:text-yellow-200 transition-colors flex items-center gap-2"
          >
            {showBulkInput ? '➖ ซ่อน' : '➕ เพิ่มหลายรหัสพร้อมกัน'}
          </button>
        </div>

        {/* Bulk Add Section */}
        {showBulkInput && (
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-2xl bg-yellow-500/10 blur-xl" />
            <div className="relative glass-card rounded-2xl p-6 border-2 border-yellow-500/20">
              <label className="block text-red-700 font-bold mb-3">
                เพิ่มหลายรหัส (คั่นด้วย , หรือขึ้นบรรทัดใหม่)
              </label>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value.toUpperCase())}
                placeholder="EMP006&#10;EMP007&#10;EMP008"
                rows={5}
                className="w-full px-5 py-4 rounded-xl bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-yellow-400 font-mono tracking-wider text-red-800 resize-none focus:border-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-400/30"
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
          <div className="absolute inset-0 rounded-2xl bg-yellow-500/10 blur-xl" />
          <div className="relative glass-card rounded-2xl p-6 border-2 border-yellow-500/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-red-800 font-bold text-lg flex items-center gap-2">
                <span>📝</span> รายชื่อรหัสพนักงาน
              </h3>
              {employees.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={saving}
                  className="text-red-500 font-bold hover:text-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  🗑️ ล้างทั้งหมด
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-12 gap-4">
                <div className="w-10 h-10 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin" />
                <p className="text-red-700 font-medium">กำลังโหลด...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">📭</span>
                <p className="text-gray-400 font-medium">ยังไม่มีรายชื่อ</p>
                <p className="text-gray-400 text-sm mt-1">(ทุกคนสามารถเข้าร่วมได้)</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {employees.map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between bg-gradient-to-r from-red-50 via-yellow-50 to-red-50 rounded-xl px-4 py-3 border-2 border-yellow-300 group hover:border-yellow-500 transition-colors"
                    >
                      <span className="font-mono font-bold text-red-700 tracking-wider">{id}</span>
                      <button
                        onClick={() => handleRemove(id)}
                        disabled={saving}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ❌
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
