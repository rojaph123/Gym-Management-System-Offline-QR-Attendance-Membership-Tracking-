import { Platform, AppState } from 'react-native';

const DB_NAME = 'powerlift_gym.db';

let db: any = null;
let isInitializing = false;
let appStateSubscription: any = null;

interface InMemoryDB {
  members: DBMember[];
  attendance: DBAttendance[];
  sales: DBSale[];
  priceSettings: DBPriceSettings;
  appSettings: DBAppSettings;
}

let inMemoryDB: InMemoryDB = {
  members: [],
  attendance: [],
  sales: [],
  priceSettings: {
    id: 1,
    membership: 300,
    student_monthly: 600,
    regular_monthly: 700,
    senior_monthly: 560,
    session_member: 70,
    session_nonmember: 100,
    session_member_senior: 40,
    session_nonmember_senior: 60,
  },
  appSettings: { id: 1, pin_hash: null, is_dark_mode: 1 },
};

async function getSQLiteDatabase() {
  if (Platform.OS === 'web') {
    console.log('[Database] Running on web - using in-memory storage (for testing only)');
    return null;
  }
  
  try {
    // Prevent multiple concurrent initialization attempts
    if (isInitializing) {
      let attempts = 0;
      while (isInitializing && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    // If database is already open, return it
    if (db) {
      // Quick validation - try a simple query
      try {
        await db.getFirstAsync('SELECT 1');
        return db;
      } catch (error) {
        console.warn('[Database] Connection lost, attempting to reconnect...');
        db = null; // Reset and reinitialize
      }
    }

    isInitializing = true;
    console.log('[Database] Initializing SQLite database...');
    
    const SQLite = await import('expo-sqlite');
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // IMPORTANT: Enable WAL mode for better concurrency and crash recovery
    try {
      await db.execAsync('PRAGMA journal_mode = WAL');
      await db.execAsync('PRAGMA synchronous = NORMAL');
      console.log('[Database] WAL mode enabled for crash recovery');
    } catch (pragmaError) {
      console.warn('[Database] Could not enable WAL mode:', pragmaError);
    }
    
    await initDatabase(db);
    console.log('[Database] SQLite database initialized successfully');
    
    isInitializing = false;
    return db;
  } catch (error) {
    isInitializing = false;
    console.error('[Database] CRITICAL: Failed to initialize SQLite database on native platform:', error);
    // Don't throw - allow app to continue with in-memory mode
    db = null;
    return null;
  }
}

async function initDatabase(database: any): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY,
      firstname TEXT NOT NULL,
      lastname TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      photo TEXT,
      qr_code TEXT NOT NULL,
      qr_image_path TEXT,
      membership_type TEXT NOT NULL,
      is_member INTEGER DEFAULT 1,
      subscription_start TEXT,
      subscription_end TEXT
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY,
      member_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS price_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      membership REAL DEFAULT 300,
      student_monthly REAL DEFAULT 600,
      regular_monthly REAL DEFAULT 700,
      senior_monthly REAL DEFAULT 560,
      session_member REAL DEFAULT 70,
      session_nonmember REAL DEFAULT 100,
      session_member_senior REAL DEFAULT 50,
      session_nonmember_senior REAL DEFAULT 80
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      pin_hash TEXT,
      is_dark_mode INTEGER DEFAULT 1
    );
  `);

  // Migration: Add missing columns if they don't exist
  try {
    const tableInfo = await database.getAllAsync("PRAGMA table_info(price_settings)");
    const columnNames = tableInfo.map((col: any) => col.name);

    if (!columnNames.includes('session_member_senior')) {
      console.log('[Database] Migrating: Adding session_member_senior column...');
      await database.execAsync('ALTER TABLE price_settings ADD COLUMN session_member_senior REAL DEFAULT 50');
    }

    if (!columnNames.includes('session_nonmember_senior')) {
      console.log('[Database] Migrating: Adding session_nonmember_senior column...');
      await database.execAsync('ALTER TABLE price_settings ADD COLUMN session_nonmember_senior REAL DEFAULT 80');
    }
  } catch (migrationError) {
    console.warn('[Database] Migration check failed (table may not exist yet):', migrationError);
  }

  await database.runAsync(
    'INSERT OR REPLACE INTO price_settings (id, membership, student_monthly, regular_monthly, senior_monthly, session_member, session_nonmember, session_member_senior, session_nonmember_senior) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [1, 300, 600, 700, 560, 70, 100, 50, 80]
  );

  const appSettings = await database.getFirstAsync('SELECT * FROM app_settings WHERE id = 1');
  if (!appSettings) {
    await database.runAsync(
      'INSERT INTO app_settings (id, is_dark_mode) VALUES (?, ?)',
      [1, 1]
    );
  }
}

export interface DBMember {
  id: number;
  firstname: string;
  lastname: string;
  age: number;
  gender: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  qr_code: string;
  qr_image_path: string | null;
  membership_type: string;
  is_member: number;
  subscription_start: string | null;
  subscription_end: string | null;
}

export interface DBAttendance {
  id: number;
  member_id: number;
  date: string;
  time: string;
}

export interface DBSale {
  id: number;
  type: string;
  amount: number;
  date: string;
  note: string | null;
}

export interface DBPriceSettings {
  id: number;
  membership: number;
  student_monthly: number;
  regular_monthly: number;
  senior_monthly: number;
  session_member: number;
  session_nonmember: number;
  session_member_senior: number;
  session_nonmember_senior: number;
}

export interface DBAppSettings {
  id: number;
  pin_hash: string | null;
  is_dark_mode: number;
}

export async function getAllMembers(): Promise<DBMember[]> {
  const database = await getSQLiteDatabase();
  if (!database) {
    return [...inMemoryDB.members].sort((a, b) => b.id - a.id);
  }
  const rows = await database.getAllAsync('SELECT * FROM members ORDER BY id DESC');
return rows as DBMember[];

}

export async function getMemberById(id: number): Promise<DBMember | null> {
  const database = await getSQLiteDatabase();
  if (!database) {
    return inMemoryDB.members.find(m => m.id === id) || null;
  }
  const row = await database.getFirstAsync('SELECT * FROM members WHERE id = ?', [id]);
return row as DBMember | null;

}

export async function getMemberByQRCode(qrCode: string): Promise<DBMember | null> {
  const database = await getSQLiteDatabase();
  if (!database) {
    return inMemoryDB.members.find(m => m.qr_code === qrCode) || null;
  }
  const row = await database.getFirstAsync('SELECT * FROM members WHERE qr_code = ?', [qrCode]);
return row as DBMember | null;

}

export async function insertMember(member: Omit<DBMember, 'id'>): Promise<number> {
  // enforce that a photo is provided for each member
  if (!member.photo || (typeof member.photo === 'string' && member.photo.trim() === '')) {
    throw new Error('Member photo is required');
  }
  const database = await getSQLiteDatabase();
  if (!database) {
    const id = Date.now();
    inMemoryDB.members.push({ ...member, id });
    return id;
  }
  
  const result = await database.runAsync(
    `INSERT INTO members (firstname, lastname, age, gender, email, phone, photo, qr_code, qr_image_path, membership_type, is_member, subscription_start, subscription_end)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      member.firstname,
      member.lastname,
      member.age,
      member.gender,
      member.email,
      member.phone,
      member.photo,
      member.qr_code,
      member.qr_image_path,
      member.membership_type,
      member.is_member,
      member.subscription_start,
      member.subscription_end
    ]
  );
  return result.lastInsertRowId;
}

export async function updateMemberById(id: number, updates: Partial<DBMember>): Promise<void> {
  const database = await getSQLiteDatabase();
  if (!database) {
    const index = inMemoryDB.members.findIndex(m => m.id === id);
    if (index !== -1) {
      inMemoryDB.members[index] = { ...inMemoryDB.members[index], ...updates };
    }
    return;
  }
  
  const keys = Object.keys(updates).filter(k => k !== 'id');
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => (updates as Record<string, string | number | null>)[k]);
  values.push(id);

  await database.runAsync(`UPDATE members SET ${setClause} WHERE id = ?`, values);
}

export async function deleteMemberById(id: number): Promise<void> {
  const database = await getSQLiteDatabase();
  if (!database) {
    inMemoryDB.members = inMemoryDB.members.filter(m => m.id !== id);
    inMemoryDB.attendance = inMemoryDB.attendance.filter(a => a.member_id !== id);
    return;
  }
  
  await database.runAsync('DELETE FROM members WHERE id = ?', [id]);
  await database.runAsync('DELETE FROM attendance WHERE member_id = ?', [id]);
}

export async function getAllAttendance(): Promise<DBAttendance[]> {
  const database = await getSQLiteDatabase();
  if (!database) {
    return [...inMemoryDB.attendance].sort((a, b) => b.id - a.id);
  }
  const rows = await database.getAllAsync('SELECT * FROM attendance ORDER BY id DESC');
return rows as DBAttendance[];

}

export async function insertAttendance(attendance: Omit<DBAttendance, 'id'>): Promise<number> {
  const database = await getSQLiteDatabase();
  if (!database) {
    const id = Date.now();
    inMemoryDB.attendance.push({ ...attendance, id });
    return id;
  }
  
  const result = await database.runAsync(
    'INSERT INTO attendance (member_id, date, time) VALUES (?, ?, ?)',
    [attendance.member_id, attendance.date, attendance.time]
  );
  return result.lastInsertRowId;
}

export async function getAllSales(): Promise<DBSale[]> {
  const database = await getSQLiteDatabase();
  if (!database) {
    return [...inMemoryDB.sales].sort((a, b) => b.id - a.id);
  }
  const rows = await database.getAllAsync('SELECT * FROM sales ORDER BY id DESC');
return rows as DBSale[];

}

export async function insertSale(sale: Omit<DBSale, 'id'>): Promise<number> {
  const database = await getSQLiteDatabase();
  if (!database) {
    const id = Date.now();
    inMemoryDB.sales.push({ ...sale, id });
    return id;
  }
  
  const result = await database.runAsync(
    'INSERT INTO sales (type, amount, date, note) VALUES (?, ?, ?, ?)',
    [sale.type, sale.amount, sale.date, sale.note]
  );
  return result.lastInsertRowId;
}

export async function getPriceSettings(): Promise<DBPriceSettings> {
  const database = await getSQLiteDatabase();
  if (!database) {
    return inMemoryDB.priceSettings;
  }
  
  const row = await database.getFirstAsync('SELECT * FROM price_settings WHERE id = 1');
const settings = row as DBPriceSettings | null;

  return settings || {
    id: 1,
    membership: 300,
    student_monthly: 600,
    regular_monthly: 700,
    senior_monthly: 560,
    session_member: 70,
    session_nonmember: 100,
    session_member_senior: 40,
    session_nonmember_senior: 60,
  };
}

export async function updatePriceSettingsDB(settings: Partial<DBPriceSettings>): Promise<void> {
  const database = await getSQLiteDatabase();
  if (!database) {
    inMemoryDB.priceSettings = { ...inMemoryDB.priceSettings, ...settings };
    return;
  }
  
  const keys = Object.keys(settings).filter(k => k !== 'id');
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => (settings as Record<string, number>)[k]);

  await database.runAsync(`UPDATE price_settings SET ${setClause} WHERE id = 1`, values);
}

export async function getAppSettings(): Promise<DBAppSettings> {
  const database = await getSQLiteDatabase();
  if (!database) {
    return inMemoryDB.appSettings;
  }
  
 const row = await database.getFirstAsync('SELECT * FROM app_settings WHERE id = 1');
const settings = row as DBAppSettings | null;

  return settings || { id: 1, pin_hash: null, is_dark_mode: 1 };
}

export async function updateAppSettings(settings: Partial<DBAppSettings>): Promise<void> {
  const database = await getSQLiteDatabase();
  if (!database) {
    inMemoryDB.appSettings = { ...inMemoryDB.appSettings, ...settings };
    return;
  }
  
  const keys = Object.keys(settings).filter(k => k !== 'id');
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => (settings as Record<string, string | number | null>)[k]);

  await database.runAsync(`UPDATE app_settings SET ${setClause} WHERE id = 1`, values);
}

export async function hasPin(): Promise<boolean> {
  const settings = await getAppSettings();
  return !!settings.pin_hash;
}

export async function savePin(pin: string): Promise<void> {
  await updateAppSettings({ pin_hash: pin });
}

export async function verifyPin(pin: string): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.pin_hash === pin;
}
/**
 * Initialize app lifecycle handlers to manage database connection
 * Call this once in your AppProvider or App component
 */
export function initializeAppLifecycleHandlers(): () => void {
  console.log('[Database] Setting up app lifecycle handlers...');
  
  const handleAppStateChange = async (state: string) => {
    if (state === 'background') {
      console.log('[Database] App backgrounded - keeping database connection');
      // Database stays open in background for offline functionality
    } else if (state === 'active') {
      console.log('[Database] App foregrounded - validating database connection');
      // Validate connection when app comes to foreground
      try {
        if (db) {
          await db.getFirstAsync('SELECT 1');
          console.log('[Database] Connection validated');
        }
      } catch (error) {
        console.warn('[Database] Connection lost during background, will reconnect on next operation');
        db = null;
      }
    }
  };

  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  
  // Return cleanup function
  return () => {
    if (appStateSubscription) {
      appStateSubscription.remove();
    }
  };
}

/**
 * Clear all members from the database
 */
export async function clearAllMembers(): Promise<void> {
  try {
    const database = await getSQLiteDatabase();
    if (!database) return;
    await database.execAsync('DELETE FROM members', []);
    console.log('[Database] All members cleared');
  } catch (error) {
    console.error('[Database] Error clearing members:', error);
    throw error;
  }
}

/**
 * Clear all attendance records from the database
 */
export async function clearAllAttendance(): Promise<void> {
  try {
    const database = await getSQLiteDatabase();
    if (!database) return;
    await database.execAsync('DELETE FROM attendance', []);
    console.log('[Database] All attendance records cleared');
  } catch (error) {
    console.error('[Database] Error clearing attendance:', error);
    throw error;
  }
}

/**
 * Clear all sales from the database
 */
export async function clearAllSales(): Promise<void> {
  try {
    const database = await getSQLiteDatabase();
    if (!database) return;
    await database.execAsync('DELETE FROM sales', []);
    console.log('[Database] All sales cleared');
  } catch (error) {
    console.error('[Database] Error clearing sales:', error);
    throw error;
  }
}

/**
 * Clear all data (members, attendance, sales) from the database
 */
export async function clearAllData(): Promise<void> {
  try {
    const database = await getSQLiteDatabase();
    if (!database) return;
    await database.execAsync('DELETE FROM attendance', []);
    await database.execAsync('DELETE FROM sales', []);
    await database.execAsync('DELETE FROM members', []);
    console.log('[Database] All data cleared');
  } catch (error) {
    console.error('[Database] Error clearing all data:', error);
    throw error;
  }
}

/**
 * Force close and reset the database connection
 * Use only for testing or emergency recovery
 */
export async function resetDatabase(): Promise<void> {
  try {
    if (db) {
      console.log('[Database] Closing database...');
      try {
        await db.closeAsync();
      } catch (e) {
        console.warn('[Database] Error closing database:', e);
      }
      db = null;
    }
    isInitializing = false;
    console.log('[Database] Reset complete - database will reinitialize on next use');
  } catch (error) {
    console.error('[Database] Error resetting database:', error);
  }
}