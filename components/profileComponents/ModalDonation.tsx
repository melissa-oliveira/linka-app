import React, { useState } from "react";
import { Modal, View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from "react-native";
import * as Clipboard from "expo-clipboard";
import Button from "../baseComponets/Button";
import { Colors } from "@/constants/Colors";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";

interface DoarModalProps {
  visible: boolean;
  onClose: () => void;
  companyName?: string;
  pixKey?: string | null;
  handleSavePixKey: (tempPixKey: string) => void;
}

export default function ModalDonation({
  visible,
  onClose,
  companyName = "Organização Indisponível",
  pixKey = null,
  handleSavePixKey,
}: DoarModalProps) {
  const [tempPixKey, setTempPixKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const savePixKey = () => {
    if (tempPixKey.trim() === "") {
      Alert.alert("Erro", "A chave PIX não pode estar vazia.");
      return;
    }
    handleSavePixKey(tempPixKey);
    Alert.alert("Sucesso", "Chave PIX salva com sucesso!");
    setIsEditing(false);
  };

  const handleCopy = () => {
    if (!pixKey) return;
    Clipboard.setStringAsync(pixKey);
    Alert.alert("Sucesso", "Chave PIX copiada para a área de transferência!");
  };

  const isPixKeyValid = pixKey && pixKey.trim() !== "";

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.closeButton}>
            <Text style={styles.modalTitle}>
              {isPixKeyValid ? "Ver ou Editar Chave PIX" : "Cadastrar Chave PIX"}
            </Text>
            <TouchableOpacity onPress={() => onClose()}>
              <Ionicons name="close" size={30} color={Colors.gray} />
            </TouchableOpacity>
          </View>
          {!isPixKeyValid || isEditing ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Digite sua chave PIX"
                value={tempPixKey}
                onChangeText={setTempPixKey}
              />
              <Button
                title="Salvar"
                onPress={savePixKey}
                backgroundColor={Colors.orange}
                textColor={Colors.white}
                borderColor={Colors.orange}
                borderRadius={12}
                height={40}
                width={120}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>
                <Text style={styles.bold}>Organização:</Text> {companyName}
              </Text>
              <Text style={styles.label}>
                <Text style={styles.bold}>Chave PIX:</Text> {pixKey}
              </Text>
              <Text style={styles.instructions}>
                Copie o link e cole no seu banco ou escaneie o QR-Code
              </Text>
              <View style={styles.qrContainer}>
                <QRCode value={pixKey} size={200} />
              </View>
              <View style={styles.button}>
                <Button
                  title="Editar"
                  onPress={() => {
                    setIsEditing(true);
                    setTempPixKey(pixKey || "");
                  }}
                  backgroundColor={Colors.white}
                  textColor={Colors.gray}
                  borderColor={Colors.gray}
                  borderRadius={12}
                  height={30}
                  width={120}
                  iconName="pencil-outline"
                />
                <Button
                  title="Copiar Link"
                  onPress={handleCopy}
                  backgroundColor={Colors.orange}
                  textColor={Colors.white}
                  borderColor={Colors.orange}
                  borderRadius={12}
                  height={30}
                  width={120}
                  iconName="copy-outline"
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  instructions: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
  },
  copyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  qrContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginVertical: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    padding: 10,
    flexDirection: 'row',
    gap: 5
  },
  modalTitle: {
    fontSize: 18,
    textAlign: "center",
    color: Colors.black,
    fontWeight: "bold",
  },
  closeButton: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
});
