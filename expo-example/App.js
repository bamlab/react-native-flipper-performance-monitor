import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

import {
  killJSThread,
  killUIThread,
} from "react-native-flipper-performance-plugin";

const Button = ({ title, onPress, style, testID }) => (
  <TouchableOpacity
    style={[
      {
        padding: 10,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
      },
      style,
    ]}
    testID={testID}
    onPress={onPress}
  >
    <Text style={{ fontSize: 40, color: "white" }}>{title}</Text>
  </TouchableOpacity>
);

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          padding: 20,
          height: "50%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee",
        }}
      >
        <Button
          title={"KILL JS ☠️"}
          testID="com.example/kill_js"
          onPress={() => killJSThread(40)}
          style={{ marginBottom: 40, backgroundColor: "#1565c0" }}
        />
        <Button
          title={"KILL UI ☠️"}
          testID="com.example/kill_ui"
          onPress={() => killUIThread(40)}
          style={{ backgroundColor: "#7b1fa2" }}
        />
      </View>
    </SafeAreaView>
  );
};

export default App;
