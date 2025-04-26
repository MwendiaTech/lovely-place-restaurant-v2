// screens/CompletedOrderScreen.js
import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import FontAwesome            from 'react-native-vector-icons/FontAwesome';
import { ThemeContext }       from '../context/ThemeContext';
import mealImages             from '../assets/images/meals';

export default function CompletedOrderScreen({ route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const order     = route.params.completedOrder;

  const renderItem = ({ item }) => (
    <View style={[styles.itemRow, { backgroundColor: theme.colors.card }]}>
      <Image
        source={mealImages[item.image.replace('.png','')]}
        style={styles.thumb}
      />
      <View>
        <Text style={[styles.itemName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={{ color: theme.colors.text }}>
          £{item.price.toFixed(2)} × {item.quantity || 1}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <Text style={[styles.title, { color: theme.colors.text }]}>
        Order #{order.id}
      </Text>
      <Text style={[styles.date, { color: theme.colors.text }]}>
        📅 {order.date}
      </Text>

      {order.rating != null && (
        <View style={styles.ratingRow}>
          {[1,2,3,4,5].map(i => (
            <FontAwesome
              key={i}
              name="star"
              size={20}
              color={i <= order.rating ? '#FFC107' : '#E0E0E0'}
              style={{ marginRight: 4 }}
            />
          ))}
        </View>
      )}

      <FlatList
        data={order.meals}
        renderItem={renderItem}
        keyExtractor={m => m.id.toString()}
        style={styles.list}
      />

      <Text style={[styles.total, { color: theme.colors.text }]}>
        Total Paid: £{order.total.toFixed(2)}
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Customer Details
        </Text>
        <Text style={{ color: theme.colors.text }}>
          Name: {order.customer.fullName}
        </Text>
        <Text style={{ color: theme.colors.text }}>
          Email: {order.customer.email}
        </Text>
        <Text style={{ color: theme.colors.text }}>
          Phone: {order.customer.phone}
        </Text>
        <Text style={{ color: theme.colors.text }}>
          Address: {order.customer.address}
        </Text>
        <Text style={{ color: theme.colors.text }}>
          Paid with: {order.customer.paymentMethod}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.replace('MainTabs')}
      >
        <Text style={styles.buttonText}>Place New Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, padding: 20 },
  title:         { fontSize: 24, fontWeight: '600', marginBottom: 4 },
  date:          { fontSize: 16, marginBottom: 8 },
  ratingRow:     { flexDirection: 'row', marginBottom: 12 },
  list:          { marginBottom: 20 },
  itemRow:       { flexDirection: 'row', padding: 10, borderRadius: 6, marginBottom: 10, alignItems: 'center', elevation: 2 },
  thumb:         { width: 50, height: 50, borderRadius: 4, marginRight: 12 },
  itemName:      { fontSize: 16, fontWeight: '500' },
  total:         { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginBottom: 20 },
  section:       { marginBottom: 20 },
  sectionTitle:  { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  button:        { padding: 14, borderRadius: 6, alignItems: 'center', elevation: 2 },
  buttonText:    { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
