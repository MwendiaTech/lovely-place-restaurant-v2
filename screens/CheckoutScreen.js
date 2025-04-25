// screens/CheckoutScreen.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage                from '@react-native-async-storage/async-storage';
import { useFocusEffect }          from '@react-navigation/native';
import FontAwesome                 from 'react-native-vector-icons/FontAwesome';

import { ThemeContext }        from '../context/ThemeContext';
import { NotificationContext } from '../context/NotificationContext';
import mealImages              from '../assets/images/meals';
import applePayLogo            from '../assets/images/payments/apple-pay.png';
import googlePayLogo           from '../assets/images/payments/google-pay.png';
import paypalLogo              from '../assets/images/payments/paypal.png';
import { saveOrder }           from '../data/orders';

const PAYMENT_OPTIONS = [
  { id: 'Apple Pay',  logo: applePayLogo  },
  { id: 'Google Pay', logo: googlePayLogo },
  { id: 'PayPal',     logo: paypalLogo    },
];

export default function CheckoutScreen({ navigation }) {
  const { theme }           = useContext(ThemeContext);
  const { addNotification } = useContext(NotificationContext);

  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: '',
  });
  const [err, setErr] = useState({});

  const loadCart = useCallback(() => {
    AsyncStorage.getItem('currentCart').then(v =>
      setCart(v ? JSON.parse(v) : [])
    );
  }, []);

  useEffect(loadCart, []);
  useFocusEffect(loadCart);

  const total = () =>
    cart.reduce((sum, m) => sum + m.price * (m.quantity || 1), 0);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())   e.fullName = 'Required';
    if (!form.email.trim())      e.email    = 'Required';
    if (!form.phone.trim())      e.phone    = 'Required';
    if (!form.address.trim())    e.address  = 'Required';
    if (!form.paymentMethod)     e.paymentMethod = 'Select one';
    setErr(e);
    return !Object.keys(e).length;
  };

  const confirm = async () => {
    if (!cart.length) {
      Alert.alert('Cart is empty', 'Add items first.');
      return;
    }
    if (!validate()) return;

    const order = {
      id: Date.now(),
      meals: cart,
      total: total(),
      date: new Date().toLocaleString(),
      customer: { ...form },
    };
    await saveOrder(order);

    await AsyncStorage.removeItem('currentCart');
    addNotification(`Completed order on ${order.date}`);

    Alert.alert('Success', '🎉 Order confirmed!', [
      { text: 'OK', onPress: () => navigation.navigate('Order') },
    ]);
  };

  const renderMeal = ({ item }) => (
    <View style={[styles.row, { backgroundColor: theme.colors.card }]}>
      <Image
        source={mealImages[item.image.replace('.png','')]}
        style={styles.thumb}
      />
      <View>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={{ color: theme.colors.text }}>
          £{(item.price * (item.quantity || 1)).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const Header = () => (
    <View style={styles.headerContainer}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      <Text style={[styles.headerText, { color: theme.colors.text }]}>
        Checkout
      </Text>
    </View>
  );

  const Footer = () => (
    <View style={styles.footerContainer}>
      <Text style={[styles.total, { color: theme.colors.text }]}>
        Total: £{total().toFixed(2)}
      </Text>

      <View style={styles.form}>
        {['fullName','email','phone','address'].map(f => (
          <View key={f} style={{ marginBottom:12 }}>
            <TextInput
              placeholder={f[0].toUpperCase()+f.slice(1)}
              placeholderTextColor={theme.colors.placeholder}
              style={[
                styles.input,
                { backgroundColor: theme.colors.card, color: theme.colors.text },
              ]}
              value={form[f]}
              onChangeText={t => setForm(s => ({ ...s, [f]: t }))}
            />
            {err[f] && <Text style={styles.error}>{err[f]}</Text>}
          </View>
        ))}

        <Text style={[styles.label, { color: theme.colors.text }]}>
          Payment Method
        </Text>
        <View style={styles.payRow}>
          {PAYMENT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.payBtn,
                {
                  borderColor:
                    form.paymentMethod === opt.id
                      ? theme.colors.primary
                      : theme.colors.border,
                  backgroundColor: theme.colors.card,
                },
              ]}
              onPress={() => {
                setForm(s => ({ ...s, paymentMethod: opt.id }));
                setErr(e => ({ ...e, paymentMethod: null }));
              }}
            >
              <Image source={opt.logo} style={styles.logo} />
            </TouchableOpacity>
          ))}
        </View>
        {err.paymentMethod && <Text style={styles.error}>{err.paymentMethod}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.confirm, { backgroundColor: theme.colors.primary }]}
        onPress={confirm}
      >
        <Text style={styles.confirmTxt}>Confirm Order</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={cart}
      renderItem={renderMeal}
      keyExtractor={i => i.id.toString()}
      ListHeaderComponent={Header}
      ListFooterComponent={Footer}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <Text style={[styles.empty, { color: theme.colors.placeholder }]}>
          Cart is empty.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container:        { padding: 20 },
  headerContainer:  { marginBottom: 20 },
  headerText:       { fontSize: 24, fontWeight: '600', textAlign: 'center' },
  row:              { flexDirection: 'row', alignItems: 'center', borderRadius: 6, padding: 10, marginBottom: 10, elevation: 1 },
  thumb:            { width: 50, height: 50, borderRadius: 4, marginRight: 12 },
  name:             { fontSize: 16, fontWeight: '500' },
  total:            { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginBottom: 20 },
  form:             { marginBottom: 20 },
  input:            { borderRadius: 6, padding: 10, elevation: 1 },
  label:            { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  error:            { color: 'red', fontSize: 12, marginTop: 4 },
  payRow:           { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  payBtn:           { flex: 1, marginHorizontal: 4, borderRadius: 6, borderWidth: 1, padding: 10, alignItems: 'center' },
  logo:             { width: 40, height: 24, resizeMode: 'contain' },
  confirm:          { height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  confirmTxt:       { color: '#FFF', fontSize: 16, fontWeight: '600' },
  empty:            { textAlign: 'center', marginTop: 60, fontSize: 16 },
});
