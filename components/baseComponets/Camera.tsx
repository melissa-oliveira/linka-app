import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CameraComponent() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back); // Use `Camera.Constants.Type`
  const cameraRef = useRef<Camera | null>(null); // Referência para a câmera
  const navigation = useNavigation();

  // Solicita permissão para acessar a câmera
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Verifica se a permissão foi negada
  if (hasPermission === false) {
    return <Text>Sem permissão para acessar a câmera</Text>;
  }

  // Tira uma foto e navega de volta para a tela anterior
  const handleTakePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      Alert.alert('Foto Capturada!', `Foto tirada: ${photo.uri}`);
      navigation.goBack(); // Retorna à tela anterior
    }
  };

  return (
    <View style={styles.container}>
      {/* Se a permissão ainda não foi obtida, não renderiza a câmera */}
      {hasPermission ? (
        <Camera style={styles.camera} type={cameraType} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePicture}
            >
              <Ionicons name="camera" size={36} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      ) : (
        <Text>Solicitando permissão para usar a câmera...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
  },
  captureButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 50,
  },
});
