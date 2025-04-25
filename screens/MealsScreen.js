// screens/MealsScreen.js
import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { ThemeContext }        from '../context/ThemeContext';
import { NotificationContext } from '../context/NotificationContext';
import { mealData }            from '../data/mealData';
import mealImages              from '../assets/images/meals';

const categories = ['All', ...new Set(mealData.map(m => m.category))];

export default function MealsScreen() {
  const { theme }           = useContext(ThemeContext);
  const { addNotification } = useContext(NotificationContext);

  const [meals, setMeals]       = useState([]);
  const [cart,  setCart]        = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('All');

  useFocusEffect(
    useCallback(() => {
      setMeals(mealData);
      AsyncStorage.getItem('currentCart').then(val =>
        setCart(val ? JSON.parse(val) : [])
      );
      setExpanded([]);
      setSearch('');
      setFilter('All');
    }, [])
  );

  const handleCartToggle = meal => {
    const exists = cart.some(m => m.id === meal.id);
    const updated = exists
      ? cart.filter(m => m.id !== meal.id)
      : [...cart, { ...meal, quantity: 1 }];

    setCart(updated);
    AsyncStorage.setItem('currentCart', JSON.stringify(updated));
    addNotification(`${exists ? 'Removed' : 'Added'} "${meal.name}" ${exists ? 'from' : 'to'} cart`);
  };

  const handleExpand = id =>
    setExpanded(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const shownMeals = meals.filter(item => {
    const byCat   = filter === 'All' || item.category === filter;
    const byQuery = item.name.toLowerCase().includes(search.toLowerCase());
    return byCat && byQuery;
  });

  const renderMeal = ({ item }) => {
    const inCart = cart.some(m => m.id === item.id);
    const isOpen = expanded.includes(item.id);
    const stars = [...Array(5)].map((_, i) => (
      <FontAwesome
        key={i}
        name="star"
        size={14}
        style={{ marginRight: 2 }}
        color={i < Math.floor(item.rating) ? '#FFC107' : '#E0E0E0'}
      />
    ));

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleExpand(item.id)}
        style={styles.cardWrapper}
      >
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Image
            source={mealImages[item.image.replace('.png','')]}
            style={styles.thumbnail}
          />

          <View style={styles.info}>
            <View style={styles.rowHeader}>
              <Text
                style={[styles.mealName, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.secondary },
                ]}
              >
                <Text style={[styles.badgeText, { color: theme.colors.card }]}>
                  {item.category}
                </Text>
              </View>
            </View>

            <Text
              style={[styles.desc, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>

            <View style={styles.rowMeta}>
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                £{item.price.toFixed(2)}
              </Text>
              <FontAwesome
                name="fire"
                size={14}
                style={{ marginRight: 4, color: theme.colors.primary }}
              />
              <Text style={[styles.cal, { color: theme.colors.text }]}>
                {item.calories} kcal
              </Text>
            </View>

            <View style={styles.rowMeta}>
              <View style={styles.stars}>{stars}</View>
              <Text style={[styles.reviews, { color: theme.colors.text }]}>
                {item.reviewCount} reviews
              </Text>
            </View>

            {isOpen && (
              <Text style={[styles.comment, { color: theme.colors.text }]}>
                “{item.topComment}”
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.cartBtn,
              {
                backgroundColor: inCart
                  ? theme.colors.border
                  : theme.colors.primary,
              },
            ]}
            onPress={() => handleCartToggle(item)}
          >
            <Text style={styles.cartBtnText}>
              {inCart ? 'Added' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />

      {/* TITLE */}
      <Text style={[styles.screenTitle, { color: theme.colors.text }]}>
        Menu
      </Text>

      {/* SEARCH */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <FontAwesome
          name="search"
          size={16}
          color={theme.colors.placeholder}
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Search dishes..."
          placeholderTextColor={theme.colors.placeholder}
          style={[styles.searchInput, { color: theme.colors.text }]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* CATEGORY PILLS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillBar}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.pill,
              {
                backgroundColor:
                  filter === cat
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
            onPress={() => setFilter(cat)}
          >
            <Text
              style={{
                color: filter === cat ? '#FFF' : theme.colors.text,
                fontSize: 12,
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MEALS LIST */}
      <FlatList
        data={shownMeals}
        keyExtractor={m => m.id.toString()}
        renderItem={renderMeal}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, paddingHorizontal: 20 },
  screenTitle:  { fontSize: 24, fontWeight: '700', marginTop: 50, marginBottom: 10 },

  searchBox:    {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    elevation: 2,
    marginBottom: 12,
  },
  searchInput:  { flex: 1, fontSize: 14 },

  pillBar:      { paddingBottom: 12 },
  pill: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardWrapper: { marginBottom: 12 },
  card:        { flexDirection: 'row', borderRadius: 10, padding: 10, elevation: 2 },
  thumbnail:   { width: 80, height: 80, borderRadius: 8, marginRight: 12 },

  info:        { flex: 1 },
  rowHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  mealName:    { fontSize: 16, fontWeight: '600', flexShrink: 1, marginRight: 8 },
  badge:       { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:   { fontSize: 10 },

  desc:        { fontSize: 12, marginBottom: 6 },
  rowMeta:     { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  price:       { fontSize: 14, fontWeight: 'bold', marginRight: 10 },
  cal:         { fontSize: 12 },
  stars:       { flexDirection: 'row', marginRight: 8 },
  reviews:     { fontSize: 12 },
  comment:     { marginTop: 6, fontSize: 12, fontStyle: 'italic' },

  cartBtn:     {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  cartBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
});
