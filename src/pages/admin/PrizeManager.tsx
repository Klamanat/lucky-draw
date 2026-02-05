import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Prize } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const DEFAULT_COLORS = ['#D4AF37', '#1a1a1a', '#B8860B', '#2a2a2a', '#8B6914', '#3a3a3a'];

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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-amber-100">จัดการรางวัล</h1>
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent mt-2" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingPrize({ name: '', probability: 10, quantity: -1, color: DEFAULT_COLORS[prizes.length % DEFAULT_COLORS.length], is_active: true })}
              className="px-4 py-2 btn-gold rounded-lg font-medium shadow-md"
            >
              + เพิ่มรางวัล
            </button>
            <Link to="/admin" className="glass-card px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 font-medium shadow-md border border-gray-200">
              กลับ
            </Link>
          </div>
        </div>

        {/* Prize List */}
        {loading ? (
          <div className="glass-card rounded-lg p-8 text-center shadow-lg border border-amber-600/10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
              <p className="text-gray-500">กำลังโหลด...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {prizes.map((prize) => (
              <div
                key={prize.id}
                className="glass-card rounded-lg p-4 flex items-center gap-4 shadow-md border border-amber-600/10"
              >
                <div
                  className="w-12 h-12 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: prize.color }}
                />
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">{prize.name}</p>
                  <p className="text-gray-500 text-sm">
                    ความน่าจะเป็น: {prize.probability}% | จำนวน: {prize.quantity === -1 ? 'ไม่จำกัด' : prize.quantity}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPrize(prize)}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium text-sm"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(prize.id)}
                    className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium text-sm"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}

            {prizes.length === 0 && (
              <div className="glass-card rounded-lg p-8 text-center shadow-lg border border-amber-600/10">
                <p className="text-gray-500">ยังไม่มีรางวัล กดปุ่ม "เพิ่มรางวัล" เพื่อเริ่มต้น</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingPrize && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {editingPrize.id ? 'แก้ไขรางวัล' : 'เพิ่มรางวัล'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อรางวัล</label>
                  <input
                    type="text"
                    value={editingPrize.name || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                  <input
                    type="text"
                    value={editingPrize.description || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL รูปภาพ</label>
                  <input
                    type="url"
                    value={editingPrize.image_url || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ความน่าจะเป็น (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editingPrize.probability || 0}
                      onChange={(e) => setEditingPrize({ ...editingPrize, probability: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">จำนวน (-1 = ไม่จำกัด)</label>
                    <input
                      type="number"
                      min="-1"
                      value={editingPrize.quantity ?? -1}
                      onChange={(e) => setEditingPrize({ ...editingPrize, quantity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">สี</label>
                  <div className="flex gap-2">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditingPrize({ ...editingPrize, color })}
                        className={`w-10 h-10 rounded-lg ${editingPrize.color === color ? 'ring-2 ring-offset-2 ring-amber-600' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 btn-premium rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button
                  onClick={() => setEditingPrize(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
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
