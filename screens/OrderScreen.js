import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  Image,
  TouchableOpacity,
  Modal,
  StatusBar,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage                    from '@react-native-async-storage/async-storage';
import { useFocusEffect }              from '@react-navigation/native';
import FontAwesome                     from 'react-native-vector-icons/FontAwesome';

import { ThemeContext }        from '../context/ThemeContext';
import { NotificationContext } from '../context/NotificationContext';
import mealImages              from '../assets/images/meals';
import { readOrders, updateOrders }  from '../data/orders';

export default function OrderScreen({ navigation }) {
  const { theme }           = useContext(ThemeContext);
  const { addNotification } = useContext(NotificationContext);

  const [cart, setCart]                       = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [orderToRate, setOrderToRate]               = useState(null);

  /* ---------- load live data whenever focused ---------- */
  const loadData = useCallback(() => {
    AsyncStorage.getItem('currentCart').then(v =>
      setCart(v ? JSON.parse(v) : [])
    );
    readOrders().then(setCompletedOrders);
  }, []);
  useFocusEffect(loadData);

  /* ---------- cart helpers ---------- */
  const saveCart = updated => {
    setCart(updated);
    AsyncStorage.setItem('currentCart', JSON.stringify(updated));
  };
  const adjustQuantity = (id, d) =>
    saveCart(
      cart
        .map(it => (it.id === id ? { ...it, quantity: Math.max(1, it.quantity + d) } : it))
        .filter(it => it.quantity > 0)
    );
  const removeItem = id => saveCart(cart.filter(it => it.id !== id));

  /* ---------- checkout ---------- */
  const proceedToCheckout = () => {
    if (!cart.length) {
      Alert.alert('Cart is empty', 'Please add items first.');
      return;
    }
    navigation.navigate('Checkout');
  };

  /* ---------- instant reorder ---------- */
  const reorder = order => {
    const items = order.meals.map(m => ({ ...m, quantity: m.quantity || 1 }));
    saveCart(items);
    addNotification(`Reordered order #${order.id}`);
    Alert.alert('Reordered', `Order #${order.id} added to cart.`);
  };

  /* ---------- rating modal ---------- */
  const openRating = order => {
    setOrderToRate(order);
    setRatingModalVisible(true);
  };
  const closeRating = () => {
    setOrderToRate(null);
    setRatingModalVisible(false);
  };
  const submitRating = stars => {
    /** persist to state + storage */
    const updatedOrders = completedOrders.map(o =>
      o.id === orderToRate.id ? { ...o, rating: stars } : o
    );
    setCompletedOrders(updatedOrders);
    updateOrders(updatedOrders);          // AsyncStorage
    addNotification(`Rated Order #${orderToRate.id}: ${stars}⭐`);
    closeRating();
  };

  /* ---------- UI helpers ---------- */
  const cartTotal = () =>
    cart.reduce((sum, m) => sum + m.price * (m.quantity || 1), 0);

  const Stars = ({ n }) => (
    <View style={{ flexDirection: 'row' }}>
      {[...Array(5)].map((_, i) => (
        <FontAwesome
          key={i}
          name="star"
          size={14}
          color={i < n ? '#FFC107' : '#E0E0E0'}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );

  /* ---------- render cart line ---------- */
  const renderCartItem = ({ item }) => (
    <View style={[styles.row, { backgroundColor: theme.colors.card }]}>
      <Image source={mealImages[item.image.replace('.png','')]} style={styles.thumb} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={{ color: theme.colors.text }}>
          £{(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
      <View style={styles.qty}>
        <TouchableOpacity onPress={() => adjustQuantity(item.id, -1)}>
          <FontAwesome name="minus-circle" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.qtyText, { color: theme.colors.text }]}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => adjustQuantity(item.id, +1)}>
          <FontAwesome name="plus-circle" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeItem(item.id)} style={{ marginLeft: 10 }}>
          <FontAwesome name="trash" size={20} color={theme.colors.placeholder} />
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ---------- render completed row ---------- */
  const renderCompleted = ({ item, index }) => (
    <View style={[styles.completedRow, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.completedText, { color: theme.colors.text }]}>
        #{index + 1} – {item.date}
      </Text>

      <View style={styles.completedButtons}>
        <TouchableOpacity onPress={() => reorder(item)} style={styles.smallBtn}>
          <Text style={styles.smallTxt}>Reorder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('CompletedOrder', { completedOrder: item })}
          style={styles.smallBtn}
        >
          <Text style={styles.smallTxt}>View</Text>
        </TouchableOpacity>

        {item.rating ? (
          <Stars n={item.rating} />
        ) : (
          <TouchableOpacity onPress={() => openRating(item)} style={styles.smallBtn}>
            <Text style={styles.smallTxt}>Rate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  /* ---------- sections ---------- */
  const sections = [
    { title: 'Your Cart',   data: cart },
    { title: 'Past Orders', data: completedOrders },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={theme.dark?'light-content':'dark-content'} />

      <SectionList
        sections={sections}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
        )}
        renderItem={({ item, section, index }) =>
          section.title === 'Your Cart'
            ? renderCartItem({ item })
            : renderCompleted({ item, index })
        }
        renderSectionFooter={({ section }) =>
          section.data.length === 0 && (
            <Text style={[styles.empty, { color: theme.colors.placeholder }]}>
              {section.title === 'Your Cart' ? 'Cart is empty.' : 'No completed orders.'}
            </Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* proceed button */}
      {cart.length > 0 && (
        <TouchableOpacity
          style={[styles.proceedBtn, { backgroundColor: theme.colors.primary }]}
          onPress={proceedToCheckout}
        >
          <Text style={styles.proceedTxt}>Proceed to Checkout</Text>
        </TouchableOpacity>
      )}

      {/* rating modal */}
      <Modal visible={ratingModalVisible} transparent animationType="fade" onRequestClose={closeRating}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Rate Order #{orderToRate?.id}
            </Text>
            {[1,2,3,4,5].map(n => (
              <TouchableOpacity key={n} style={styles.rateOpt} onPress={() => submitRating(n)}>
                <Text style={[styles.rateTxt, { color: theme.colors.text }]}>{'⭐'.repeat(n)} {n}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.rateCancel} onPress={closeRating}>
              <Text style={[styles.cancelTxt, { color: theme.colors.placeholder }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1 },
  sectionTitle:{ fontSize:20, fontWeight:'600', margin:20, marginBottom:10 },

  row:{ flexDirection:'row', padding:10, borderRadius:8, marginHorizontal:20, marginBottom:10, elevation:1 },
  thumb:{ width:60, height:60, borderRadius:6, marginRight:12 },
  info:{ flex:1 },
  name:{ fontSize:16, fontWeight:'500' },
  qty:{ flexDirection:'row', alignItems:'center' },
  qtyText:{ marginHorizontal:8, fontSize:16 },

  completedRow:{ borderRadius:8, padding:12, marginHorizontal:20, marginBottom:10, elevation:1 },
  completedText:{ fontSize:16, marginBottom:8 },
  completedButtons:{ flexDirection:'row', alignItems:'center', flexWrap:'wrap', gap:6 },
  smallBtn:{ backgroundColor:'#e91e63', paddingHorizontal:10, paddingVertical:6, borderRadius:6 },
  smallTxt:{ color:'#FFF', fontSize:12 },

  empty:{ marginLeft:20, fontStyle:'italic', marginBottom:10 },

  proceedBtn:{ position:'absolute', left:20, right:20, bottom:20, height:50, borderRadius:25, justifyContent:'center', alignItems:'center', elevation:2 },
  proceedTxt:{ color:'#FFF', fontSize:16, fontWeight:'600' },

  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  modalBox:{ width:'80%', borderRadius:10, padding:20 },
  modalTitle:{ fontSize:18, fontWeight:'600', textAlign:'center', marginBottom:12 },
  rateOpt:{ paddingVertical:10 },
  rateTxt:{ fontSize:16, textAlign:'center' },
  rateCancel:{ marginTop:12, borderTopWidth:1, borderColor:'#ccc', paddingVertical:10 },
  cancelTxt:{ textAlign:'center', fontSize:16 },
});
