import React, { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Input from "@/components/baseComponets/Input";
import Button from "@/components/baseComponets/Button";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Alert, } from "react-native";
import ImageInput from "@/components/baseComponets/ImageInput";
import { router } from "expo-router";
import { ProductCreate } from "@/models/viewModels/ProductCreate";
import { addProduct } from "@/services/product.service";

export default function NewReward() {

  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const [errorDescription, setErrorDescription] = useState("");
  const [errorCost, setErrorCost] = useState("");
  const [errorAvailableQuantity, setErrorAvailableQuantity] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prevKey) => prevKey + 1);
    }, [setRefreshKey])
  );

  const handleImageSelect = (base64: string) => {
    setImageUri(base64);
  };

  const handleEditPress = () => {
    setImageUri(undefined);
  };

  const publishReward = async () => {
    try {
      let valid = true;

      if (!description) {
        setErrorDescription("Por favor, insira uma descrição.");
        valid = false;
      } else {
        setErrorDescription("");
      }

      const costNumber = parseFloat(cost);
      if (!cost || isNaN(costNumber) || costNumber <= 0) {
        setErrorCost("Por favor, insira um valor válido.");
        valid = false;
      } else {
        setErrorCost("");
      }

      const quantityNumber = parseInt(availableQuantity, 10);
      if (!availableQuantity || isNaN(quantityNumber) || quantityNumber <= 0) {
        setErrorAvailableQuantity("Por favor, insira uma quantidade válida.");
        valid = false;
      } else {
        setErrorAvailableQuantity("");
      }

      if (!valid) return;

      const product: ProductCreate = {
        name: description,
        description: description,
        cost: costNumber,
        availableQuantity: quantityNumber,
        imageBase64: imageUri || "",
      };

      await addProduct(product);
      Alert.alert("Sucesso", "Recompensa criada com sucesso!");
      clearReward();
      router.push({ pathname: "/screens/(tabs)/(store)/store" });
    } catch (error) {
      Alert.alert("Erro", "Opss... Erro ao cadastrar recompensa");
      console.error("Erro ao publicar recompensa:", error);
    }
  };

  const clearReward = () => {
    setDescription("");
    setImageUri(undefined);
    setCost("");
    setAvailableQuantity("");
  };

  const cancelReward = () => {
    clearReward();
    router.push({ pathname: "/screens/(tabs)/(store)/store" });
  };

  return (
    <View style={styles.pageColor}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Nova Recompensa</Text>
            <TouchableOpacity onPress={cancelReward}>
              <Ionicons
                name="close-outline"
                size={30}
                color={Colors.gray}
                style={styles.iconBack}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <ImageInput
              imageUri={imageUri}
              onImageSelect={handleImageSelect}
              onEditPress={handleEditPress}
              onPress={() => { }}
              resolutionHeight={200}
              resolutionWidth={200}
              inputHeight={150}
              inputWidth={150}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label="Descrição"
              value={description}
              onChangeText={setDescription}
              keyboardType="default"
            />
            {errorDescription ? (
              <Text style={styles.error}>{errorDescription}</Text>
            ) : null}
          </View>
          <View style={styles.inputContainer}>
            <Input
              label="Valor em pontos"
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
            />
            {errorCost ? <Text style={styles.error}>{errorCost}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Input
              label="Quantidade"
              value={availableQuantity}
              onChangeText={setAvailableQuantity}
              keyboardType="numeric"
            />
            {errorAvailableQuantity ? (
              <Text style={styles.error}>{errorAvailableQuantity}</Text>
            ) : null}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cadastrar"
              onPress={publishReward}
              backgroundColor={Colors.orange}
              textColor={Colors.white}
              borderColor={Colors.orange}
              borderRadius={12}
              height={40}
              width={335}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageColor: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  container: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  iconBack: {
    marginEnd: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: "center",
    gap: 7,
  },
  error: {
    color: Colors.red,
  },
});
