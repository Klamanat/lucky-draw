/**
 * Lucky Wheel - Google Apps Script Backend (Optimized v2)
 *
 * วิธีใช้:
 * 1. สร้าง Google Sheet ใหม่
 * 2. Copy code นี้ไปที่ Extensions > Apps Script
 * 3. เปลี่ยน SPREADSHEET_ID เป็น ID ของ Sheet คุณ
 * 4. รันฟังก์ชัน setupSheets() เพื่อสร้าง sheets
 * 5. Deploy > New deployment > Web app
 * 6. Execute as: Me, Who has access: Anyone
 * 7. Copy URL มาใส่ใน .env ของ React app
 *
 * Optimizations v2:
 * - CacheService ทุก GET endpoint (prizes, history, stats, employees)
 * - Cache TTL 300s สำหรับ prizes/employees, 120s สำหรับ history/stats
 * - enterEmployee ใช้ cached employees
 * - LockService: spin() ใช้ lock ป้องกัน race condition
 * - Batch operations: ใช้ setValues() แทน setValue() หลายครั้ง
 * - Single spreadsheet open: spin() เปิด spreadsheet ครั้งเดียว
 */

// ===== CONFIG =====
var SPREADSHEET_ID = '11gr5XWp9TiTUEAffJNyjPuG6DZpYcbFPt34pcN7-cws';
var DEFAULT_SPINS = 1;
var ADMIN_PASSWORD = 'admin1234';

// Cache keys & TTL
var CACHE_KEY_PRIZES = 'prizes_v2';
var CACHE_KEY_EMPLOYEES = 'employees_v2';
var CACHE_KEY_ALL_HISTORY = 'all_history_v2';
var CACHE_KEY_STATS = 'stats_v2';
var CACHE_KEY_EVENT_SETTINGS = 'event_settings_v2';
var CACHE_TTL_LONG = 300;   // 5 นาที — prizes, employees (เปลี่ยนไม่บ่อย)
var CACHE_TTL_MED = 120;    // 2 นาที — history, stats

// ===== CACHE HELPERS =====

function getCache(key) {
  var cached = CacheService.getScriptCache().get(key);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) { /* corrupted */ }
  }
  return null;
}

function setCache(key, data, ttl) {
  try {
    CacheService.getScriptCache().put(key, JSON.stringify(data), ttl);
  } catch (e) {
    // cache too large or error, skip
  }
}

function removeCache(keys) {
  try {
    CacheService.getScriptCache().removeAll(keys);
  } catch (e) { /* ignore */ }
}

function historyKey(userId) {
  return 'hist_' + userId;
}

// ===== MAIN HANDLERS =====
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var action = e.parameter.action;
  var result;

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

      // Event Settings APIs
      case 'getEventSettings':
        result = getEventSettings();
        break;
      case 'saveEventSettings':
        result = saveEventSettings(JSON.parse(e.postData.contents));
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
  // ตรวจสอบสิทธิ์จาก cache ก่อน (ไม่ต้องเปิด spreadsheet)
  var allowedResult = getAllowedEmployees();
  var employees = allowedResult.employees;

  if (employees.length > 0) {
    var isAllowed = employees.some(function(id) {
      return id.toLowerCase() === data.employeeId.toLowerCase();
    });
    if (!isAllowed) {
      return { success: false, error: 'รหัสพนักงานนี้ไม่มีสิทธิ์ร่วมกิจกรรม' };
    }
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var userSheet = ss.getSheetByName('users');
  var userData = userSheet.getDataRange().getValues();

  // ตรวจสอบว่าเคยลงทะเบียนแล้วหรือยัง
  for (var i = 1; i < userData.length; i++) {
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
  var lastRow = userSheet.getLastRow();
  var newId = 'emp_' + (lastRow > 0 ? lastRow : 1);
  var now = new Date();

  userSheet.appendRow([
    newId,
    data.employeeId.toUpperCase(),
    data.name,
    '',
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

function getAllowedEmployees() {
  var cached = getCache(CACHE_KEY_EMPLOYEES);
  if (cached) {
    return { success: true, employees: cached };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('allowed_employees');

  if (!sheet) {
    sheet = ss.insertSheet('allowed_employees');
    sheet.getRange(1, 1).setValue('employee_id');
    setCache(CACHE_KEY_EMPLOYEES, [], CACHE_TTL_LONG);
    return { success: true, employees: [] };
  }

  var data = sheet.getDataRange().getValues();
  var employees = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      employees.push(data[i][0].toString().toUpperCase());
    }
  }

  setCache(CACHE_KEY_EMPLOYEES, employees, CACHE_TTL_LONG);
  return { success: true, employees: employees };
}

function setAllowedEmployees(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('allowed_employees');

  if (!sheet) {
    sheet = ss.insertSheet('allowed_employees');
  }

  sheet.clear();
  sheet.getRange(1, 1).setValue('employee_id');

  var employees = data.employees || [];
  if (employees.length > 0) {
    var values = employees.map(function(id) { return [id.toUpperCase()]; });
    sheet.getRange(2, 1, values.length, 1).setValues(values);
  }

  var result = employees.map(function(id) { return id.toUpperCase(); });
  removeCache([CACHE_KEY_EMPLOYEES]);
  return { success: true, employees: result };
}

function addAllowedEmployee(employeeId) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('allowed_employees');

  if (!sheet) {
    sheet = ss.insertSheet('allowed_employees');
    sheet.getRange(1, 1).setValue('employee_id');
  }

  var id = employeeId.toUpperCase();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().toUpperCase() === id) {
      return { success: true, message: 'Already exists' };
    }
  }

  sheet.appendRow([id]);
  removeCache([CACHE_KEY_EMPLOYEES]);
  return { success: true };
}

function removeAllowedEmployee(employeeId) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('allowed_employees');

  if (!sheet) {
    return { success: false, error: 'Sheet not found' };
  }

  var id = employeeId.toUpperCase();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().toUpperCase() === id) {
      sheet.deleteRow(i + 1);
      removeCache([CACHE_KEY_EMPLOYEES]);
      return { success: true };
    }
  }

  return { success: false, error: 'Not found' };
}

// ===== PRIZE FUNCTIONS =====

function getPrizes() {
  var cached = getCache(CACHE_KEY_PRIZES);
  if (cached) {
    return { success: true, prizes: cached };
  }

  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('prizes');
  var data = sheet.getDataRange().getValues();
  var prizes = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] && row[6] === true) {
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

  setCache(CACHE_KEY_PRIZES, prizes, CACHE_TTL_LONG);
  return { success: true, prizes: prizes };
}

/**
 * อ่าน prizes จาก sheet โดยตรง (ไม่ใช้ cache)
 * ใช้ใน spin() เพราะต้องการข้อมูลล่าสุด + ต้องการ row number
 */
function readPrizesFromSheet(prizeSheet) {
  var data = prizeSheet.getDataRange().getValues();
  var prizes = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] && row[6] === true) {
      prizes.push({
        id: row[0].toString(),
        name: row[1],
        description: row[2] || '',
        image_url: row[3] || '',
        probability: parseFloat(row[4]) || 0,
        quantity: parseInt(row[5]) || -1,
        is_active: row[6],
        color: row[7] || '#3b82f6',
        is_donatable: row[8] !== false,
        _rowIndex: i + 1,
        _rawQuantity: row[5]
      });
    }
  }

  return prizes;
}

function addPrize(prizeData) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('prizes');
  var lastRow = sheet.getLastRow();
  var newId = lastRow > 0 ? lastRow : 1;

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

  removeCache([CACHE_KEY_PRIZES]);
  return { success: true, prize: { id: newId.toString(), name: prizeData.name, description: prizeData.description || '', image_url: prizeData.image_url || '', probability: prizeData.probability || 10, quantity: prizeData.quantity !== undefined ? prizeData.quantity : -1, is_active: true, color: prizeData.color || '#3b82f6', is_donatable: prizeData.is_donatable !== false } };
}

function updatePrize(prizeData) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('prizes');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === prizeData.id.toString()) {
      var row = i + 1;
      sheet.getRange(row, 2, 1, 8).setValues([[
        prizeData.name,
        prizeData.description || '',
        prizeData.image_url || '',
        prizeData.probability || 10,
        prizeData.quantity !== undefined ? prizeData.quantity : -1,
        prizeData.is_active !== false,
        prizeData.color || '#3b82f6',
        prizeData.is_donatable !== false
      ]]);
      removeCache([CACHE_KEY_PRIZES]);
      return { success: true };
    }
  }

  return { success: false, error: 'Prize not found' };
}

function deletePrize(id) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('prizes');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      removeCache([CACHE_KEY_PRIZES]);
      return { success: true };
    }
  }

  return { success: false, error: 'Prize not found' };
}

// ===== SPIN FUNCTIONS =====

/**
 * Optimized spin() - เปิด spreadsheet ครั้งเดียว, ใช้ LockService, batch writes
 */
function spin(userId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, error: 'ระบบกำลังประมวลผล กรุณาลองใหม่' };
  }

  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var userSheet = ss.getSheetByName('users');
    var userData = userSheet.getDataRange().getValues();

    var userRow = -1;
    var userName = '';
    var employeeId = '';
    var spinsRemaining = 0;

    for (var i = 1; i < userData.length; i++) {
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

    var prizeSheet = ss.getSheetByName('prizes');
    var allPrizes = readPrizesFromSheet(prizeSheet);
    var prizes = allPrizes.filter(function(p) { return p.quantity !== 0; });

    if (prizes.length === 0) {
      return { success: false, error: 'ไม่มีรางวัลในระบบ' };
    }

    var totalWeight = prizes.reduce(function(sum, p) { return sum + p.probability; }, 0);
    var random = Math.random() * totalWeight;
    var selectedPrize = prizes[0];

    for (var j = 0; j < prizes.length; j++) {
      random -= prizes[j].probability;
      if (random <= 0) {
        selectedPrize = prizes[j];
        break;
      }
    }

    if (selectedPrize.quantity > 0) {
      var newQty = selectedPrize.quantity - 1;
      prizeSheet.getRange(selectedPrize._rowIndex, 6).setValue(newQty);
    }

    userSheet.getRange(userRow, 5).setValue(spinsRemaining - 1);

    var historySheet = ss.getSheetByName('spin_history');
    var lastHistoryRow = historySheet.getLastRow();
    var newHistoryId = lastHistoryRow > 0 ? lastHistoryRow : 1;

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

    // Invalidate all caches ที่ได้รับผลกระทบ
    removeCache([CACHE_KEY_PRIZES, CACHE_KEY_ALL_HISTORY, CACHE_KEY_STATS, historyKey(userId)]);

    var returnPrize = {
      id: selectedPrize.id,
      name: selectedPrize.name,
      description: selectedPrize.description,
      image_url: selectedPrize.image_url,
      probability: selectedPrize.probability,
      quantity: selectedPrize.quantity > 0 ? selectedPrize.quantity - 1 : selectedPrize.quantity,
      is_active: selectedPrize.is_active,
      color: selectedPrize.color,
      is_donatable: selectedPrize.is_donatable
    };

    return {
      success: true,
      prize: returnPrize,
      spinsRemaining: spinsRemaining - 1,
      historyId: newHistoryId.toString()
    };
  } finally {
    lock.releaseLock();
  }
}

function donatePrize(historyId, amount) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('spin_history');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === historyId.toString()) {
      sheet.getRange(i + 1, 8, 1, 2).setValues([['donated', amount || 0]]);
      // Invalidate history/stats caches
      var userId = data[i][1].toString();
      removeCache([CACHE_KEY_ALL_HISTORY, CACHE_KEY_STATS, historyKey(userId)]);
      return { success: true };
    }
  }

  return { success: false, error: 'ไม่พบรายการ' };
}

function getHistory(userId) {
  // ลอง cache ก่อน
  var cacheKey = historyKey(userId);
  var cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('spin_history');
  var data = sheet.getDataRange().getValues();
  var history = [];

  for (var i = 1; i < data.length; i++) {
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

  history.reverse();
  var result = { success: true, history: history };
  setCache(cacheKey, result, CACHE_TTL_MED);
  return result;
}

function getAllHistory() {
  var cached = getCache(CACHE_KEY_ALL_HISTORY);
  if (cached) {
    return cached;
  }

  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('spin_history');
  var data = sheet.getDataRange().getValues();
  var history = [];

  for (var i = 1; i < data.length; i++) {
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

  history.reverse();
  var result = { success: true, history: history };
  setCache(CACHE_KEY_ALL_HISTORY, result, CACHE_TTL_MED);
  return result;
}

function getStats() {
  var cached = getCache(CACHE_KEY_STATS);
  if (cached) {
    return cached;
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  var userSheet = ss.getSheetByName('users');
  var userCount = Math.max(0, userSheet.getLastRow() - 1);

  var historySheet = ss.getSheetByName('spin_history');
  var historyData = historySheet.getDataRange().getValues();
  var spinCount = Math.max(0, historyData.length - 1);

  var prizeStats = {};
  var totalDonations = 0;
  var totalDonationAmount = 0;
  for (var i = 1; i < historyData.length; i++) {
    var prizeName = historyData[i][5];
    if (prizeName) {
      prizeStats[prizeName] = (prizeStats[prizeName] || 0) + 1;
    }
    if (historyData[i][7] === 'donated') {
      totalDonations++;
      totalDonationAmount += parseFloat(historyData[i][8]) || 0;
    }
  }

  var result = {
    success: true,
    stats: {
      totalSpins: spinCount,
      totalUsers: userCount,
      totalDonations: totalDonations,
      totalDonationAmount: totalDonationAmount,
      prizeStats: prizeStats
    }
  };
  setCache(CACHE_KEY_STATS, result, CACHE_TTL_MED);
  return result;
}

// ===== EVENT SETTINGS FUNCTIONS =====

function getEventSettings() {
  var cached = getCache(CACHE_KEY_EVENT_SETTINGS);
  if (cached) {
    return { success: true, settings: cached };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('settings');

  if (!sheet) {
    sheet = ss.insertSheet('settings');
    sheet.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
    var defaults = { startDate: '', endDate: '', startTime: '08:00', endTime: '20:00' };
    setCache(CACHE_KEY_EVENT_SETTINGS, defaults, CACHE_TTL_LONG);
    return { success: true, settings: defaults };
  }

  var data = sheet.getDataRange().getValues();
  var settings = { startDate: '', endDate: '', startTime: '08:00', endTime: '20:00' };

  for (var i = 1; i < data.length; i++) {
    var key = data[i][0] ? data[i][0].toString() : '';
    var value = data[i][1] ? data[i][1].toString() : '';
    if (key === 'startDate') settings.startDate = value;
    else if (key === 'endDate') settings.endDate = value;
    else if (key === 'startTime') settings.startTime = value;
    else if (key === 'endTime') settings.endTime = value;
  }

  setCache(CACHE_KEY_EVENT_SETTINGS, settings, CACHE_TTL_LONG);
  return { success: true, settings: settings };
}

function saveEventSettings(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('settings');

  if (!sheet) {
    sheet = ss.insertSheet('settings');
    sheet.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
  }

  // Clear existing settings rows and rewrite
  var existing = sheet.getDataRange().getValues();
  // Remove old event setting rows
  var settingsKeys = ['startDate', 'endDate', 'startTime', 'endTime'];
  var rowsToKeep = [existing[0]]; // keep header
  for (var i = 1; i < existing.length; i++) {
    if (settingsKeys.indexOf(existing[i][0]) === -1) {
      rowsToKeep.push(existing[i]);
    }
  }

  sheet.clear();
  if (rowsToKeep.length > 0) {
    sheet.getRange(1, 1, rowsToKeep.length, 2).setValues(rowsToKeep);
  }

  // Append new settings
  var newRows = [
    ['startDate', data.startDate || ''],
    ['endDate', data.endDate || ''],
    ['startTime', data.startTime || '08:00'],
    ['endTime', data.endTime || '20:00']
  ];
  sheet.getRange(rowsToKeep.length + 1, 1, newRows.length, 2).setValues(newRows);

  removeCache([CACHE_KEY_EVENT_SETTINGS]);
  return { success: true };
}

// ===== SETUP HELPER =====

function setupSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Prizes sheet
  var prizeSheet = ss.getSheetByName('prizes');
  if (!prizeSheet) {
    prizeSheet = ss.insertSheet('prizes');
  }
  prizeSheet.getRange(1, 1, 1, 9).setValues([['id', 'name', 'description', 'image_url', 'probability', 'quantity', 'is_active', 'color', 'is_donatable']]);

  // Users sheet
  var userSheet = ss.getSheetByName('users');
  if (!userSheet) {
    userSheet = ss.insertSheet('users');
  }
  userSheet.getRange(1, 1, 1, 7).setValues([['id', 'employee_id', 'name', 'phone', 'spins_remaining', 'role', 'created_at']]);

  // Spin history sheet
  var historySheet = ss.getSheetByName('spin_history');
  if (!historySheet) {
    historySheet = ss.insertSheet('spin_history');
  }
  historySheet.getRange(1, 1, 1, 9).setValues([['id', 'user_id', 'user_name', 'employee_id', 'prize_id', 'prize_name', 'spun_at', 'status', 'donation_amount']]);

  // Allowed employees sheet
  var allowedSheet = ss.getSheetByName('allowed_employees');
  if (!allowedSheet) {
    allowedSheet = ss.insertSheet('allowed_employees');
  }
  allowedSheet.getRange(1, 1).setValue('employee_id');

  // Settings sheet
  var settingsSheet = ss.getSheetByName('settings');
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

/**
 * Warm-up function — ตั้ง Time-driven trigger ให้เรียกทุก 4 นาที
 * เพื่อป้องกัน cold start (GAS cold start = +2-5 วินาที)
 *
 * วิธีตั้ง: Triggers > Add Trigger > warmUp > Time-driven > Minutes timer > Every 4 minutes
 */
function warmUp() {
  // เรียก CacheService เพื่อ keep instance warm
  CacheService.getScriptCache().get('_warmup');
  return true;
}
