import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SpinHistory } from '../../types';
import { api, invalidateCache } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { LockIcon, GiftIcon, ClockIcon, InboxIcon, HeartIcon, CheckIcon } from '../../components/icons';

export function SpinLogs() {
  const { isAdmin } = useAuth();
  const [history, setHistory] = useState<SpinHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SpinHistory | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const result = await api.getAllHistory();
      if (result.success) {
        setHistory(result.history);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTransferred = async (historyId: string) => {
    if (!confirm('ยืนยันว่าโอนเงินรางวัลแล้ว?')) return;
    setMarking(true);
    try {
      const result = await api.markTransferred(historyId);
      if (result.success) {
        invalidateCache('getAllHistory');
        await loadHistory();
        setSelectedItem(null);
      } else {
        alert(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setMarking(false);
    }
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gold-shimmer">ประวัติการหมุนทั้งหมด</span>
            </h1>
            <div className="divider-gold w-16 mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 text-xs font-medium bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/25">
              {history.length} รายการ
            </span>
            <Link
              to="/admin"
              className="glass-card px-5 py-2.5 text-white/90 rounded-xl hover:bg-white/10 font-medium border border-yellow-500/25 transition-all text-sm"
            >
              กลับ
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-yellow-500/25">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 border-yellow-500/25 border-t-yellow-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
              <p className="text-white text-sm font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden border border-yellow-500/25">
            {/* Table Header */}
            <div className="bg-black/30 px-5 py-3.5 border-b border-yellow-500/25">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2 text-white/90 text-xs font-medium tracking-wide">รหัสพนักงาน</div>
                <div className="col-span-2 text-white/90 text-xs font-medium tracking-wide">ชื่อ</div>
                <div className="col-span-3 text-white/90 text-xs font-medium tracking-wide">รางวัล</div>
                <div className="col-span-2 text-white/90 text-xs font-medium tracking-wide">สถานะ</div>
                <div className="col-span-3 text-white/90 text-xs font-medium tracking-wide">เวลา</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/10">
              {history.map((item) => {
                const hasPayment = !!getPaymentMethod(item);
                return (
                  <div
                    key={item.id}
                    className={`px-5 py-3.5 grid grid-cols-12 gap-4 items-center transition-colors ${hasPayment ? 'cursor-pointer hover:bg-black/20' : 'hover:bg-black/15'}`}
                    onClick={() => hasPayment ? setSelectedItem(item) : null}
                  >
                    <div className="col-span-2">
                      <span className="font-mono text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/25">
                        {item.employee_id}
                      </span>
                    </div>
                    <div className="col-span-2 text-white/90 text-sm font-medium">{item.user_name}</div>
                    <div className="col-span-3">
                      <span className="inline-flex items-center gap-1.5 text-white text-sm font-medium bg-black/30 px-2.5 py-1 rounded-lg border border-yellow-500/25">
                        <GiftIcon className="w-3 h-3 text-yellow-500" />
                        {item.prize_name}
                      </span>
                    </div>
                    <div className="col-span-2">
                      {renderStatus(item)}
                    </div>
                    <div className="col-span-3 text-white/90 text-xs flex items-center gap-1.5">
                      <ClockIcon className="w-3 h-3" />
                      {formatDate(item.spun_at)}
                    </div>
                  </div>
                );
              })}

              {history.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <InboxIcon className="w-10 h-10 text-white/10 mb-3 mx-auto" />
                  <p className="text-white/90 font-medium text-sm">ยังไม่มีประวัติการหมุน</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Popup */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden text-white"
            style={{
              background: 'linear-gradient(160deg, #8b1a2b 0%, #5c0a15 40%, #1a0508 100%)',
              border: '1px solid rgba(255, 215, 0, 0.25)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(200, 30, 50, 0.1) 100%)',
                  border: '1px solid rgba(255, 215, 0, 0.15)',
                }}>
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold">รายละเอียดการรับรางวัล</h2>
                  <p className="text-white/60 text-xs font-medium">#{selectedItem.id}</p>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <span className="text-white/60 text-sm font-medium">พนักงาน</span>
                  <span className="text-white font-bold text-sm">{selectedItem.user_name} ({selectedItem.employee_id})</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <span className="text-white/60 text-sm font-medium">รางวัล</span>
                  <span className="text-yellow-300 font-bold text-sm">{selectedItem.prize_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <span className="text-white/60 text-sm font-medium">เวลา</span>
                  <span className="text-white/90 font-medium text-sm">{formatDate(selectedItem.spun_at)}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <span className="text-white/60 text-sm font-medium">สถานะ</span>
                  <span>{renderStatus(selectedItem)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="p-4 rounded-xl mb-5" style={{
                background: 'rgba(255, 215, 0, 0.06)',
                border: '1px solid rgba(255, 215, 0, 0.12)',
              }}>
                <p className="text-yellow-400/90 text-xs font-extrabold mb-3">ข้อมูลการรับเงิน</p>
                {renderPaymentDetail(selectedItem)}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedItem.status !== 'transferred' && selectedItem.status !== 'donated' && (
                  <button
                    onClick={() => handleMarkTransferred(selectedItem.id)}
                    disabled={marking}
                    className="flex-1 py-3 font-extrabold text-sm rounded-xl active:scale-[0.98] transition-all disabled:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#fff',
                      border: '1px solid rgba(5, 150, 105, 0.4)',
                      boxShadow: '0 4px 20px rgba(5, 150, 105, 0.2)',
                    }}
                  >
                    {marking ? 'กำลังบันทึก...' : 'โอนแล้ว'}
                  </button>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className={`${selectedItem.status === 'transferred' || selectedItem.status === 'donated' ? 'w-full' : 'flex-1'} py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors`}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(255, 215, 0, 0.1)',
                  }}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderStatus(item: SpinHistory) {
  if (item.status === 'transferred') {
    return (
      <span className="inline-flex items-center gap-1 text-blue-300 text-xs font-medium bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/10">
        <CheckIcon className="w-3 h-3" /> โอนแล้ว
      </span>
    );
  }
  if (item.status === 'donated') {
    return (
      <div>
        <span className="inline-flex items-center gap-1 text-pink-300 text-xs font-medium bg-pink-500/10 px-2 py-1 rounded-lg border border-pink-500/10">
          <HeartIcon className="w-3 h-3" /> บริจาค
        </span>
        {item.donation_amount ? (
          <p className="text-pink-400/70 text-xs mt-0.5">{item.donation_amount.toLocaleString()} บาท</p>
        ) : null}
      </div>
    );
  }

  const hasPayment = !!getPaymentMethod(item);
  return (
    <div>
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border ${
        hasPayment
          ? 'text-yellow-300 bg-yellow-500/10 border-yellow-500/15'
          : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/10'
      }`}>
        <CheckIcon className="w-3 h-3" /> {hasPayment ? 'รอโอน' : 'รับแล้ว'}
      </span>
    </div>
  );
}

function renderPaymentDetail(item: SpinHistory) {
  const method = getPaymentMethod(item);
  if (!method) {
    return <p className="text-white/50 text-sm">ไม่มีข้อมูล payment</p>;
  }

  if (method === 'promptpay') {
    const number = item.payment_method
      ? item.payment_detail1 || '-'
      : item.payment_info?.promptpayNumber || '-';
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-white/60 text-sm">ช่องทาง</span>
          <span className="text-white font-bold text-sm">PromptPay</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60 text-sm">หมายเลข</span>
          <span className="text-yellow-300 font-bold text-sm font-mono">{number}</span>
        </div>
      </div>
    );
  }

  if (method === 'bank') {
    const bankName = item.payment_method
      ? item.payment_detail1 || '-'
      : item.payment_info?.bankName || '-';
    const accountNumber = item.payment_method
      ? item.payment_detail2 || '-'
      : item.payment_info?.accountNumber || '-';
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-white/60 text-sm">ช่องทาง</span>
          <span className="text-white font-bold text-sm">บัญชีธนาคาร</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60 text-sm">ธนาคาร</span>
          <span className="text-white font-bold text-sm">{bankName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60 text-sm">เลขบัญชี</span>
          <span className="text-yellow-300 font-bold text-sm font-mono">{accountNumber}</span>
        </div>
      </div>
    );
  }

  return <p className="text-white/50 text-sm">ไม่มีข้อมูล</p>;
}

function getPaymentMethod(item: SpinHistory): string | null {
  if (item.payment_method) return item.payment_method;
  if (item.payment_info?.method) return item.payment_info.method;
  return null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
