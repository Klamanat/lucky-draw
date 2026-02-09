/**
 * Lucky Wheel - Google Apps Script Backend
 *
 * วิธีใช้:
 * 1. สร้าง Google Sheet ใหม่
 * 2. Copy code นี้ไปที่ Extensions > Apps Script
 * 3. เปลี่ยน SPREADSHEET_ID เป็น ID ของ Sheet คุณ
 * 4. รันฟังก์ชัน setupSheets() เพื่อสร้าง sheets
 * 5. Deploy > New deployment > Web app
 * 6. Execute as: Me, Who has access: Anyone
 * 7. Copy URL มาใส่ใน .env ของ React app
 */

// ===== CONFIG =====
const SPREADSHEET_ID = '11gr5XWp9TiTUEAffJNyjPuG6DZpYcbFPt34pcN7-cws';
const DEFAULT_SPINS = 1; // จำนวนสิทธิ์หมุนเริ่มต้น
const ADMIN_PASSWORD = 'admin1234'; // รหัสผ่าน Admin

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
      case 'enterEmployee':
        result = enterEmployee(JSON.parse(e.postData.contents));
        break;
      case 'loginAdmin':
        result = loginAdmin(e.parameter.password);
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
      case 'donatePrize':
        result = donatePrize(e.parameter.historyId, parseFloat(e.parameter.amount) || 0);
        break;
      case 'getStats':
        result = getStats();
        break;

      // Employee whitelist APIs
      case 'getAllowedEmployees':
        result = getAllowedEmployees();
        break;
      case 'setAllowedEmployees':
        result = setAllowedEmployees(JSON.parse(e.postData.contents));
        break;
      case 'addAllowedEmployee':
        result = addAllowedEmployee(e.parameter.employeeId);
        break;
      case 'removeAllowedEmployee':
        result = removeAllowedEmployee(e.parameter.employeeId);
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

// ===== EMPLOYEE FUNCTIONS =====

function enterEmployee(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // ตรวจสอบว่ารหัสพนักงานมีสิทธิ์หรือไม่
  if (!isEmployeeAllowed(data.employeeId)) {
    return { success: false, error: 'รหัสพนักงานนี้ไม่มีสิทธิ์ร่วมกิจกรรม' };
  }

  const userSheet = ss.getSheetByName('users');
  const userData = userSheet.getDataRange().getValues();

  // ตรวจสอบว่าเคยลงทะเบียนแล้วหรือยัง
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][1] && userData[i][1].toString().toLowerCase() === data.employeeId.toLowerCase()) {
      return {
        success: true,
        user: {
          id: userData[i][0].toString(),
          employee_id: userData[i][1],
          name: userData[i][2],
          spins_remaining: parseInt(userData[i][4]) || 0,
          role: userData[i][5] || 'user',
          created_at: userData[i][6] ? new Date(userData[i][6]).toISOString() : ''
        }
      };
    }
  }

  // สร้างผู้ใช้ใหม่
  const lastRow = userSheet.getLastRow();
  const newId = 'emp_' + (lastRow > 0 ? lastRow : 1);
  const now = new Date();

  userSheet.appendRow([
    newId,
    data.employeeId.toUpperCase(),
    data.name,
    '', // phone (not used)
    DEFAULT_SPINS,
    'user',
    now
  ]);

  return {
    success: true,
    user: {
      id: newId,
      employee_id: data.employeeId.toUpperCase(),
      name: data.name,
      spins_remaining: DEFAULT_SPINS,
      role: 'user',
      created_at: now.toISOString()
    }
  };
}

function loginAdmin(password) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };
  }

  return {
    success: true,
    user: {
      id: 'admin',
      employee_id: 'ADMIN',
      name: 'ผู้ดูแลระบบ',
      spins_remaining: 999,
      role: 'admin',
      created_at: new Date().toISOString()
    }
  };
}

// ===== ALLOWED EMPLOYEES FUNCTIONS =====

function isEmployeeAllowed(employeeId) {
  const employees = getAllowedEmployees().employees;

  // ถ้าไม่มีรายชื่อ = ทุกคนเข้าร่วมได้
  if (employees.length === 0) {
    return true;
  }

  // ตรวจสอบว่าอยู่ในลิสต์หรือไม่ (case-insensitive)
  return employees.some(id => id.toLowerCase() === employeeId.toLowerCase());
}

function getAllowedEmployees() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('allowed_employees');

  if (!sheet) {
    // สร้าง sheet ถ้ายังไม่มี
    sheet = ss.insertSheet('allowed_employees');
    sheet.getRange(1, 1).setValue('employee_id');
    return { success: true, employees: [] };
  }

  const data = sheet.getDataRange().getValues();
  const employees = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      employees.push(data[i][0].toString().toUpperCase());
    }
  }

  return { success: true, employees };
}

function setAllowedEmployees(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('allowed_employees');

  if (!sheet) {
    sheet = ss.insertSheet('allowed_employees');
  }

  // ล้างข้อมูลเดิม
  sheet.clear();

  // เพิ่ม header
  sheet.getRange(1, 1).setValue('employee_id');

  // เพิ่มข้อมูลใหม่
  const employees = data.employees || [];
  if (employees.length > 0) {
    const values = employees.map(id => [id.toUpperCase()]);
    sheet.getRange(2, 1, values.length, 1).setValues(values);
  }

  return { success: true, employees: employees.map(id => id.toUpperCase()) };
}

function addAllowedEmployee(employeeId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('allowed_employees');

  if (!sheet) {
    sheet = ss.insertSheet('allowed_employees');
    sheet.getRange(1, 1).setValue('employee_id');
  }

  const id = employeeId.toUpperCase();

  // ตรวจสอบว่ามีอยู่แล้วหรือไม่
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().toUpperCase() === id) {
      return { success: true, message: 'Already exists' };
    }
  }

  // เพิ่มใหม่
  sheet.appendRow([id]);

  return { success: true };
}

function removeAllowedEmployee(employeeId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('allowed_employees');

  if (!sheet) {
    return { success: false, error: 'Sheet not found' };
  }

  const id = employeeId.toUpperCase();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().toUpperCase() === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  return { success: false, error: 'Not found' };
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
        color: row[7] || '#3b82f6',
        is_donatable: row[8] !== false
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
    prizeData.color || '#3b82f6',
    prizeData.is_donatable !== false
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
      sheet.getRange(row, 9).setValue(prizeData.is_donatable !== false);
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

// ===== SPIN FUNCTIONS =====

function spin(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const userSheet = ss.getSheetByName('users');
  const userData = userSheet.getDataRange().getValues();

  // 1. ตรวจสอบสิทธิ์ผู้ใช้
  let userRow = -1;
  let userName = '';
  let employeeId = '';
  let spinsRemaining = 0;

  for (let i = 1; i < userData.length; i++) {
    if (userData[i][0].toString() === userId.toString()) {
      userRow = i + 1;
      employeeId = userData[i][1];
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
    employeeId,
    selectedPrize.id,
    selectedPrize.name,
    new Date(),
    'claimed'
  ]);

  return {
    success: true,
    prize: selectedPrize,
    spinsRemaining: spinsRemaining - 1,
    historyId: newHistoryId.toString()
  };
}

function donatePrize(historyId, amount) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('spin_history');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === historyId.toString()) {
      sheet.getRange(i + 1, 8).setValue('donated');
      sheet.getRange(i + 1, 9).setValue(amount || 0);
      return { success: true };
    }
  }

  return { success: false, error: 'ไม่พบรายการ' };
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
        employee_id: data[i][3],
        prize_id: data[i][4].toString(),
        prize_name: data[i][5],
        spun_at: data[i][6] ? new Date(data[i][6]).toISOString() : '',
        status: data[i][7] || 'claimed',
        donation_amount: parseFloat(data[i][8]) || 0
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
        employee_id: data[i][3],
        prize_id: data[i][4].toString(),
        prize_name: data[i][5],
        spun_at: data[i][6] ? new Date(data[i][6]).toISOString() : '',
        status: data[i][7] || 'claimed',
        donation_amount: parseFloat(data[i][8]) || 0
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

  // สถิติรางวัล + บริจาค
  const prizeStats = {};
  var totalDonations = 0;
  var totalDonationAmount = 0;
  for (let i = 1; i < historyData.length; i++) {
    const prizeName = historyData[i][5];
    if (prizeName) {
      prizeStats[prizeName] = (prizeStats[prizeName] || 0) + 1;
    }
    if (historyData[i][7] === 'donated') {
      totalDonations++;
      totalDonationAmount += parseFloat(historyData[i][8]) || 0;
    }
  }

  return {
    success: true,
    stats: {
      totalSpins: spinCount,
      totalUsers: userCount,
      totalDonations: totalDonations,
      totalDonationAmount: totalDonationAmount,
      prizeStats: prizeStats
    }
  };
}

// ===== SETUP HELPER =====

/**
 * รันฟังก์ชันนี้ครั้งแรกเพื่อสร้าง sheets
 */
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Prizes sheet
  let prizeSheet = ss.getSheetByName('prizes');
  if (!prizeSheet) {
    prizeSheet = ss.insertSheet('prizes');
  }
  prizeSheet.getRange(1, 1, 1, 9).setValues([['id', 'name', 'description', 'image_url', 'probability', 'quantity', 'is_active', 'color', 'is_donatable']]);

  // Users sheet
  let userSheet = ss.getSheetByName('users');
  if (!userSheet) {
    userSheet = ss.insertSheet('users');
  }
  userSheet.getRange(1, 1, 1, 7).setValues([['id', 'employee_id', 'name', 'phone', 'spins_remaining', 'role', 'created_at']]);

  // Spin history sheet
  let historySheet = ss.getSheetByName('spin_history');
  if (!historySheet) {
    historySheet = ss.insertSheet('spin_history');
  }
  historySheet.getRange(1, 1, 1, 9).setValues([['id', 'user_id', 'user_name', 'employee_id', 'prize_id', 'prize_name', 'spun_at', 'status', 'donation_amount']]);

  // Allowed employees sheet
  let allowedSheet = ss.getSheetByName('allowed_employees');
  if (!allowedSheet) {
    allowedSheet = ss.insertSheet('allowed_employees');
  }
  allowedSheet.getRange(1, 1).setValue('employee_id');

  // Settings sheet
  let settingsSheet = ss.getSheetByName('settings');
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet('settings');
  }
  settingsSheet.getRange(1, 1, 1, 2).setValues([['key', 'value']]);

  // Add sample prizes
  prizeSheet.getRange(2, 1, 6, 9).setValues([
    ['1', 'อั่งเปา 888', 'อั่งเปามงคล', '', 5, 1, true, '#c41e3a', true],
    ['2', 'ทองคำ 1 สลึง', 'ทองคำแท้', '', 5, 2, true, '#ffd700', true],
    ['3', 'อั่งเปา 168', 'เลขมงคล', '', 15, 10, true, '#8b0000', true],
    ['4', 'ส่วนลด 20%', 'คูปองส่วนลด', '', 25, -1, true, '#daa520', false],
    ['5', 'ส้มมงคล', 'ส้มโชคดี', '', 25, -1, true, '#b22222', false],
    ['6', 'ลองใหม่นะ', 'โชคดีครั้งหน้า', '', 25, -1, true, '#cd853f', false]
  ]);

  // Add sample allowed employees
  allowedSheet.getRange(2, 1, 5, 1).setValues([
    ['EMP001'],
    ['EMP002'],
    ['EMP003'],
    ['EMP004'],
    ['EMP005']
  ]);

  Logger.log('Setup completed!');
}
