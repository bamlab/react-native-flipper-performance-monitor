/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {
  killJSThread,
  killUIThread,
} from 'react-native-flipper-performance-plugin';

const Button = ({title, onPress, style}) => (
  <TouchableOpacity
    style={[
      {
        padding: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
      },
      style,
    ]}
    onPress={onPress}>
    <Text style={{fontSize: 40, color: 'white'}}>{title}</Text>
  </TouchableOpacity>
);

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        style={{
          padding: 20,
          height: '50%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#eee',
        }}>
        <Button
          title={'KILL JS ☠️'}
          onPress={() => killJSThread(40)}
          style={{marginBottom: 40, backgroundColor: '#1565c0'}}
        />
        <Button
          title={'KILL UI ☠️'}
          onPress={() => killUIThread(40)}
          style={{backgroundColor: '#7b1fa2'}}
        />
      </View>
    </SafeAreaView>
  );
};

export default App;
