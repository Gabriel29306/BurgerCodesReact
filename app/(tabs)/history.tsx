import React, { useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Collapsible } from '@/components/Collapsible';
import { ThemedButton } from '@/components/ThemedButton';

export default function TabTwoScreen() {
  let { dark } = useTheme();
  const [qrcodes, setQrcodes] = useState<{ value: string; type: string }[]>([]);
  const [selected, setSelected] = useState<{ value: string; type: string }>();
  const [qrCodeSize, setQrCodeSize] = useState<number>(0);

  const fetchQrcodes = async () => {
    const storedQrcodes = await AsyncStorage.getItem('qrcodes');
    if (storedQrcodes) {
      setQrcodes(JSON.parse(storedQrcodes));
    }
  };

  useNavigation().addListener('focus', () => {
    fetchQrcodes();
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#ed7902', dark: '#974c02' }}
      headerImage={
        <IconSymbol
          size={250}
          color={dark ? '#ed7902' : '#974c02'}
          name="qrcode"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={[styles.titleContainer, {width: qrCodeSize}]}>
        <ThemedText type="title" style={{textAlignVertical: "center"}}>Historique</ThemedText>
        <ThemedButton onPress={fetchQrcodes}>
          <IconSymbol
            name="arrow.clockwise"
            size={20}
            color="white"
          />
        </ThemedButton>
      </ThemedView>
      <ThemedView onLayout={(event) => {setQrCodeSize(event.nativeEvent.layout.width);}}>
        {(() => {
          const groupedQrcodes: { [type: string]: string[] } = {};
          qrcodes.forEach((code) => {
            if (!groupedQrcodes[code.type]) {
              groupedQrcodes[code.type] = [];
            }
            groupedQrcodes[code.type].push(code.value);
          });

          return Object.entries(groupedQrcodes).map(([type, values]) => (
            <ThemedView key={type} style={{ marginBottom: 10 }}>
              <Collapsible title={type}>
                {values.map((value, index) => (
                  <ThemedText key={index} onPress={() => setSelected({ value, type })} style={{ marginVertical: 5 }}>
                    - {value}
                  </ThemedText>
                ))}
              </Collapsible>
            </ThemedView>
          ));
        })()}
    </ThemedView>
    {selected && (
      <>
        <QRCode
          value={selected.value}
          size={qrCodeSize}
        />
        <ThemedText type="subtitle" style={{
          marginTop: 8,
          textAlign: "center",
          backgroundColor: "transparent",
        }}>
          {selected.value}
          {selected.type === "Viande" ? " 🥩" : " 🥗"}
        </ThemedText>
      </>
    )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -100,
    left: -25,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    width: '100%',
  },
});
