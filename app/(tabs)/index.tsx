import React from "react";
import { Image, StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";




export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#ed7902", dark: "#974c02" }}
      headerImage={
        <Image
          source={require("@/assets/images/logo-bk-banner.png")}
          style={styles.bugerkingLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Bienvenu !</ThemedText>
        <ThemedText type="subtitle">Profiter de codes illimités sans restrictions !</ThemedText>
      </ThemedView>
      <ThemedView>
        <ThemedText type="subtitle">Pour générer tes codes, ça se passe par là:</ThemedText>
        <Link href={"/(tabs)/generate"}>
          <ThemedText type="link">IcI</ThemedText>
        </Link>
      </ThemedView>
      
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 8,
  },
  bugerkingLogo: {
    margin: 8,
    height: 178,
    width: 164,
    bottom: -75,
    left: 0,
    position: "absolute",
    objectFit: "contain"
  }
});
