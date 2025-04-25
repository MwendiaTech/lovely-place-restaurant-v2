// screens/LandingScreen.js
import React, { useLayoutEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  // Hide bottom tabs on this screen (if using React Navigation v6)
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  return (
    <ImageBackground
    source={require('../assets/images/image copy.png')}
    style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {/* Compact Logo */}
        <Image
          source={require('../assets/images/image.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>Welcome to Lovely Place</Text>
          <Text style={styles.subtitle}>
            Discover delicious meals and place your order easily
          </Text>

          <TouchableOpacity
            style={styles.roundButton}
            activeOpacity={0.8}
            onPress={() => navigation.replace('MainTabs')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        {/* Language Toggle */}
        <TouchableOpacity
          style={styles.langButton}
          onPress={() => {/* toggle locale logic */}}
        >
          <Text style={styles.langText}>EN / SW</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

const BUTTON_HEIGHT = 48;
const LOGO_SIZE = SCREEN_WIDTH * 0.3; // 30% of screen width

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignSelf: 'center',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginVertical: 8,
    color: '#FFD700',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#FFD700',
  },
  roundButton: {
    backgroundColor: '#4CAF50',
    borderRadius: BUTTON_HEIGHT / 2,
    height: BUTTON_HEIGHT,
    minWidth: 160,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  langButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    right: 20,
    padding: 6,
  },
  langText: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.8,
  },
});

export default LandingScreen;
