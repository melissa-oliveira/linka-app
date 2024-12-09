import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Colors } from "@/constants/Colors";

const MAX_FILE_SIZE_MB = 5;

interface Props {
    onPress: () => void;
    imageUri?: string;
    onEditPress: () => void;
    onImageSelect: (base64: string) => void;
    shape?: "rounded" | "square" | "default";
    inputHeight?: number;
    inputWidth?: number;
    resolutionHeight?: number;
    resolutionWidth?: number;
}

const getFileSize = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size / (1024 * 1024);
};

export default function ImageInput(props: Props) {

    const selectImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: !props.shape || props.shape == 'default' ? [2.4, 1] : [1, 1],
                quality: 1,
                base64: true,
            });

            if (!result.canceled) {
                const { base64, type, uri } = result.assets[0];
                if (!base64 || !type || !uri) {
                    Alert.alert("Erro", "Imagem inválida");
                    return;
                }

                // Redimensionar a imagem
                const manipResult = await ImageManipulator.manipulateAsync(
                    uri,
                    [{ resize: { width: props.resolutionWidth || 600, height: props.resolutionHeight || 600 } }],
                    { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
                );

                let { uri: resizedUri } = manipResult;
                let compress = 1;
                let fileSizeMB = await getFileSize(resizedUri);

                // Ajustar a qualidade para garantir que o arquivo seja menor que 5 MB
                while (fileSizeMB > MAX_FILE_SIZE_MB && compress > 0.1) {
                    compress -= 0.1; // Reduzir a qualidade
                    const newManipResult = await ImageManipulator.manipulateAsync(
                        uri,
                        [{ resize: { width: props.resolutionWidth || 600, height: props.resolutionHeight || 600 } }],
                        { compress, format: ImageManipulator.SaveFormat.JPEG }
                    );
                    resizedUri = newManipResult.uri;
                    fileSizeMB = await getFileSize(resizedUri);
                }

                // Converter a imagem redimensionada para base64
                const response = await fetch(resizedUri);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        const base64Image = reader.result.split(',')[1];
                        if (!isValidBase64(base64Image)) {
                            Alert.alert("Erro", "Imagem inválida (Base64)");
                            return;
                        }

                        props.onImageSelect(base64Image);
                    } else {
                        Alert.alert("Erro", "Erro ao ler imagem");
                    }
                };
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert("Erro ao selecionar imagem", error.message);
            } else {
                Alert.alert("Erro desconhecido ao selecionar mensagem");
            }
        }
    };

    const isValidBase64 = (string: string) => {
        const base64Pattern = /^[A-Za-z0-9+/=]+$/;
        return base64Pattern.test(string);
    };

    return (
        <View style={styles.container}>
            {props.imageUri ? (
                <View>
                    <Image source={{ uri: `data:image/png;base64,${props.imageUri}` }} style={[
                        styles.imagePreview,
                        props.shape == "rounded" || props.shape == "square" ? {
                            width: props.inputWidth || 150,
                            height: props.inputHeight || 150,
                        } : {
                            width: props.inputWidth || '100%',
                            height: props.inputHeight || 150,
                        },
                        props.shape == "rounded" ? {
                            borderRadius: 200,
                        } : {
                            borderRadius: 15,
                        }
                    ]} />
                    <TouchableOpacity style={
                        [styles.editButton,
                        props.shape == "rounded" || props.shape == "square" ? {
                            justifyContent: 'center',
                        } : {
                            justifyContent: 'flex-start',
                        },
                        ]} onPress={props.onEditPress}>
                        <Ionicons name="trash-outline" size={24} color={Colors.gray} />
                        <Text style={styles.editText}>Remover</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={[
                    styles.imageContainer,
                    props.shape == "rounded" || props.shape == "square" ? {
                        width: props.inputWidth || 150,
                        height: props.inputHeight || 150,
                    } : {
                        width: props.inputWidth || '100%',
                        height: props.inputHeight || 150,
                    },
                    props.shape == "rounded" ? {
                        borderRadius: 200,
                    } : {
                        borderRadius: 15,
                    }
                ]} onPress={selectImage}>
                    <Ionicons name="image-outline" size={24} color={Colors.gray} />
                    <Text style={styles.selectImageText}>Selecione uma imagem</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    imageContainer: {
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    selectImageText: {
        padding: 5,
        color: 'gray',
        textAlign: 'center',
    },
    imagePreview: {
        marginBottom: 10,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editText: {
        color: 'gray',
        marginLeft: 5,
    },
});
