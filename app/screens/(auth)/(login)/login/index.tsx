import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import Input from "@/components/baseComponets/Input";
import Button from "@/components/baseComponets/Button";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { LoginRequest } from "@/models/viewModels/LoginRequest";
import { useAuth } from "@/context/AuthProvider";

export default function LoginScreen() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [usuarioError, setUsuarioError] = useState("");
  const [senhaError, setSenhaError] = useState("");
  const { onLogin } = useAuth();

  const handleLogin = async () => {
    let valid = true;
    setUsuarioError("");
    setSenhaError("");
    if (usuario == "") {
      setUsuarioError("Usuário é obrigatório.");
      valid = false;
    }
    if (senha == "") {
      setSenhaError("Senha é obrigatória.");
      valid = false;
    } else if (senha.length < 6) {
      setSenhaError("Senha com mínimo de 6 caracteres.");
      valid = false;
    }
    if (!valid) return;

    const loginData: LoginRequest = {
      username: usuario,
      password: senha,
    };

    const result = await onLogin!(loginData);
    if (result && result.error) {
      Alert.alert("Login ou senha incorretos", result.errorText);
    } else {
      router.push("/screens/(tabs)/(feed)/feed");
    }
  };

  const handleRegisterPress = () => {
    router.push("../../(cadastro)/cadastro");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logo}>
          <Image
            source={require("../../../../../assets/images/logo-laranja.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
          <Text style={styles.subText}>Entre na sua conta</Text>
        </View>

        <View style={styles.inputContainer}>
          <Input
            label="Usuário"
            value={usuario}
            onChangeText={setUsuario}
            keyboardType="default"
          />
          {usuarioError ? (
            <Text style={styles.errorText}>{usuarioError}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Input
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={true}
            keyboardType="default"
          />
          {senhaError ? (
            <Text style={styles.errorText}>{senhaError}</Text>
          ) : null}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Entrar"
            onPress={handleLogin}
            backgroundColor={Colors.orange}
            textColor={Colors.white}
            borderColor={Colors.orange}
            borderRadius={12}
            height={40}
            width={335}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.footerText}>Não possui cadastro? </Text>
          <TouchableOpacity onPress={handleRegisterPress}>
            <Text style={styles.registerText}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 80,
  },
  textContainer: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 2,
  },
  subText: {
    fontSize: 14,
    color: "#666",
    textAlign: "left",
  },
  inputContainer: {
    marginBottom: 20,
    width: "100%",
  },
  buttonContainer: {
    marginBottom: 25,
    width: "100%",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    alignContent: "center",
  },
  registerText: {
    color: "#D17C1A",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});
