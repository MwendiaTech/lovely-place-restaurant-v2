import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { ThemeContext }        from '../context/ThemeContext';
import { NotificationContext } from '../context/NotificationContext';

export default function NotificationsScreen() {
  const { theme }                      = useContext(ThemeContext);
  const { notes, markRead, markAllRead } = useContext(NotificationContext);

  /* ---------- single entry ---------- */
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.item,
        {
          backgroundColor: item.read ? theme.colors.card : '#FFFBE6',
          borderColor:     item.read ? theme.colors.border : '#FFCA28',
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.msg,  { color: theme.colors.text }]}>{item.message}</Text>
        <Text style={[styles.time, { color: theme.colors.placeholder }]}>
          {item.timestamp}
        </Text>
      </View>
      {!item.read && (
        <TouchableOpacity onPress={() => markRead(item.id)} style={styles.markBtn}>
          <Text style={styles.markTxt}>Mark&nbsp;read</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      {/* -------- mark all bar -------- */}
      {!!notes.find(n => !n.read) && (
        <TouchableOpacity onPress={markAllRead} style={[styles.allBar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.allTxt}>Mark&nbsp;all&nbsp;as&nbsp;read</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notes}
        keyExtractor={n => n.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.placeholder }]}>
            No notifications.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20 },
  item:{ flexDirection:'row', alignItems:'center', borderWidth:1, borderRadius:6, padding:12, marginBottom:10 },
  msg:{ fontSize:16, marginBottom:4, flexShrink:1 },
  time:{ fontSize:12 },
  markBtn:{ marginLeft:10, paddingVertical:4, paddingHorizontal:8, borderRadius:6, backgroundColor:'#4CAF50' },
  markTxt:{ color:'#FFF', fontSize:12 },
  allBar:{ padding:8, borderRadius:6, alignItems:'center', marginBottom:12 },
  allTxt:{ color:'#FFF', fontWeight:'600' },
  empty:{ marginTop:40, textAlign:'center', fontSize:16 },
});
