import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Colors } from "@/constants/Colors";
import Button from '../baseComponets/Button';
import { checkInEvent, checkOutEvent } from '@/services/event.service';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function CheckInOutModal(props: Props) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = async ({ data }: any) => {
        if (scanned) return;

        setScanned(true);

        const regex = /\/event\/([^/]+)\/(check-in|check-out)\/([^/]+)/;
        const match = data.match(regex);

        if (match) {
            const eventId = match[1];
            const volunteerId = match[3];
            const actionType = match[2];

            try {
                if (actionType === 'check-in') {
                    await checkInEvent(eventId, volunteerId);
                    Alert.alert('Check-in realizado com sucesso!');
                } else if (actionType === 'check-out') {
                    await checkOutEvent(eventId, volunteerId);
                    Alert.alert('Check-out realizado com sucesso!');
                }
            } catch (error) {
                Alert.alert('Erro', `Não foi possível realizar a ação: ${error}`);
            }
        } else {
            Alert.alert('QR Code inválido', 'O QR Code não é válido para check-in ou check-out.');
        }
    };

    const handleScanAnother = () => {
        setScanned(false);
    };

    if (hasPermission === null) {
        return <Text>Solicitando permissão para acessar a câmera...</Text>;
    }
    if (hasPermission === false) {
        return <Text>Sem permissão para acessar a câmera!</Text>;
    }

    return (
        <Modal
            visible={props.visible}
            animationType="slide"
            transparent={false}
            onRequestClose={props.onClose}
        >
            <View style={styles.pageColor}>
                <View style={styles.container}>

                    <View style={styles.headerRow}>
                        <Text style={styles.headerTitle}>Check-in/Check-out</Text>
                        <TouchableOpacity onPress={props.onClose}>
                            <Ionicons name="close" size={30} color={Colors.gray} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.description}>
                        Aponte a câmera do seu celular para o QR Code da inscrição para fazer o check-in ou check-out do voluntário.
                    </Text>

                    <View style={styles.cameraContainer}>
                        {!scanned ? (
                            <CameraView
                                style={StyleSheet.absoluteFillObject}
                                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                                barcodeScannerSettings={{
                                    barcodeTypes: ["qr", "pdf417"],
                                }}
                            />
                        ) : (
                            <View style={styles.buttonContainer}>
                                <Button
                                    title='Escanear Outro QR Code'
                                    onPress={handleScanAnother}
                                    backgroundColor={Colors.white}
                                    textColor={Colors.gray}
                                    borderColor={Colors.gray}
                                    borderRadius={10}
                                    width={300}
                                    height={70}
                                    fontSize={20}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    headerRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        marginTop: 15,
        fontSize: 22,
        fontWeight: 'bold',
    },
    infoContainer: {
        marginBottom: 20,
        alignItems: 'flex-start',
        width: '100%',
    },
    title: {
        width: '100%',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'left',
        color: Colors.orange,
    },
    description: {
        fontSize: 16,
        textAlign: 'left',
        color: Colors.gray,
    },
    pageColor: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    cameraContainer: {
        justifyContent: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
        height: 350,
        width: '100%',
        marginTop: 60,
    },
    buttonContainer: {
        marginBottom: 20,
    },
});
