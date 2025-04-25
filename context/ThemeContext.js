import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved preference
  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(val => {
      if (val !== null) setDarkMode(val === 'true');
    });
  }, []);

  const toggleTheme = async () => {
    const next = !darkMode;
    setDarkMode(next);
    await AsyncStorage.setItem('darkMode', next.toString());
  };

  const theme = {
    dark: darkMode,
    colors: {
      background: darkMode ? '#121212' : '#F2F2F2',
      card:       darkMode ? '#1E1E1E' : '#FFF',
      text:       darkMode ? '#FFF'     : '#333',
      primary:    '#e91e63',
      secondary:  '#2196F3',
      border:     darkMode ? '#272727' : '#CCC',
      placeholder: darkMode ? '#888'   : '#AAA',
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
