import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Prize } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const DEFAULT_COLORS = ['#C41E3A', '#D4AF37', '#8B0000', '#B8860B', '#5C0000', '#8B6914'];

export function PrizeManager() {
  const { isAdmin } = useAuth();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrize, setEditingPrize] = useState<Partial<Prize> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      const result = await api.getPrizes();
      if (result.success) {
        setPrizes(result.prizes);
      }
    } catch (error) {
      console.error('Failed to load prizes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPrize) return;

    setSaving(true);
    try {
      if (editingPrize.id) {
        await api.updatePrize(editingPrize as Prize);
      } else {
        await api.addPrize(editingPrize as Omit<Prize, 'id'>);
      }
      await loadPrizes();
      setEditingPrize(null);
    } catch (error) {
      console.error('Failed to save prize:', error);
      alert('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบรางวัลนี้?')) return;

    try {
      await api.deletePrize(id);
      await loadPrizes();
    } catch (error) {
      console.error('Failed to delete prize:', error);
      alert('ลบไม่สำเร็จ');
    }
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gold-shimmer">จัดการรางวัล</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-transparent mt-3" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEditingPrize({ name: '', probability: 10, quantity: -1, color: DEFAULT_COLORS[prizes.length % DEFAULT_COLORS.length], is_active: true })}
              className="px-6 py-3 btn-gold rounded-xl font-bold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มรางวัล
            </button>
            <Link
              to="/admin"
              className="glass-card px-6 py-3 text-gray-600 rounded-xl hover:bg-white/80 font-semibold border border-gray-200 hover:border-amber-500/30 transition-all"
            >
              กลับ
            </Link>
          </div>
        </div>

        {/* Prize List */}
        {loading ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-xl" />
            <div className="relative glass-card rounded-2xl p-12 text-center border border-amber-500/10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                </div>
                <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {prizes.map((prize, index) => (
              <div
                key={prize.id}
                className="group relative"
              >
                <div className="absolute inset-0 rounded-2xl bg-amber-500/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative glass-card rounded-2xl p-6 flex items-center gap-6 border border-amber-500/10 group-hover:border-amber-500/30 transition-all">
                  {/* Color badge */}
                  <div
                    className="w-16 h-16 rounded-xl flex-shrink-0 shadow-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${prize.color} 0%, ${adjustColor(prize.color, -30)} 100%)` }}
                  >
                    <span className="text-white font-bold text-xl">{index + 1}</span>
                  </div>

                  {/* Prize info */}
                  <div className="flex-1">
                    <p className="text-gray-800 font-bold text-lg">{prize.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        ความน่าจะเป็น: <span className="font-semibold text-amber-700">{prize.probability}%</span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        จำนวน: <span className="font-semibold text-amber-700">{prize.quantity === -1 ? 'ไม่จำกัด' : prize.quantity}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingPrize(prize)}
                      className="p-3 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(prize.id)}
                      className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {prizes.length === 0 && (
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-xl" />
                <div className="relative glass-card rounded-2xl p-12 text-center border border-amber-500/10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">ยังไม่มีรางวัล</p>
                  <p className="text-gray-400 text-sm mt-1">กดปุ่ม "เพิ่มรางวัล" เพื่อเริ่มต้น</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingPrize && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-xl" />
              <div className="relative bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-amber-500/20">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {editingPrize.id ? 'แก้ไขรางวัล' : 'เพิ่มรางวัลใหม่'}
                    </h2>
                    <p className="text-gray-500 text-sm">กรอกรายละเอียดรางวัล</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อรางวัล</label>
                    <input
                      type="text"
                      value={editingPrize.name || ''}
                      onChange={(e) => setEditingPrize({ ...editingPrize, name: e.target.value })}
                      placeholder="เช่น ทองคำ 1 สลึง"
                      className="w-full px-4 py-3 rounded-xl input-premium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
                    <input
                      type="text"
                      value={editingPrize.description || ''}
                      onChange={(e) => setEditingPrize({ ...editingPrize, description: e.target.value })}
                      placeholder="รายละเอียดเพิ่มเติม"
                      className="w-full px-4 py-3 rounded-xl input-premium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">URL รูปภาพ</label>
                    <input
                      type="url"
                      value={editingPrize.image_url || ''}
                      onChange={(e) => setEditingPrize({ ...editingPrize, image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-xl input-premium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ความน่าจะเป็น (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={editingPrize.probability || 0}
                        onChange={(e) => setEditingPrize({ ...editingPrize, probability: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl input-premium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">จำนวน</label>
                      <input
                        type="number"
                        min="-1"
                        value={editingPrize.quantity ?? -1}
                        onChange={(e) => setEditingPrize({ ...editingPrize, quantity: parseInt(e.target.value) })}
                        placeholder="-1 = ไม่จำกัด"
                        className="w-full px-4 py-3 rounded-xl input-premium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">สีช่องบนวงล้อ</label>
                    <div className="flex gap-3">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditingPrize({ ...editingPrize, color })}
                          className={`w-12 h-12 rounded-xl transition-transform hover:scale-110 ${
                            editingPrize.color === color ? 'ring-4 ring-amber-400 ring-offset-2 scale-110' : ''
                          }`}
                          style={{ background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%)` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleSave}
                    disabled={saving || !editingPrize.name}
                    className="flex-1 py-4 btn-premium rounded-xl font-bold disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        กำลังบันทึก...
                      </span>
                    ) : (
                      'บันทึก'
                    )}
                  </button>
                  <button
                    onClick={() => setEditingPrize(null)}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
