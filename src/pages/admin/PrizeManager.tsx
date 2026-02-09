import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Prize } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
// import { LockIcon, GiftIcon, PlusIcon, ChartIcon, BoxIcon, EditIcon, TrashIcon, SaveIcon } from '../../components/icons';

const DEFAULT_COLORS = ['#DC143C', '#FFD700', '#8B0000', '#FFA500', '#B22222', '#D4AF37'];

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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎁</span>
              <h1 className="text-3xl font-bold">
                <span className="gold-shimmer">จัดการรางวัล</span>
              </h1>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-transparent mt-2 ml-12" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEditingPrize({ name: '', probability: 10, quantity: -1, color: DEFAULT_COLORS[prizes.length % DEFAULT_COLORS.length], is_active: true })}
              className="px-6 py-3 btn-gold rounded-xl font-bold flex items-center gap-2"
            >
              ➕ เพิ่มรางวัล
            </button>
            <Link
              to="/admin"
              className="glass-card px-6 py-3 text-red-700 rounded-xl hover:bg-white/80 font-bold border-2 border-yellow-500/30 transition-all"
            >
              กลับ
            </Link>
          </div>
        </div>

        {/* Prize List */}
        {loading ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-yellow-500/20 blur-xl" />
            <div className="relative glass-card rounded-2xl p-12 text-center border-2 border-yellow-500/30">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                <p className="text-red-700 font-medium">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {prizes.map((prize, index) => (
              <div key={prize.id} className="group relative">
                <div className="absolute inset-0 rounded-2xl bg-yellow-500/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative glass-card rounded-2xl p-6 flex items-center gap-6 border-2 border-yellow-500/20 group-hover:border-yellow-500/50 transition-all">
                  {/* Color badge */}
                  <div
                    className="w-16 h-16 rounded-xl flex-shrink-0 shadow-lg flex items-center justify-center border-2 border-yellow-400"
                    style={{ background: `linear-gradient(135deg, ${prize.color} 0%, ${adjustColor(prize.color, -30)} 100%)` }}
                  >
                    <span className="text-white font-bold text-xl drop-shadow-lg">{index + 1}</span>
                  </div>

                  {/* Prize info */}
                  <div className="flex-1">
                    <p className="text-red-800 font-bold text-lg">{prize.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        📊 ความน่าจะเป็น: <span className="font-bold text-red-700">{prize.probability}%</span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        📦 จำนวน: <span className="font-bold text-red-700">{prize.quantity === -1 ? 'ไม่จำกัด' : prize.quantity}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingPrize(prize)}
                      className="p-3 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors border border-yellow-300"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(prize.id)}
                      className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors border border-red-300"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {prizes.length === 0 && (
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-yellow-500/20 blur-xl" />
                <div className="relative glass-card rounded-2xl p-12 text-center border-2 border-yellow-500/30">
                  <span className="text-5xl mb-4 block">🎁</span>
                  <p className="text-red-700 font-bold">ยังไม่มีรางวัล</p>
                  <p className="text-gray-500 text-sm mt-1">กดปุ่ม "เพิ่มรางวัล" เพื่อเริ่มต้น</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingPrize && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-yellow-500/30 blur-xl" />
              <div className="relative bg-gradient-to-b from-red-600 via-red-700 to-red-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl border-4 border-yellow-400 overflow-hidden">
                {/* Chinese pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, #FFD700 0, #FFD700 1px, transparent 0, transparent 50%)`,
                    backgroundSize: '15px 15px',
                  }} />
                </div>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-yellow-300">
                    <span className="text-3xl">🎁</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-yellow-300">
                      {editingPrize.id ? 'แก้ไขรางวัล' : 'เพิ่มรางวัลใหม่'}
                    </h2>
                    <p className="text-red-200 text-sm">กรอกรายละเอียดรางวัล</p>
                  </div>
                </div>

                <div className="space-y-5 relative z-10">
                  <div>
                    <label className="block text-sm font-bold text-yellow-300 mb-2">ชื่อรางวัล</label>
                    <input
                      type="text"
                      value={editingPrize.name || ''}
                      onChange={(e) => setEditingPrize({ ...editingPrize, name: e.target.value })}
                      placeholder="เช่น อั่งเปา 888"
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-yellow-400 text-red-800 font-medium focus:border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-yellow-300 mb-2">คำอธิบาย</label>
                    <input
                      type="text"
                      value={editingPrize.description || ''}
                      onChange={(e) => setEditingPrize({ ...editingPrize, description: e.target.value })}
                      placeholder="รายละเอียดเพิ่มเติม"
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-yellow-400 text-red-800 font-medium focus:border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-yellow-300 mb-2">URL รูปภาพ</label>
                    <input
                      type="url"
                      value={editingPrize.image_url || ''}
                      onChange={(e) => setEditingPrize({ ...editingPrize, image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-yellow-400 text-red-800 font-medium focus:border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-yellow-300 mb-2">ความน่าจะเป็น (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={editingPrize.probability || 0}
                        onChange={(e) => setEditingPrize({ ...editingPrize, probability: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-yellow-400 text-red-800 font-medium focus:border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-yellow-300 mb-2">จำนวน</label>
                      <input
                        type="number"
                        min="-1"
                        value={editingPrize.quantity ?? -1}
                        onChange={(e) => setEditingPrize({ ...editingPrize, quantity: parseInt(e.target.value) })}
                        placeholder="-1 = ไม่จำกัด"
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-yellow-400 text-red-800 font-medium focus:border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-yellow-300 mb-3">สีช่องบนวงล้อ</label>
                    <div className="flex gap-3">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditingPrize({ ...editingPrize, color })}
                          className={`w-12 h-12 rounded-xl transition-transform hover:scale-110 border-2 ${editingPrize.color === color ? 'ring-4 ring-yellow-300 ring-offset-2 ring-offset-red-700 scale-110 border-yellow-400' : 'border-white/30'
                            }`}
                          style={{ background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%)` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 relative z-10">
                  <button
                    onClick={handleSave}
                    disabled={saving || !editingPrize.name}
                    className="flex-1 py-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-red-700 rounded-xl font-bold disabled:opacity-50 border-2 border-yellow-500"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-red-700/30 border-t-red-700 rounded-full animate-spin" />
                        กำลังบันทึก...
                      </span>
                    ) : (
                      '💾 บันทึก'
                    )}
                  </button>
                  <button
                    onClick={() => setEditingPrize(null)}
                    className="flex-1 py-4 bg-white/20 text-yellow-300 rounded-xl hover:bg-white/30 font-bold transition-colors border-2 border-yellow-400/50"
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
