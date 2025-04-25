import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);

  /* -------- load from storage on mount -------- */
  useEffect(() => {
    AsyncStorage.getItem('notifications').then(v =>
      setNotes(v ? JSON.parse(v) : [])
    );
  }, []);

  /* -------- helpers -------- */
  const persist = list =>
    AsyncStorage.setItem('notifications', JSON.stringify(list));

  /** Push a new unread notification (allowed types only) */
  const addNotification = msg => {
    const note = {
      id: Date.now(),
      message: msg,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    const updated = [note, ...notes];
    setNotes(updated);
    persist(updated);
  };

  /** Mark one as read */
  const markRead = id => {
    const updated = notes.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotes(updated);
    persist(updated);
  };

  /** Mark all as read */
  const markAllRead = () => {
    const updated = notes.map(n => ({ ...n, read: true }));
    setNotes(updated);
    persist(updated);
  };

  return (
    <NotificationContext.Provider
      value={{ notes, addNotification, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
