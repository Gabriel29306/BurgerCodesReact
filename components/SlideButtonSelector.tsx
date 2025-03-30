import React, { useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity, View, StyleSheet, LayoutChangeEvent } from "react-native";
import { ThemedText } from "./ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

type SelectorInputText = string[];
type SelectorInputIcon = {
  icon: React.ReactElement;
  text: string;
}[];

export type SelectorInput = 
  | SelectorInputText
  | SelectorInputIcon;


export default function SlideButtonSelector(
  {selected, setSelected, inputs, lightColor, darkColor}:
  { selected: any, setSelected: React.Dispatch<React.SetStateAction<any>>, inputs: SelectorInput, lightColor?: string, darkColor?: string }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  const selectorBackgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "tint");

  let [viewWidth, setViewWidth] = useState(0);
  let [buttonWidth, setButtonWidth] = useState(0);

  const toggle = (valueIndex: any) => {
    if (typeof inputs[valueIndex] !== "object") {
      setSelected(inputs[valueIndex]);
    } else {
      setSelected(inputs[valueIndex].text);
    }
  };

  useEffect(() => {
    let toValue: number;
    if (typeof inputs[0] !== "object") {
      toValue = inputs.indexOf(selected);
    } else {
      // @ts-expect-error
      toValue = inputs.indexOf(inputs.find((input) => input.text === selected));
    }
    Animated.timing(animatedValue, {
      toValue: toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const backgroundPosition = animatedValue.interpolate({
    inputRange: [0, inputs.length - 1],
    outputRange: [0, (viewWidth - ((1/inputs.length) * viewWidth))], // Ajustez selon la largeur du conteneur
  });

  const onLayout = (event: LayoutChangeEvent) => {
    setViewWidth(event.nativeEvent.layout.width);
    setButtonWidth(event.nativeEvent.layout.width / inputs.length);
  }

  return (
    <View style={[styles.container, {borderColor: selectorBackgroundColor}]} onLayout={onLayout}>
      <Animated.View style={
        [
          styles.background,
          {
            left: backgroundPosition,
            backgroundColor: selectorBackgroundColor,
            width: buttonWidth
          }
        ]
      }/>
      {inputs.map((value, index) => (
        <TouchableOpacity style={[styles.button, {width: buttonWidth}]} onPress={() => toggle(index)} key={"selector" + value + index}>
          {typeof value === "object" ? (
            <View style={{flexDirection: "row", alignItems: "center"}}>
              {value.icon}
              <ThemedText  style={[styles.text, selected == value.text && styles.selectedText]}>{value.text}</ThemedText>
            </View>
          ) : (
            <ThemedText style={[styles.text, selected == value && styles.selectedText]}>{value}</ThemedText>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 100,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    marginVertical: 16,
  },
  background: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 100,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    padding: 10,
    animationDelay: "2s",
    animationName: "fadeIn",
  },
  selectedText: {
    fontWeight: "bold",
    color: "#fff"
  },
});
