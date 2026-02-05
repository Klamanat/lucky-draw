/**
 * Lucky Wheel - Google Apps Script Backend
 *
 * วิธีใช้:
 * 1. สร้าง Google Sheet ใหม่
 * 2. สร้าง 4 sheets: prizes, users, spin_history, settings
 * 3. Copy code นี้ไปที่ Extensions > Apps Script
 * 4. เปลี่ยน SPREADSHEET_ID เป็น ID ของ Sheet คุณ
 * 5. Deploy > New deployment > Web app
 * 6. Execute as: Me, Who has access: Anyone
 * 7. Copy URL มาใส่ใน .env ของ React app
 */

// ===== CONFIG =====
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const DEFAULT_SPINS = 3; // จำนวนสิทธิ์หมุนเริ่มต้น

// ===== MAIN HANDLERS =====
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const action = e.parameter.action;
  let result;

  try {
    switch(action) {
      // Public APIs
      case 'getPrizes':
        result = getPrizes();
        break;
      case 'spin':
        result = spin(e.parameter.userId);
        break;
      case 'getHistory':
        result = getHistory(e.parameter.userId);
        break;
      case 'registerUser':
        result = registerUser(JSON.parse(e.postData.contents));
        break;
      case 'loginUser':
        result = loginUser(e.parameter.email);
        break;

      // Admin APIs
      case 'addPrize':
        result = addPrize(JSON.parse(e.postData.contents));
        break;
      case 'updatePrize':
        result = updatePrize(JSON.parse(e.postData.contents));
        break;
      case 'deletePrize':
        result = deletePrize(e.parameter.id);
        break;
      case 'getAllHistory':
        result = getAllHistory();
        break;
      case 'getStats':
        result = getStats();
        break;

      default:
        result = { success: false, error: 'Unknown action' };
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== PRIZE FUNCTIONS =====

function getPrizes() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('prizes');
  const data = sheet.getDataRange().getValues();
  const prizes = [];

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[6] === true) { // has id and is_active
      prizes.push({
        id: row[0].toString(),
        name: row[1],
        description: row[2] || '',
        image_url: row[3] || '',
        probability: parseFloat(row[4]) || 0,
        quantity: parseInt(row[5]) || -1,
        is_active: row[6],
        color: row[7] || '#3b82f6'
      });
    }
  }

  return { success: true, prizes };
}

function addPrize(prizeData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('prizes');
  const lastRow = sheet.getLastRow();
  const newId = lastRow > 0 ? lastRow : 1;

  sheet.appendRow([
    newId.toString(),
    prizeData.name,
    prizeData.description || '',
    prizeData.image_url || '',
    prizeData.probability || 10,
    prizeData.quantity !== undefined ? prizeData.quantity : -1,
    prizeData.is_active !== false,
    prizeData.color || '#3b82f6'
  ]);

  return { success: true, prize: { ...prizeData, id: newId.toString() } };
}

function updatePrize(prizeData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('prizes');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === prizeData.id.toString()) {
      const row = i + 1;
      sheet.getRange(row, 2).setValue(prizeData.name);
      sheet.getRange(row, 3).setValue(prizeData.description || '');
      sheet.getRange(row, 4).setValue(prizeData.image_url || '');
      sheet.getRange(row, 5).setValue(prizeData.probability || 10);
      sheet.getRange(row, 6).setValue(prizeData.quantity !== undefined ? prizeData.quantity : -1);
      sheet.getRange(row, 7).setValue(prizeData.is_active !== false);
      sheet.getRange(row, 8).setValue(prizeData.color || '#3b82f6');
      return { success: true };
    }
  }

  return { success: false, error: 'Prize not found' };
}

function deletePrize(id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('prizes');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  return { success: false, error: 'Prize not found' };
}

// ===== USER FUNCTIONS =====

function registerUser(userData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const data = sheet.getDataRange().getValues();

  // Check if email exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userData.email) {
      return { success: false, error: 'อีเมลนี้ถูกใช้แล้ว' };
    }
  }

  const lastRow = sheet.getLastRow();
  const newId = lastRow > 0 ? lastRow : 1;
  const now = new Date();

  sheet.appendRow([
    newId.toString(),
    userData.email,
    userData.name,
    userData.phone || '',
    DEFAULT_SPINS,
    'user',
    now
  ]);

  return {
    success: true,
    user: {
      id: newId.toString(),
      email: userData.email,
      name: userData.name,
      phone: userData.phone || '',
      spins_remaining: DEFAULT_SPINS,
      role: 'user',
      created_at: now.toISOString()
    }
  };
}

function loginUser(email) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      return {
        success: true,
        user: {
          id: data[i][0].toString(),
          email: data[i][1],
          name: data[i][2],
          phone: data[i][3] || '',
          spins_remaining: parseInt(data[i][4]) || 0,
          role: data[i][5] || 'user',
          created_at: data[i][6] ? new Date(data[i][6]).toISOString() : ''
        }
      };
    }
  }

  return { success: false, error: 'ไม่พบผู้ใช้งาน กรุณาลงทะเบียนก่อน' };
}

// ===== SPIN FUNCTIONS =====

function spin(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const userSheet = ss.getSheetByName('users');
  const userData = userSheet.getDataRange().getValues();

  // 1. ตรวจสอบสิทธิ์ผู้ใช้
  let userRow = -1;
  let userName = '';
  let userEmail = '';
  let spinsRemaining = 0;

  for (let i = 1; i < userData.length; i++) {
    if (userData[i][0].toString() === userId.toString()) {
      userRow = i + 1;
      userEmail = userData[i][1];
      userName = userData[i][2];
      spinsRemaining = parseInt(userData[i][4]) || 0;
      break;
    }
  }

  if (userRow === -1) {
    return { success: false, error: 'ไม่พบผู้ใช้งาน' };
  }

  if (spinsRemaining <= 0) {
    return { success: false, error: 'ไม่มีสิทธิ์หมุนแล้ว' };
  }

  // 2. ดึงรางวัล active ที่ยังมีจำนวน
  const prizes = getPrizes().prizes.filter(p => p.quantity !== 0);

  if (prizes.length === 0) {
    return { success: false, error: 'ไม่มีรางวัลในระบบ' };
  }

  // 3. Weighted Random Selection
  const totalWeight = prizes.reduce((sum, p) => sum + p.probability, 0);
  let random = Math.random() * totalWeight;
  let selectedPrize = prizes[0];

  for (const prize of prizes) {
    random -= prize.probability;
    if (random <= 0) {
      selectedPrize = prize;
      break;
    }
  }

  // 4. ลดจำนวนรางวัล (ถ้าไม่ใช่ -1)
  if (selectedPrize.quantity > 0) {
    const prizeSheet = ss.getSheetByName('prizes');
    const prizeData = prizeSheet.getDataRange().getValues();
    for (let i = 1; i < prizeData.length; i++) {
      if (prizeData[i][0].toString() === selectedPrize.id.toString()) {
        const newQty = parseInt(prizeData[i][5]) - 1;
        prizeSheet.getRange(i + 1, 6).setValue(newQty);
        break;
      }
    }
  }

  // 5. ลดสิทธิ์หมุน
  userSheet.getRange(userRow, 5).setValue(spinsRemaining - 1);

  // 6. บันทึกประวัติ
  const historySheet = ss.getSheetByName('spin_history');
  const lastHistoryRow = historySheet.getLastRow();
  const newHistoryId = lastHistoryRow > 0 ? lastHistoryRow : 1;

  historySheet.appendRow([
    newHistoryId.toString(),
    userId,
    userName,
    userEmail,
    selectedPrize.id,
    selectedPrize.name,
    new Date()
  ]);

  return {
    success: true,
    prize: selectedPrize,
    spinsRemaining: spinsRemaining - 1
  };
}

function getHistory(userId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('spin_history');
  const data = sheet.getDataRange().getValues();
  const history = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][1].toString() === userId.toString()) {
      history.push({
        id: data[i][0].toString(),
        user_id: data[i][1].toString(),
        user_name: data[i][2],
        user_email: data[i][3],
        prize_id: data[i][4].toString(),
        prize_name: data[i][5],
        spun_at: data[i][6] ? new Date(data[i][6]).toISOString() : ''
      });
    }
  }

  // เรียงจากใหม่ไปเก่า
  history.reverse();

  return { success: true, history };
}

function getAllHistory() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('spin_history');
  const data = sheet.getDataRange().getValues();
  const history = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      history.push({
        id: data[i][0].toString(),
        user_id: data[i][1].toString(),
        user_name: data[i][2],
        user_email: data[i][3],
        prize_id: data[i][4].toString(),
        prize_name: data[i][5],
        spun_at: data[i][6] ? new Date(data[i][6]).toISOString() : ''
      });
    }
  }

  // เรียงจากใหม่ไปเก่า
  history.reverse();

  return { success: true, history };
}

function getStats() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // นับผู้ใช้
  const userSheet = ss.getSheetByName('users');
  const userCount = Math.max(0, userSheet.getLastRow() - 1);

  // นับการหมุน
  const historySheet = ss.getSheetByName('spin_history');
  const historyData = historySheet.getDataRange().getValues();
  const spinCount = Math.max(0, historyData.length - 1);

  // สถิติรางวัล
  const prizeStats = {};
  for (let i = 1; i < historyData.length; i++) {
    const prizeName = historyData[i][5];
    if (prizeName) {
      prizeStats[prizeName] = (prizeStats[prizeName] || 0) + 1;
    }
  }

  return {
    success: true,
    stats: {
      totalSpins: spinCount,
      totalUsers: userCount,
      prizeStats: prizeStats
    }
  };
}

// ===== SETUP HELPER =====

/**
 * รันฟังก์ชันนี้ครั้งแรกเพื่อสร้าง headers ใน sheets
 */
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Prizes sheet
  let prizeSheet = ss.getSheetByName('prizes');
  if (!prizeSheet) {
    prizeSheet = ss.insertSheet('prizes');
  }
  prizeSheet.getRange(1, 1, 1, 8).setValues([['id', 'name', 'description', 'image_url', 'probability', 'quantity', 'is_active', 'color']]);

  // Users sheet
  let userSheet = ss.getSheetByName('users');
  if (!userSheet) {
    userSheet = ss.insertSheet('users');
  }
  userSheet.getRange(1, 1, 1, 7).setValues([['id', 'email', 'name', 'phone', 'spins_remaining', 'role', 'created_at']]);

  // Spin history sheet
  let historySheet = ss.getSheetByName('spin_history');
  if (!historySheet) {
    historySheet = ss.insertSheet('spin_history');
  }
  historySheet.getRange(1, 1, 1, 7).setValues([['id', 'user_id', 'user_name', 'user_email', 'prize_id', 'prize_name', 'spun_at']]);

  // Settings sheet
  let settingsSheet = ss.getSheetByName('settings');
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet('settings');
  }
  settingsSheet.getRange(1, 1, 1, 2).setValues([['key', 'value']]);

  // Add sample prizes
  prizeSheet.getRange(2, 1, 5, 8).setValues([
    ['1', 'iPhone 15', 'สมาร์ทโฟนรุ่นใหม่', '', 5, 1, true, '#ef4444'],
    ['2', 'AirPods Pro', 'หูฟังไร้สาย', '', 10, 3, true, '#3b82f6'],
    ['3', 'Gift Voucher 500', 'บัตรกำนัล 500 บาท', '', 25, 10, true, '#22c55e'],
    ['4', 'ส่วนลด 10%', 'คูปองส่วนลด', '', 30, -1, true, '#f97316'],
    ['5', 'เสียใจด้วย', 'ลองใหม่นะ', '', 30, -1, true, '#6b7280']
  ]);

  // Add admin user
  userSheet.getRange(2, 1, 1, 7).setValues([
    ['1', 'admin@example.com', 'Admin', '', 999, 'admin', new Date()]
  ]);

  Logger.log('Setup completed!');
}
