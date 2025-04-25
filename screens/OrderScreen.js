// screens/OrderScreen.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { ThemeContext }        from '../context/ThemeContext';
import { NotificationContext } from '../context/NotificationContext';
import mealImages              from '../assets/images/meals';
import { readOrders }          from '../data/orders';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function OrderScreen({ navigation }) {
  const { theme }           = useContext(ThemeContext);
  const { addNotification } = useContext(NotificationContext);

  const [cart, setCart]                   = useState([]);
  const [completedOrders, setCompleted]   = useState([]);

  // Load cart & completed orders on focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('currentCart').then(val => {
        setCart(val ? JSON.parse(val) : []);
      });
      readOrders().then(setCompleted);
    }, [])
  );

  // Persist cart to AsyncStorage
  const saveCart = updated => {
    setCart(updated);
    AsyncStorage.setItem('currentCart', JSON.stringify(updated));
  };

  // Quantity adjustment
  const adjustQuantity = (id, delta) => {
    saveCart(
      cart
        .map(item =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
    addNotification(`Updated quantity for item #${id}`);
  };

  // Remove item entirely
  const removeItem = id => {
    const updated = cart.filter(item => item.id !== id);
    saveCart(updated);
    addNotification(`Removed item #${id} from cart`);
  };

  // Calculate total
  const total = () =>
    cart.reduce((sum, m) => sum + m.price * (m.quantity || 1), 0);

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (!cart.length) {
      Alert.alert('Cart is empty', 'Please add at least one item.');
      return;
    }
    addNotification('Proceeding to checkout');
    navigation.navigate('Checkout', { selectedMeals: cart });
  };

  // Reorder a past order
  const reorder = order => {
    const items = order.meals.map(m => ({ ...m, quantity: m.quantity || 1 }));
    saveCart(items);
    addNotification(`Reordered order #${order.id}`);
    Alert.alert('Reordered', `Order #${order.id} added to cart.`);
  };

  // Prompt feedback survey
  const promptFeedback = order => {
    Alert.alert(
      'Rate your experience',
      `How was Order #${order.id}?`,
      [
        { text: '⭐', onPress: () => addNotification(`Rated Order #${order.id} ⭐`) },
        { text: '⭐⭐', onPress: () => addNotification(`Rated Order #${order.id} ⭐⭐`) },
        { text: '⭐⭐⭐', onPress: () => addNotification(`Rated Order #${order.id} ⭐⭐⭐`) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Render cart item with qty controls
  const renderCartItem = ({ item }) => (
    <View style={[styles.row, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Image
        source={mealImages[item.image.replace('.png','')]}
        style={styles.thumb}
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={{ color: theme.colors.text }}>
          £{(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
      <View style={styles.qtyControls}>
        <TouchableOpacity onPress={() => adjustQuantity(item.id, -1)}>
          <FontAwesome name="minus-circle" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.qtyText, { color: theme.colors.text }]}>
          {item.quantity}
        </Text>
        <TouchableOpacity onPress={() => adjustQuantity(item.id, +1)}>
          <FontAwesome name="plus-circle" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteIcon}>
          <FontAwesome name="trash" size={20} color={theme.colors.placeholder} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render completed order entry
  const renderCompleted = ({ item, index }) => (
    <View style={[styles.completedContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.completedText, { color: theme.colors.text }]}>
        #{index + 1} – {item.date}
      </Text>
      <View style={styles.completedButtons}>
        <TouchableOpacity onPress={() => reorder(item)} style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>Reorder</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CompletedOrder', { completedOrder: item })} style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => promptFeedback(item)} style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>Rate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />

      <Text style={[styles.title, { color: theme.colors.text }]}>Your Cart</Text>

      <FlatList
        data={cart}
        keyExtractor={i => i.id.toString()}
        renderItem={renderCartItem}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.placeholder }]}>
            Your cart is empty
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Text style={[styles.total, { color: theme.colors.text }]}>
        Total: £{total().toFixed(2)}
      </Text>

      <TouchableOpacity
        style={[
          styles.proceedButton,
          { backgroundColor: cart.length ? theme.colors.primary : theme.colors.border }
        ]}
        disabled={!cart.length}
        onPress={proceedToCheckout}
      >
        <Text style={styles.proceedText}>Proceed to Checkout</Text>
      </TouchableOpacity>

      <Text style={[styles.section, { color: theme.colors.text }]}>Past Orders</Text>
      <FlatList
        data={completedOrders}
        keyExtractor={o => o.id.toString()}
        renderItem={renderCompleted}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.placeholder }]}>
            No completed orders yet.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, padding: 20 },
  title:       { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  row:         { flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth:1, padding: 10, marginBottom: 10, elevation:1 },
  thumb:       { width: 60, height: 60, borderRadius: 6, marginRight: 12 },
  info:        { flex: 1 },
  name:        { fontSize: 16, fontWeight: '500' },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyText:     { marginHorizontal: 8, fontSize: 16 },
  deleteIcon:  { marginLeft: 12 },
  total:       { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginVertical: 12 },
  proceedButton: { height: 50, borderRadius: 25, justifyContent:'center', alignItems:'center', marginBottom:20 },
  proceedText: { color:'#FFF', fontSize:16, fontWeight:'600' },

  section:         { fontSize:20, fontWeight:'600', marginBottom:8 },
  completedContainer: { borderRadius:8, borderWidth:1, padding:12, marginBottom:12 },
  completedText:   { fontSize:16, marginBottom:8 },
  completedButtons:{ flexDirection:'row', justifyContent:'space-between' },
  smallBtn:        { paddingVertical:6, paddingHorizontal:10, borderRadius:6, backgroundColor:'#e91e63' },
  smallBtnText:    { color:'#FFF', fontSize:12 },

  empty: { textAlign:'center', marginTop:40, fontSize:16 },
});
