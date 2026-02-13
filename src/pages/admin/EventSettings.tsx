import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { ClockIcon, LockIcon, SaveIcon, CheckIcon } from '../../components/icons';
import type { EventSettings as EventSettingsType } from '../../types';

export function EventSettings() {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<EventSettingsType>({
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '20:00',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getEventSettings();
      if (result.success) {
        setSettings(result.settings);
      }
    } catch (error) {
      console.error('Failed to load event settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await api.saveEventSettings(settings);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save event settings:', error);
    } finally {
      setSaving(false);
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

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/20";

  return (
    <div className="min-h-screen p-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gold-shimmer">ตั้งค่ากิจกรรม</span>
            </h1>
            <div className="divider-gold w-16 mt-2" />
          </div>
          <Link
            to="/admin"
            className="glass-card px-5 py-2.5 text-white/60 rounded-xl hover:bg-white/10 transition-all font-medium border border-white/10 text-sm"
          >
            กลับ
          </Link>
        </div>

        {/* Form */}
        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
              <p className="text-white/40 text-sm font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <div className="space-y-6">
              {/* Date Range */}
              <div>
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-yellow-500" />
                  ช่วงวันที่กิจกรรม
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/40 text-xs font-medium mb-1.5">วันที่เริ่ม</label>
                    <input
                      type="date"
                      value={settings.startDate}
                      onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs font-medium mb-1.5">วันที่สิ้นสุด</label>
                    <input
                      type="date"
                      value={settings.endDate}
                      onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Time Range */}
              <div>
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-yellow-500" />
                  ช่วงเวลาที่เล่นได้
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/40 text-xs font-medium mb-1.5">เวลาเริ่ม</label>
                    <input
                      type="time"
                      value={settings.startTime}
                      onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs font-medium mb-1.5">เวลาสิ้นสุด</label>
                    <input
                      type="time"
                      value={settings.endTime}
                      onChange={(e) => setSettings({ ...settings, endTime: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3.5 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all disabled:opacity-40 active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center gap-2">
                    {saved ? (
                      <><CheckIcon className="w-4 h-4" /> บันทึกแล้ว</>
                    ) : saving ? (
                      'กำลังบันทึก...'
                    ) : (
                      <><SaveIcon className="w-4 h-4" /> บันทึก</>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
