import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Prize } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { LockIcon, GiftIcon, PlusIcon, ChartIcon, PackageIcon, EditIcon, TrashIcon, SaveIcon, HeartIcon } from '../../components/icons';

const DEFAULT_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#db2777'];

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
        <div className="glass-card rounded-2xl p-10 text-center border border-white/10">
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gold-shimmer">จัดการรางวัล</span>
            </h1>
            <div className="divider-gold w-16 mt-2" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingPrize({ name: '', probability: 10, quantity: -1, color: DEFAULT_COLORS[prizes.length % DEFAULT_COLORS.length], is_active: true, is_donatable: true })}
              className="px-5 py-2.5 btn-gold rounded-xl font-bold flex items-center gap-2 text-sm"
            >
              <PlusIcon className="w-4 h-4" /> เพิ่มรางวัล
            </button>
            <Link
              to="/admin"
              className="glass-card px-5 py-2.5 text-white/60 rounded-xl hover:bg-white/10 font-medium border border-white/10 transition-all text-sm"
            >
              กลับ
            </Link>
          </div>
        </div>

        {/* Prize List */}
        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
              <p className="text-white/40 text-sm font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {prizes.map((prize, index) => (
              <div key={prize.id} className="glass-card rounded-xl p-5 flex items-center gap-5 border border-white/5 hover:border-yellow-500/20 transition-all group">
                {/* Color badge */}
                <div
                  className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${prize.color} 0%, ${adjustColor(prize.color, -30)} 100%)` }}
                >
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>

                {/* Prize info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-bold text-sm">{prize.name}</p>
                    {prize.is_donatable && (
                      <span className="text-xs font-medium text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20 flex items-center gap-1">
                        <HeartIcon className="w-3 h-3" /> บริจาคได้
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs">
                    <span className="flex items-center gap-1 text-white/40">
                      <ChartIcon className="w-3 h-3" /> <span className="font-medium text-white/60">{prize.probability}%</span>
                    </span>
                    <span className="flex items-center gap-1 text-white/40">
                      <PackageIcon className="w-3 h-3" /> <span className="font-medium text-white/60">{prize.quantity === -1 ? 'ไม่จำกัด' : prize.quantity}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingPrize(prize)}
                    className="p-2.5 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-colors border border-white/5"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prize.id)}
                    className="p-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/10"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {prizes.length === 0 && (
              <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
                <GiftIcon className="w-10 h-10 text-yellow-500 mb-4 mx-auto" />
                <p className="text-white font-bold">ยังไม่มีรางวัล</p>
                <p className="text-white/40 text-sm mt-1">กดปุ่ม "เพิ่มรางวัล" เพื่อเริ่มต้น</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingPrize && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-8 w-full max-w-lg border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <GiftIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingPrize.id ? 'แก้ไขรางวัล' : 'เพิ่มรางวัลใหม่'}
                  </h2>
                  <p className="text-white/40 text-xs">กรอกรายละเอียดรางวัล</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">ชื่อรางวัล</label>
                  <input
                    type="text"
                    value={editingPrize.name || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, name: e.target.value })}
                    placeholder="เช่น อั่งเปา 888"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">คำอธิบาย</label>
                  <input
                    type="text"
                    value={editingPrize.description || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, description: e.target.value })}
                    placeholder="รายละเอียดเพิ่มเติม"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">URL รูปภาพ</label>
                  <input
                    type="url"
                    value={editingPrize.image_url || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1.5">ความน่าจะเป็น (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editingPrize.probability || 0}
                      onChange={(e) => setEditingPrize({ ...editingPrize, probability: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1.5">จำนวน</label>
                    <input
                      type="number"
                      min="-1"
                      value={editingPrize.quantity ?? -1}
                      onChange={(e) => setEditingPrize({ ...editingPrize, quantity: parseInt(e.target.value) })}
                      placeholder="-1 = ไม่จำกัด"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2.5">สีช่องบนวงล้อ</label>
                  <div className="flex gap-2.5">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditingPrize({ ...editingPrize, color })}
                        className={`w-10 h-10 rounded-xl transition-all ${editingPrize.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' : 'opacity-60 hover:opacity-100'}`}
                        style={{ background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%)` }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setEditingPrize({ ...editingPrize, is_donatable: !editingPrize.is_donatable })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${editingPrize.is_donatable ? 'bg-pink-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${editingPrize.is_donatable ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-sm font-medium text-white/60 flex items-center gap-1.5">
                      <HeartIcon className="w-4 h-4 text-pink-400" /> อนุญาตบริจาค
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving || !editingPrize.name}
                  className="flex-1 py-3.5 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl font-bold disabled:opacity-40 shadow-lg shadow-red-500/20"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      กำลังบันทึก...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><SaveIcon className="w-4 h-4" /> บันทึก</span>
                  )}
                </button>
                <button
                  onClick={() => setEditingPrize(null)}
                  className="flex-1 py-3.5 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 font-medium transition-colors border border-white/10"
                >
                  ยกเลิก
                </button>
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
