// navigation/AppNavigator.js
import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator }       from '@react-navigation/stack';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';
import { Ionicons }                   from '@expo/vector-icons';

import { ThemeProvider, ThemeContext }         from '../context/ThemeContext';
import { NotificationProvider }                from '../context/NotificationContext';

import LandingScreen            from '../screens/LandingScreen';
import MealsScreen              from '../screens/MealsScreen';
import OrderScreen              from '../screens/OrderScreen';
import CheckoutScreen           from '../screens/CheckoutScreen';
import SettingsScreen           from '../screens/SettingsScreen';
import NotificationsScreen      from '../screens/NotificationsScreen';
import CompletedOrderScreen     from '../screens/CompletedOrderScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// The bottom tabs: Menu, Cart, Pay, Settings
function MainTabs() {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Meals')    iconName = focused ? 'menu'                   : 'menu-outline';
          if (route.name === 'Order')    iconName = focused ? 'cart'                   : 'cart-outline';
          if (route.name === 'Checkout') iconName = focused ? 'checkmark-circle'       : 'checkmark-circle-outline';
          if (route.name === 'Settings') iconName = focused ? 'settings'               : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor:   theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.placeholder,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor:  theme.colors.border,
        },
      })}
    >
      <Tab.Screen name="Meals"    component={MealsScreen}    options={{ title: 'Menu' }}     />
      <Tab.Screen name="Order"    component={OrderScreen}    options={{ title: 'Cart' }}     />
      <Tab.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Pay' }}      />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

// The root stack: Landing → MainTabs, plus modal/details screens
function AppNavigator() {
  const { theme } = useContext(ThemeContext);

  return (
    <NavigationContainer theme={theme.dark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: true, title: 'Notifications' }}
        />
        <Stack.Screen
          name="CompletedOrder"
          component={CompletedOrderScreen}
          options={{ headerShown: true, title: 'Order Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Wrap in Theme & Notification providers
export default function RootNavigator() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppNavigator />
      </NotificationProvider>
    </ThemeProvider>
  );
}
