import * as SQLite from 'expo-sqlite';
import { AppState } from 'react-native';

// Database singleton
let dbInstance = null;
let dbInitializing = false;
let initPromise = null;
let lastAppState = AppState.currentState;

// Validate database connection
const isConnectionValid = async (db) => {
  if (!db) return false;
  
  try {
    // Simple query to test connection
    await db.getAllAsync('SELECT 1');
    return true;
  } catch (error) {
    console.log('Database connection validation failed:', error);
    return false;
  }
};

// For expo-sqlite v15+, we use the async API
export const getDatabase = async () => {
  try {
    // Return existing connection if available and valid
    if (dbInstance) {
      const isValid = await isConnectionValid(dbInstance);
      if (isValid) {
        return dbInstance;
      } else {
        console.log('Database connection invalid, reopening...');
        await closeDatabase(); // Close the invalid connection
      }
    }
    
    // Wait for existing initialization if in progress
    if (dbInitializing && initPromise) {
      return await initPromise;
    }
    
    // Initialize new connection
    dbInitializing = true;
    initPromise = SQLite.openDatabaseAsync('cart.db');
    dbInstance = await initPromise;
    dbInitializing = false;
    return dbInstance;
  } catch (error) {
    dbInitializing = false;
    console.error('Failed to open database', error);
    throw error;
  }
};

// Close and reset database connection
export const closeDatabase = async () => {
  try {
    if (dbInstance) {
      await dbInstance.closeAsync();
      dbInstance = null;
    }
    initPromise = null;
  } catch (error) {
    console.error('Failed to close database', error);
    // Reset the instance even if closing fails
    dbInstance = null;
    initPromise = null;
  }
};


// Initialize the database with connection recovery
export const initDatabase = async () => {
  try {
    const db = await getDatabase();
    
    // Create cart_items table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        title TEXT NOT NULL, 
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        image TEXT,
        user_id TEXT,
        UNIQUE(product_id, user_id)
      );
    `);

    // Create auth_tokens table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        token TEXT NOT NULL,
        created_at INTEGER
      );
    `);
    
    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    // Reset connection on error to force new connection on next attempt
    await closeDatabase();
    return { success: false, error };
  }
};

// Improved app state handler
const handleAppStateChange = (nextAppState) => {
  // When app goes to background
  if (
    (lastAppState === 'active' && 
    (nextAppState === 'background' || nextAppState === 'inactive'))
  ) {
    closeDatabase();
  }
  // When app comes back to foreground
  else if (
    (lastAppState === 'background' || lastAppState === 'inactive') && 
    nextAppState === 'active'
  ) {
    // Will reconnect on next database operation
    dbInstance = null;
  }
  
  lastAppState = nextAppState;
};

// Setup improved app state listener
AppState.addEventListener('change', handleAppStateChange);

// Store authentication token
export const storeAuthToken = async (userId, token) => {
  try {
    const db = await getDatabase();
    
    // First clear any existing tokens
    await db.execAsync('DELETE FROM auth_tokens');
    
    // Store new token with timestamp
    await db.runAsync(
      'INSERT INTO auth_tokens (user_id, token, created_at) VALUES (?, ?, ?)',
      [userId, token, Date.now()]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error storing auth token:', error);
    return { success: false, error };
  }
};

// Get stored authentication token
export const getStoredAuthToken = async () => {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync('SELECT * FROM auth_tokens LIMIT 1');
    
    if (result && result.length > 0) {
      return { 
        success: true, 
        token: result[0].token,
        userId: result[0].user_id 
      };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return { success: false, error };
  }
};

// Clear stored authentication token
export const clearAuthToken = async () => {
  try {
    const db = await getDatabase();
    await db.execAsync('DELETE FROM auth_tokens');
    return { success: true };
  } catch (error) {
    console.error('Error clearing auth token:', error);
    return { success: false, error };
  }
};

// Get all cart items
// Get all cart items
export const getCartItems = async (userId) => {
  try {
    const db = await getDatabase();
    
    // Validate connection before proceeding
    if (!db || !(await isConnectionValid(db))) {
      console.log("Attempting database recovery...");
      await closeDatabase(); // Reset connection
      // Try one more time
      const newDb = await getDatabase();
      if (!newDb) {
        throw new Error("Could not establish database connection");
      }
    }
    
    const result = await db.getAllAsync(`
      SELECT * FROM cart_items WHERE user_id = ?;
    `, [userId || 'guest']);
    
    return result.map(item => ({
      _id: item.product_id, // Cart item ID for removal operations
      id: item.product_id,  // Product ID
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      product: item.product_id // Adding this for consistency
    }));
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
};

// Add item to cart
export const addCartItem = async (product, quantity = 1, userId) => {
  try {
    const db = await getDatabase();
    
    // Check if the item already exists
    const existingItems = await db.getAllAsync(`
      SELECT * FROM cart_items WHERE product_id = ? AND user_id = ?;
    `, [product._id, userId || 'guest']);
    
    if (existingItems.length > 0) {
      // Item exists, update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      await db.runAsync(`
        UPDATE cart_items SET quantity = ? WHERE product_id = ? AND user_id = ?;
      `, [newQuantity, product._id, userId || 'guest']);
    } else {
      // Item doesn't exist, insert new item
      await db.runAsync(`
        INSERT INTO cart_items (product_id, title, price, quantity, image, user_id) 
        VALUES (?, ?, ?, ?, ?, ?);
      `, [
        product._id, 
        product.title || product.name, 
        product.price, 
        quantity, 
        product.image?.url || product.image, 
        userId || 'guest'
      ]);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return { success: false, error };
  }
};

// Remove item from cart
export const removeCartItem = async (productId, userId) => {
  try {
    const db = await getDatabase();
    await db.runAsync(`
      DELETE FROM cart_items WHERE product_id = ? AND user_id = ?;
    `, [productId, userId || 'guest']);
    
    return { success: true };
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return { success: false, error };
  }
};

// Update cart item quantity - renamed to avoid conflicts
export const updateCartItemQuantityInDb = async (productId, quantity, userId) => {
  try {
    const db = await getDatabase();
    await db.runAsync(`
      UPDATE cart_items SET quantity = ? WHERE product_id = ? AND user_id = ?;
    `, [quantity, productId, userId || 'guest']);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return { success: false, error };
  }
};

// Remove multiple items from cart
export const removeMultipleCartItems = async (productIds, userId) => {
  try {
    const db = await getDatabase();
    for (const productId of productIds) {
      await db.runAsync(`
        DELETE FROM cart_items WHERE product_id = ? AND user_id = ?;
      `, [productId, userId || 'guest']);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error removing multiple items from cart:', error);
    return { success: false, error };
  }
};

// Clear cart
export const clearCart = async (userId) => {
  try {
    const db = await getDatabase();
    await db.runAsync(`
      DELETE FROM cart_items WHERE user_id = ?;
    `, [userId || 'guest']);
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error };
  }
};