import React, { useState } from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Carousel from "react-native-reanimated-carousel";
import AsyncStorage from '@react-native-async-storage/async-storage';

import ParallaxScrollView from "@/components/ParallaxScrollView";
import RandomBackground from "@/components/RandomBackground";
import SlideButtonSelector, { SelectorInput } from "@/components/SlideButtonSelector";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { generateCodes } from "@/api";
import { useNavigation } from "expo-router";
import { OfferNotAvailableError } from "@/api/errors";
import { IconSymbol } from "@/components/ui/IconSymbol";


export default function GenerateScreen() {
  const bugerInput: SelectorInput = [
    {
      text: "Viande",
      icon: <ThemedText>🥩</ThemedText>,
    },
    {
      text: "Veggie",
      icon: <ThemedText>🥗</ThemedText>,
    }
  ];
  const numberOfBurgersInput: SelectorInput = ["2", "4", "6", "8", "10", "20"];

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [oldQrCode, setOldQrCode] = useState<{value: string, type: string}[]>([]);
  const [qrcodes, setQrcodes] = useState<{value: string, type: string}[]>([]);
  const [carrouselWidth, setCarrouselWidth] = useState<number>(Dimensions.get("window").width);
  const [progress, setProgress] = useState<number>(1);

  const [bugerType, setBugerType] = useState<string>(bugerInput[0].text);
  const [numberOfBurgers, setNumberOfBurgers] = useState<string>(numberOfBurgersInput[0]);

  const fetchQrcodes = async () => {
    const storedQrcodes = await AsyncStorage.getItem('qrcodes');
    if (storedQrcodes) {
      setOldQrCode(JSON.parse(storedQrcodes));
    }
  };

  useNavigation().addListener('focus', () => {
    fetchQrcodes();
  });

  const handlePress = async () => {
    setLoading(true);
    const iterations = parseInt(numberOfBurgers) / 2;
    for (let i = 0; i < iterations; i++) {
      try {
        let codes = await generateCodes(bugerType === "Viande" ? "B" : "V");
        let newCodes = [{value: codes.firstCode, type: bugerType}, {value: codes.secondCode, type: bugerType}];
        setQrcodes((prevQrcodes) => prevQrcodes.concat(newCodes));
        if (i != iterations) await new Promise((resolve) => setTimeout(resolve, 1000)); // Pour éviter de spammer l'API
      } catch (error) {
        if (error instanceof OfferNotAvailableError) {
          setErrorMessage("L'offre n'est pas disponible, revenez plus tard.");
        } else {
          setErrorMessage("Une erreur est survenue:\n" + error);
        }
        return;
      }
    }
    await AsyncStorage.setItem("qrcodes", JSON.stringify(qrcodes.concat(oldQrCode)));
    setLoading(false);
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#ed7902", dark: "#974c02" }}
      headerImage={
        <ThemedText style={{
          fontSize: 140,
          margin: 8,
          height: 150,
          bottom: -25,
          left: -25,
          position: "absolute",
          textAlignVertical: "bottom",
        }}>😋</ThemedText>
      }
      style={{minHeight: Dimensions.get("window").height - 250}}
    >
      <View style={styles.backgroundLayer}>
        <RandomBackground />
      </View>
      <View style={{zIndex: 2, backgroundColor: "transparent"}}>
        {errorMessage !== "" && (
          <ThemedView style={[styles.stepContainer, styles.errorContainer]} lightColor={"#ed7902"} darkColor={"#974c02"}>
            <IconSymbol name="multiply.circle" size={20} color="white" />
            <ThemedText style={{flex: 1}} lightColor="white" darkColor="black">{errorMessage}</ThemedText>
          </ThemedView>
        )}
        <ThemedText type="title">Générer des codes</ThemedText>
        <ThemedText type="subtitle">Sélectionnes le type de code à générer:</ThemedText>
        <SlideButtonSelector selected={bugerType} setSelected={setBugerType} inputs={bugerInput}/>
        <ThemedText type="subtitle">Sélectionnes le nombre de code à générer:</ThemedText>
        <SlideButtonSelector selected={numberOfBurgers} setSelected={setNumberOfBurgers} inputs={numberOfBurgersInput} />
        <ThemedButton style={{gap: 8, marginBottom: 8}} onPress={handlePress}>
          {loading && (
            <ActivityIndicator size="small" color="#fff" />
          )}
          <ThemedText lightColor="white">
            Go!
          </ThemedText>
        </ThemedButton>
        {qrcodes.length > 0 && (
          <ThemedView style={[styles.stepContainer, {overflow: "hidden"}]} onLayout={(event) => {setCarrouselWidth(event.nativeEvent.layout.width)}}>
            <Carousel
              width={carrouselWidth}
              height={carrouselWidth + 40}
              data={qrcodes}
              onProgressChange={(_a, b) => {setProgress(Math.round(b) + 1)}}
              renderItem={({ index }) => (
                <>
                  <View style={{width: carrouselWidth, padding: 10, backgroundColor: "#fff"}}>
                    <QRCode
                      value={qrcodes[index].value}
                      size={carrouselWidth - 20}
                    />
                  </View>
                  <ThemedText type="subtitle" style={{
                    marginTop: 8,
                    textAlign: "center",
                    backgroundColor: "transparent",
                  }}>
                    {qrcodes[index].value}
                    {qrcodes[index].type === "Viande" ? " 🥩" : " 🥗"}
                  </ThemedText>
                </>
              )}
              loop={false}
            >
            </Carousel>
            <ThemedText style={{textAlign: "center"}}>{progress} / {qrcodes.length}</ThemedText>
          </ThemedView>
        )}
      </View>
    </ParallaxScrollView>
  );
}


const styles = StyleSheet.create({
  backgroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  errorContainer: {
    borderRadius: 8,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
  }
});
