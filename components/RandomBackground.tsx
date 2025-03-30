import React from "react";
import { useEffect, useState } from "react";
import { Dimensions, View, StyleSheet, Image } from "react-native";


// Définition des interfaces pour le typage
interface ImagePosition {
  top: number;
  left: number;
  direction: number;
};


export default function RandomBackground() {
  const [positions, setPositions] = useState<ImagePosition[]>([]);
    const windowWidth = Dimensions.get("window").width;
    const windowHeight = Dimensions.get("window").height;
    
    const imageCount = 60;
    
    const imageSize = windowWidth / 5 - 40;
    
    useEffect(() => {
      // Diviser l'écran en sections pour répartir les images
      const numColumns = 6;  // Nombre de colonnes dans notre grille virtuelle
      const numRows = Math.ceil(imageCount / numColumns);
      
      // Calculer la taille des cellules
      const cellWidth = windowWidth / numColumns;
      const cellHeight = windowHeight / numRows;
      
      const newPositions: ImagePosition[] = [];
      
      for (let i = 0; i < imageCount; i++) {
        // Déterminer la ligne et la colonne basées sur l'index
        const col = i % numColumns;
        const row = Math.floor(i / numColumns);
        
        // Position de base au centre de la cellule
        let baseX = col * cellWidth + cellWidth / 2 - imageSize / 2;
        let baseY = row * cellHeight + cellHeight / 2 - imageSize / 2;
        
        // Ajouter une variation aléatoire à l'intérieur de la cellule
        // mais en évitant de sortir des limites de la cellule
        const maxOffset = Math.min(cellWidth, cellHeight) * 0.3;
        const randomOffsetX = (Math.random() * 2 - 1) * maxOffset;
        const randomOffsetY = (Math.random() * 2 - 1) * maxOffset;
        
        // S'assurer que l'image reste dans les limites de l'écran
        baseX = Math.max(0, Math.min(windowWidth - imageSize, baseX + randomOffsetX));
        baseY = Math.max(0, Math.min(windowHeight - imageSize, baseY + randomOffsetY));
  
        const rotation = Math.random() * 360; // Rotation aléatoire entre 0 et 360 degrés
        
        newPositions.push({ top: baseY, left: baseX, direction: rotation });
      }
      
      setPositions(newPositions);
    }, [windowWidth, windowHeight]);

  return (
    <>
      {positions.map((position: ImagePosition, index: number) => (
        <View 
          key={index.toString()} 
          style={{ position: "absolute", top: position.top, left: position.left, transform: [{ rotate: `${position.direction}deg` }] }}
        >
          <Image 
            source={require("@/assets/images/logo-bk-banner.png")} 
            style={styles.image}
            blurRadius={30}
          />
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  image: {
    width: Dimensions.get("window").width / 5 - 40,
    height: Dimensions.get("window").width / 5 - 40,
    resizeMode: "contain",
    opacity: 0.7,
    borderRadius: 8,
  }
});
