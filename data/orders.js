// data/orders.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Saves an order to AsyncStorage.
 * @param {Object} order - The order object to save.
 */
export const saveOrder = async (order) => {
  try {
    const existingOrders = await readOrders();
    existingOrders.push(order);
    const jsonValue = JSON.stringify(existingOrders);
    await AsyncStorage.setItem('orders', jsonValue);
  } catch (error) {
    console.error('Error saving order:', error);
  }
};

/**
 * Reads orders from AsyncStorage.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of orders.
 */
export const readOrders = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('orders');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
};

/**
 * Updates orders in AsyncStorage.
 * @param {Object[]} orders - The updated array of orders.
 */
export const updateOrders = async (orders) => {
  try {
    const jsonValue = JSON.stringify(orders);
    await AsyncStorage.setItem('orders', jsonValue);
  } catch (error) {
    console.error('Error updating orders:', error);
  }
};
