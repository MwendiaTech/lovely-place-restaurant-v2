// screens/SettingsScreen.js
import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { ThemeContext } from '../context/ThemeContext';

const LANG_KEY = 'language';
const FONT_KEY = 'fontSize';
const PAYMENT_KEY = 'defaultPayment';
const REORDER_KEY = 'autoReorder';
const REORDER_INT_KEY = 'reorderInterval';
const OFFLINE_KEY = 'offlineMode';
const BIO_AUTH_KEY = 'biometricAuth';

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage]         = useState('en');
  const [fontSize, setFontSize]         = useState(16);
  const [defaultPayment, setDefaultPayment] = useState('Card');
  const [autoReorder, setAutoReorder]   = useState(false);
  const [reorderInterval, setReorderInterval] = useState('Weekly');
  const [offlineMode, setOfflineMode]   = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([
      'notifications',
      LANG_KEY, FONT_KEY,
      PAYMENT_KEY,
      REORDER_KEY, REORDER_INT_KEY,
      OFFLINE_KEY, BIO_AUTH_KEY
    ]).then(results => {
      const map = Object.fromEntries(results);
      if (map.notifications!=null)   setNotifications(map.notifications==='true');
      if (map[LANG_KEY])             setLanguage(map[LANG_KEY]);
      if (map[FONT_KEY])             setFontSize(parseFloat(map[FONT_KEY]));
      if (map[PAYMENT_KEY])          setDefaultPayment(map[PAYMENT_KEY]);
      if (map[REORDER_KEY]!=null)    setAutoReorder(map[REORDER_KEY]==='true');
      if (map[REORDER_INT_KEY])      setReorderInterval(map[REORDER_INT_KEY]);
      if (map[OFFLINE_KEY]!=null)    setOfflineMode(map[OFFLINE_KEY]==='true');
      if (map[BIO_AUTH_KEY]!=null)   setBiometricAuth(map[BIO_AUTH_KEY]==='true');
    });
  }, []);

  const persist = async (key, val) => {
    await AsyncStorage.setItem(key, val.toString());
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear Order History',
      'Delete all past orders?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, clear',
          style: 'destructive',
          onPress: () => {
            AsyncStorage.removeItem('orders');
            Alert.alert('Done', 'Past orders cleared.');
          }
        }
      ]
    );
  };

  const resetApp = () => {
    Alert.alert(
      'Reset App',
      'This clears all data and settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Reset', 'App reset. Please restart.');
          }
        }
      ]
    );
  };

  const rateUs = () => {
    const url = 'https://example.com/your-app-store-page';
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Cannot open link.'));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      <Text style={[styles.header, { color: theme.colors.text }]}>Settings</Text>

      {/* View Notifications */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Notifications')}
      >
        <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
          View Notifications
        </Text>
      </TouchableOpacity>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Appearance
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Dark Mode
          </Text>
          <Switch
            value={theme.dark}
            onValueChange={toggleTheme}
            trackColor={{ false:'#767577', true:theme.colors.primary }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Font Size
          </Text>
          <Slider
            style={{ flex: 1 }}
            minimumValue={12}
            maximumValue={24}
            step={1}
            value={fontSize}
            onValueChange={val => {
              setFontSize(val);
              persist(FONT_KEY, val);
            }}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
          />
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {fontSize}
          </Text>
        </View>
      </View>

      {/* Localization */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Language
        </Text>
        <Picker
          selectedValue={language}
          onValueChange={val => {
            setLanguage(val);
            persist(LANG_KEY, val);
          }}
          style={[styles.picker, { backgroundColor: theme.colors.card }]}
          dropdownIconColor={theme.colors.text}
        >
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Swahili" value="sw" />
          <Picker.Item label="Spanish" value="es" />
        </Picker>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Preferences
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Push Notifications
          </Text>
          <Switch
            value={notifications}
            onValueChange={val => {
              setNotifications(val);
              persist('notifications', val);
            }}
            trackColor={{ false:'#767577', true:theme.colors.secondary }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Offline Mode
          </Text>
          <Switch
            value={offlineMode}
            onValueChange={val => {
              setOfflineMode(val);
              persist(OFFLINE_KEY, val);
            }}
            trackColor={{ false:'#767577', true:theme.colors.secondary }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Biometric Auth
          </Text>
          <Switch
            value={biometricAuth}
            onValueChange={val => {
              setBiometricAuth(val);
              persist(BIO_AUTH_KEY, val);
            }}
            trackColor={{ false:'#767577', true:theme.colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Ordering */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Ordering
        </Text>
        <Text style={[styles.labelSmall, { color: theme.colors.text }]}>
          Default Payment
        </Text>
        <Picker
          selectedValue={defaultPayment}
          onValueChange={val => {
            setDefaultPayment(val);
            persist(PAYMENT_KEY, val);
          }}
          style={[styles.picker, { backgroundColor: theme.colors.card }]}
          dropdownIconColor={theme.colors.text}
        >
          <Picker.Item label="Credit Card" value="Card" />
          <Picker.Item label="Apple Pay"    value="Apple Pay" />
          <Picker.Item label="Google Pay"   value="Google Pay" />
          <Picker.Item label="PayPal"       value="PayPal" />
        </Picker>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Auto-Reorder Favorites
          </Text>
          <Switch
            value={autoReorder}
            onValueChange={val => {
              setAutoReorder(val);
              persist(REORDER_KEY, val);
            }}
            trackColor={{ false:'#767577', true:theme.colors.primary }}
            thumbColor="#fff"
          />
        </View>
        {autoReorder && (
          <View style={styles.row}>
            <Text style={[styles.labelSmall, { color: theme.colors.text }]}>
              Frequency
            </Text>
            <Picker
              selectedValue={reorderInterval}
              onValueChange={val => {
                setReorderInterval(val);
                persist(REORDER_INT_KEY, val);
              }}
              style={[styles.pickerSmall, { backgroundColor: theme.colors.card }]}
              dropdownIconColor={theme.colors.text}
            >
              <Picker.Item label="Daily"   value="Daily" />
              <Picker.Item label="Weekly"  value="Weekly" />
              <Picker.Item label="Monthly" value="Monthly" />
            </Picker>
          </View>
        )}
      </View>

      {/* Advanced */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Advanced
        </Text>
        <TouchableOpacity style={styles.button} onPress={clearHistory}>
          <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
            Clear Order History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={rateUs}>
          <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
            Rate Us
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={resetApp}>
          <Text style={[styles.buttonText, { color: 'red' }]}>
            Reset App
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20 },
  header: { fontSize:24, fontWeight:'600', marginBottom:20 },
  section: { marginBottom:24 },
  sectionTitle: { fontSize:16, fontWeight:'600', marginBottom:12 },
  label: { fontSize:16 },
  labelSmall: { fontSize:14, marginBottom:6 },
  value: { width:32, textAlign:'center' },
  picker: { borderRadius:6, marginBottom:12 },
  pickerSmall: { borderRadius:6, width:120 },
  row: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginBottom:12
  },
  button: { paddingVertical:12 },
  buttonText: { fontSize:16, fontWeight:'500' }
});
