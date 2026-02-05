import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Prize } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const DEFAULT_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

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
        <p className="text-white mb-4">ไม่มีสิทธิ์เข้าถึง</p>
        <Link to="/" className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30">
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">จัดการรางวัล</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingPrize({ name: '', probability: 10, quantity: -1, color: DEFAULT_COLORS[prizes.length % DEFAULT_COLORS.length], is_active: true })}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              + เพิ่มรางวัล
            </button>
            <Link to="/admin" className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30">
              กลับ
            </Link>
          </div>
        </div>

        {/* Prize List */}
        {loading ? (
          <div className="text-white/60 text-center">กำลังโหลด...</div>
        ) : (
          <div className="space-y-4">
            {prizes.map((prize) => (
              <div
                key={prize.id}
                className="bg-white/10 rounded-xl p-4 flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: prize.color }}
                />
                <div className="flex-1">
                  <p className="text-white font-medium">{prize.name}</p>
                  <p className="text-white/60 text-sm">
                    ความน่าจะเป็น: {prize.probability}% | จำนวน: {prize.quantity === -1 ? 'ไม่จำกัด' : prize.quantity}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPrize(prize)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(prize.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}

            {prizes.length === 0 && (
              <div className="text-white/60 text-center py-8">
                ยังไม่มีรางวัล กดปุ่ม "เพิ่มรางวัล" เพื่อเริ่มต้น
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingPrize && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingPrize.id ? 'แก้ไขรางวัล' : 'เพิ่มรางวัล'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ชื่อรางวัล</label>
                  <input
                    type="text"
                    value={editingPrize.name || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
                  <input
                    type="text"
                    value={editingPrize.description || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">URL รูปภาพ</label>
                  <input
                    type="url"
                    value={editingPrize.image_url || ''}
                    onChange={(e) => setEditingPrize({ ...editingPrize, image_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ความน่าจะเป็น (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editingPrize.probability || 0}
                      onChange={(e) => setEditingPrize({ ...editingPrize, probability: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">จำนวน (-1 = ไม่จำกัด)</label>
                    <input
                      type="number"
                      min="-1"
                      value={editingPrize.quantity ?? -1}
                      onChange={(e) => setEditingPrize({ ...editingPrize, quantity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">สี</label>
                  <div className="flex gap-2">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditingPrize({ ...editingPrize, color })}
                        className={`w-8 h-8 rounded-full ${editingPrize.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button
                  onClick={() => setEditingPrize(null)}
                  className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
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
