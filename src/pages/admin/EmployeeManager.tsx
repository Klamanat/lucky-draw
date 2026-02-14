import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchAllowedEmployees, saveAllowedEmployees } from '../../services/api';
import { LockIcon, ClipboardIcon, FileTextIcon, TrashIcon, PlusIcon, MinusIcon, CheckIcon, XIcon, InboxIcon } from '../../components/icons';

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
        <div className="glass-card rounded-2xl p-10 text-center border border-yellow-500/25">
          <LockIcon className="w-8 h-8 text-red-400 mb-4 mx-auto" />
          <p className="text-white font-bold text-lg mb-6">ไม่มีสิทธิ์เข้าถึง</p>
          <Link to="/" className="px-8 py-3 btn-premium rounded-xl inline-block font-bold">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gold-shimmer">จัดการรหัสพนักงาน</span>
            </h1>
            <div className="divider-gold w-16 mt-2" />
          </div>
          <Link
            to="/admin"
            className="glass-card px-5 py-2.5 text-white/90 rounded-xl hover:bg-white/10 font-medium border border-yellow-500/25 transition-all text-sm"
          >
            กลับ
          </Link>
        </div>

        {/* Notifications */}
        {saving && (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 px-5 py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
            <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" style={{ borderWidth: '2px' }} />
            <span className="font-medium">กำลังบันทึก...</span>
          </div>
        )}
        {saved && !saving && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-5 py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
            <CheckIcon className="w-4 h-4" />
            <span className="font-medium">บันทึกเรียบร้อยแล้ว</span>
          </div>
        )}

        {/* Info Card */}
        <div className="glass-card rounded-xl p-5 border border-yellow-500/25 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
              <ClipboardIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium">
                {loading ? (
                  <span className="text-white/90">กำลังโหลดข้อมูล...</span>
                ) : employees.length === 0 ? (
                  <span className="text-amber-300 font-bold">ยังไม่มีการจำกัด - ทุกคนสามารถเข้าร่วมได้</span>
                ) : (
                  <>มีสิทธิ์เข้าร่วม <span className="font-bold text-white text-lg">{employees.length}</span> รหัส</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Add Single Employee */}
        <div className="glass-card rounded-xl p-5 border border-yellow-500/25 mb-4">
          <label className="block text-white/90 font-medium text-sm mb-2">เพิ่มรหัสพนักงาน</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newEmployeeId}
              onChange={(e) => setNewEmployeeId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="เช่น EMP001"
              className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-yellow-500/25 font-mono text-sm tracking-wider text-white focus:border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
            />
            <button
              onClick={handleAdd}
              disabled={!newEmployeeId.trim() || saving}
              className="px-6 py-3 btn-gold rounded-xl font-bold disabled:opacity-40 transition-all text-sm"
            >
              เพิ่ม
            </button>
          </div>
        </div>

        {/* Bulk Add Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            className="text-yellow-500 text-sm font-medium hover:text-yellow-400 transition-colors flex items-center gap-1.5"
          >
            {showBulkInput ? <><MinusIcon className="w-4 h-4" /> ซ่อน</> : <><PlusIcon className="w-4 h-4" /> เพิ่มหลายรหัสพร้อมกัน</>}
          </button>
        </div>

        {/* Bulk Add Section */}
        {showBulkInput && (
          <div className="glass-card rounded-xl p-5 border border-yellow-500/25 mb-4">
            <label className="block text-white/90 font-medium text-sm mb-2">
              เพิ่มหลายรหัส (คั่นด้วย , หรือขึ้นบรรทัดใหม่)
            </label>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value.toUpperCase())}
              placeholder="EMP006&#10;EMP007&#10;EMP008"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-yellow-500/25 font-mono text-sm tracking-wider text-white resize-none focus:border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
            />
            <button
              onClick={handleBulkAdd}
              disabled={!bulkInput.trim() || saving}
              className="mt-3 px-6 py-2.5 btn-gold rounded-xl font-bold disabled:opacity-40 text-sm"
            >
              เพิ่มทั้งหมด
            </button>
          </div>
        )}

        {/* Employee List */}
        <div className="glass-card rounded-xl p-5 border border-yellow-500/25">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <FileTextIcon className="w-4 h-4 text-white/90" /> รายชื่อรหัสพนักงาน
            </h3>
            {employees.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={saving}
                className="text-red-400 text-xs font-medium hover:text-red-300 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <TrashIcon className="w-3 h-3" /> ล้างทั้งหมด
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <div className="w-10 h-10 border-yellow-500/25 border-t-yellow-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
              <p className="text-white text-sm">กำลังโหลด...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <InboxIcon className="w-10 h-10 text-white/10 mb-3 mx-auto" />
              <p className="text-white/90 text-sm font-medium">ยังไม่มีรายชื่อ</p>
              <p className="text-white/90 text-xs mt-1">(ทุกคนสามารถเข้าร่วมได้)</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {employees.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2.5 border border-yellow-500/25 group hover:border-yellow-500/25 transition-colors"
                  >
                    <span className="font-mono font-medium text-white/90 text-sm tracking-wider">{id}</span>
                    <button
                      onClick={() => handleRemove(id)}
                      disabled={saving}
                      className="text-white/90 hover:text-red-400 disabled:opacity-40 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <XIcon className="w-3.5 h-3.5" />
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
