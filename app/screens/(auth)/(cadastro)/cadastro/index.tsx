import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Input from "@/components/baseComponets/Input";
import Button from "@/components/baseComponets/Button";
import DatePicker from "@/components/newComponents/newEventComponents/DatePicker";
import ImageInput from "@/components/baseComponets/ImageInput";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { UserType } from "@/enums/UserType";
import { User } from "@/models/User";
import { LoginRequest } from "@/models/viewModels/LoginRequest";
import { Address } from "@/models/Address";
import { dateToISOFormat } from "@/utils/formatDateTime";
import { OrganizationRequest } from "@/models/viewModels/OrganizationRequest";
import { VolunteerRequest } from "@/models/viewModels/VolunteerRequest";
import { ViaCEPFind } from "@/services/cep.service";
import { useAuth } from "@/context/AuthProvider";
import SelectEstado from "@/components/baseComponets/SelectEstado";
import {
  isAtLeast18YearsOld,
  isPastDate,
  validCep,
  validCnpj,
  validCpf,
  validEmail,
  validPhone,
} from "@/utils/inputValidation";

export default function LoginScreen() {
  const { onLogin, onOrganizationRegister, onVolunteerRegister } = useAuth();
  const [estadoSelecionado, setEstadoSelecionado] = useState("");

  // User data
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [dataNascimento, setDataNascimento] = useState<Date>(new Date());
  const [cpf, setCpf] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  // Organization data
  const [razao, setRazao] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");

  // Address data
  const [cep, setCep] = useState("");
  const [findCepError, setFindCepError] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");

  // Others
  const [isEnabled, setIsEnabled] = useState(false);
  const [step, setStep] = useState(1);

  // Errors
  const [usuarioError, setUsuarioError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [senhaError, setSenhaError] = useState("");
  const [nomeError, setNomeError] = useState("");
  const [sobrenomeError, setSobrenomeError] = useState("");
  const [dataNascimentoError, setDataNascimentoError] = useState("");
  const [cpfError, setCpfError] = useState("");

  const [razaoError, setRazaoError] = useState("");
  const [nomeFantasiaError, setNomeFantasiaError] = useState("");
  const [cnpjError, setCnpjError] = useState("");
  const [telefoneError, setTelefoneError] = useState("");

  const [cepError, setCepError] = useState("");
  const [ruaError, setRuaError] = useState("");
  const [numeroError, setNumeroError] = useState("");
  const [estadoError, setEstadoError] = useState("");
  const [cidadeError, setCidadeError] = useState("");
  const [bairroError, setBairroError] = useState("");

  type EstadoOption = {
    label: string;
    value: string;
  };

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const removeMask = (text: string, type: string | null) => {
    if (type === "phone") {
      return text.replace(/[^\d+]/g, "");
    } else {
      return text.replace(/\D/g, "");
    }
  };

  // Função de busca do CEP, agora verifica o estado
  const findCep = async (cep: string) => {
    try {
      setCep(cep);
      if (cep.length === 9) {
        const resultado = await ViaCEPFind(removeMask(cep, null));
        setRua(resultado.logradouro);
        setBairro(resultado.bairro);
        setCidade(resultado.localidade);

        // Se nenhum estado foi selecionado manualmente, usar o estado da API
        if (!estadoSelecionado) {
          handleEstadoChange({
            value: resultado.uf,
            label:
              estadosBrasileiros.find((e) => e.value === resultado.uf)?.label ||
              "",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar o CEP:", error);
      setFindCepError(
        "O CEP digitado não foi encontrado. Preencha manualmente os campos."
      );
    }
  };

  const showErrorMessage = (
    errorMessage: string,
    setErrorFunction: (error: string) => void,
    validateFunction: () => boolean
  ): boolean => {
    if (validateFunction()) {
      setErrorFunction(errorMessage);
      return false;
    } else {
      setErrorFunction("");
      return true;
    }
  };

  const validateUserFields = () => {
    let isValid = true;

    if (
      !showErrorMessage(
        'O campo "Usuário" é obrigatório.',
        setUsuarioError,
        () => !usuario
      )
    ) {
      isValid = false;
    } else if (
      !showErrorMessage(
        "O nome de usuário deve ter entre 3 e 50 caracteres",
        setUsuarioError,
        () => usuario.length < 3 || usuario.length > 50
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Email" é obrigatório.',
        setEmailError,
        () => !email
      )
    ) {
      isValid = false;
    } else if (
      !showErrorMessage(
        "Digite um email válido.",
        setEmailError,
        () => !validEmail(email)
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Senha" é obrigatório.',
        setSenhaError,
        () => !senha
      )
    ) {
      isValid = false;
    } else if (
      !showErrorMessage(
        "A senha deve ter no mínimo 6 caracteres",
        setSenhaError,
        () => senha.length < 6
      )
    ) {
      isValid = false;
    }

    return isValid;
  };

  const validateVolunteerFields = () => {
    let isValid = true;

    if (
      !showErrorMessage(
        'O campo "Primeiro Nome" é obrigatório.',
        setNomeError,
        () => !nome
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Sobrenome" é obrigatório.',
        setSobrenomeError,
        () => !sobrenome
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Email" é obrigatório.',
        setEmailError,
        () => !email
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Senha" é obrigatório.',
        setSenhaError,
        () => !senha
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage('O campo "CPF" é obrigatório.', setCpfError, () => !cpf)
    ) {
      isValid = false;
    } else if (
      !showErrorMessage(
        "Digite um CPF válido.",
        setCpfError,
        () => !validCpf(cpf)
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Data de Nascimento" é obrigatório.',
        setDataNascimentoError,
        () => !dataNascimento
      )
    ) {
      isValid = false;
    } else if (
      !showErrorMessage(
        "A data de nascimento deve estar no passado.",
        setDataNascimentoError,
        () => !isPastDate(dataNascimento)
      )
    ) {
      isValid = false;
    } else if (
      !showErrorMessage(
        "Você deve ter pelo menos 18 anos.",
        setDataNascimentoError,
        () => !isAtLeast18YearsOld(dataNascimento)
      )
    ) {
      isValid = false;
    }

    return isValid;
  };

  const validateOrganizationFields = () => {
    let isValid = true;

    if (
      !showErrorMessage(
        'O campo "Razão Social" é obrigatório.',
        setRazaoError,
        () => !razao
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Nome Fantasia" é obrigatório.',
        setNomeFantasiaError,
        () => !nomeFantasia
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "CNPJ" é obrigatório.',
        setCnpjError,
        () => !cnpj
      )
    ) {
      isValid = false;
    } else if (
      !showErrorMessage(
        "Digite um CNPJ válido.",
        setCnpjError,
        () => !validCnpj(cnpj)
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Telefone" é obrigatório.',
        setTelefoneError,
        () => !telefone
      )
    ) {
      isValid = false;
    } else if (
      !showErrorMessage(
        "Digite um telefone válido.",
        setTelefoneError,
        () => !validPhone(telefone)
      )
    ) {
      isValid = false;
    }

    return isValid;
  };

  const validateAddressFields = () => {
    let isValid = true;

    if (
      !showErrorMessage('O campo "CEP" é obrigatório.', setCepError, () => !cep)
    ) {
      isValid = false;
    } else if (
      !showErrorMessage(
        "Digite um CEP válido.",
        setCepError,
        () => !validCep(cep)
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage('O campo "Rua" é obrigatório.', setRuaError, () => !rua)
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Número" é obrigatório.',
        setNumeroError,
        () => !numero
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Estado" é obrigatório.',
        setEstadoError,
        () => !estadoSelecionado
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Cidade" é obrigatório.',
        setCidadeError,
        () => !cidade
      )
    ) {
      isValid = false;
    }

    if (
      !showErrorMessage(
        'O campo "Bairro" é obrigatório.',
        setBairroError,
        () => !bairro
      )
    ) {
      isValid = false;
    }

    return isValid;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateUserFields()) return;
      else if (isEnabled) {
        setStep(4);
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      if (!validateVolunteerFields()) return;
      setStep(5);
    } else if (step === 4) {
      if (!validateOrganizationFields()) return;
      setStep(5);
    } else if (step === 5) {
      if (!validateAddressFields()) return;
      setStep(3);
    } else {
      handleRegisterPress();
    }
  };

  const handlePreviousStep = () => {
    if (step === 2 && !isEnabled) {
      setStep(1);
    } else if (step === 3) {
      setStep(5);
    } else if (step === 4 && isEnabled) {
      setStep(1);
    } else if (step === 5) {
      setStep(isEnabled ? 4 : 2);
    } else {
      setStep(1);
    }
  };

  const handleGoToLogin = () => {
    router.push("/screens/(auth)/(login)/login");
  };

  const handleLogin = async () => {
    const loginData: LoginRequest = {
      username: usuario,
      password: senha,
    };

    const result = await onLogin!(loginData);
    if (result && result.error) {
      Alert.alert(result.msg);
    } else {
      router.push("/screens/(tabs)/(feed)/feed");
    }
  };

  const handleEstadoChange = (estado: EstadoOption) => {
    if (estado) {
      setEstadoSelecionado(estado.value);
      setEstado(estado.value); // Atualiza o estado selecionado
      console.log("Estado selecionado:", estado.label);
    }
  };

  const handleRegisterPress = async () => {
    if (isEnabled && !validateOrganizationFields()) return;
    if (!isEnabled && !validateVolunteerFields()) return;
    if (!validateAddressFields()) return;

    const userData: User = {
      email: email,
      password: senha,
      username: usuario,
      type: isEnabled ? UserType.ORGANIZATION : UserType.VOLUNTEER,
    };

    const addressData: Address = {
      nickname: "Meu endereço",
      cep: removeMask(cep, null),
      street: rua,
      neighborhood: bairro,
      state: estadoSelecionado,
      city: cidade,
      number: Number(numero),
    };

    // Organization registration
    if (isEnabled) {
      const organizationData: OrganizationRequest = {
        email: email,
        password: senha,
        username: usuario,
        cnpj: removeMask(cnpj, null),
        companyName: razao,
        tradingName: nomeFantasia,
        phone: removeMask(telefone, "phone"),
        profilePictureBase64: imageUri,
        address: addressData,
      };

      const result = await onOrganizationRegister!(organizationData);
      if (result && result.error) {
        Alert.alert(result.msg);
      } else {
        handleLogin();
      }
    }

    // Volunteerr registration
    else {
      const volunteerData: VolunteerRequest = {
        email: email,
        password: senha,
        username: usuario,
        cpf: removeMask(cpf, null),
        name: nome,
        surname: sobrenome,
        dathOfBirth: dateToISOFormat(dataNascimento).toString(),
        profilePictureBase64: imageUri,
        address: addressData,
      };

      const result = await onVolunteerRegister!(volunteerData);
      if (result && result.error) {
        Alert.alert(result.msg);
      } else {
        handleLogin();
      }
    }
  };

  const estadosBrasileiros: EstadoOption[] = [
    { label: "Acre", value: "AC" },
    { label: "Alagoas", value: "AL" },
    { label: "Amapá", value: "AP" },
    { label: "Amazonas", value: "AM" },
    { label: "Bahia", value: "BA" },
    { label: "Ceará", value: "CE" },
    { label: "Distrito Federal", value: "DF" },
    { label: "Espírito Santo", value: "ES" },
    { label: "Goiás", value: "GO" },
    { label: "Maranhão", value: "MA" },
    { label: "Mato Grosso", value: "MT" },
    { label: "Mato Grosso do Sul", value: "MS" },
    { label: "Minas Gerais", value: "MG" },
    { label: "Pará", value: "PA" },
    { label: "Paraíba", value: "PB" },
    { label: "Paraná", value: "PR" },
    { label: "Pernambuco", value: "PE" },
    { label: "Piauí", value: "PI" },
    { label: "Rio de Janeiro", value: "RJ" },
    { label: "Rio Grande do Norte", value: "RN" },
    { label: "Rio Grande do Sul", value: "RS" },
    { label: "Rondônia", value: "RO" },
    { label: "Roraima", value: "RR" },
    { label: "Santa Catarina", value: "SC" },
    { label: "São Paulo", value: "SP" },
    { label: "Sergipe", value: "SE" },
    { label: "Tocantins", value: "TO" },
  ];

  // Escolha da imagem
  const handleImageSelect = (imageUri: string) => {
    setImageUri(imageUri);
  };

  const handleEditPress = () => {
    setImageUri(undefined);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../../../assets/images/logo-laranja.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View>
              <View style={styles.textContainer}>
                <Text style={styles.welcomeText}>Faça parte do Linka!</Text>
                <Text style={styles.subText}>
                  Preencha seus dados e crie sua conta.
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="Username"
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
                  label="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="default"
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
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

              <View style={styles.switchContainer}>
                <Switch
                  trackColor={{ false: "#767577", true: "#E88810" }}
                  thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
                <Text style={styles.switchText}>Sou uma organização</Text>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Continuar"
                  onPress={handleNextStep}
                  backgroundColor={Colors.orange}
                  textColor={Colors.white}
                  borderColor={Colors.orange}
                  borderRadius={12}
                  height={40}
                  width={335}
                />
              </View>

              <View style={styles.row}>
                <Text style={styles.footerText}>Já possui cadastro? </Text>
                <TouchableOpacity onPress={handleGoToLogin}>
                  <Text style={styles.registerText}>Faça login</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <View style={styles.textContainer}>
                <Text style={styles.welcomeText}>Seu cadastro</Text>
                <TouchableOpacity onPress={handlePreviousStep}>
                  <Text style={styles.backText}>← Sobre você</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="Primeiro Nome"
                  value={nome}
                  onChangeText={setNome}
                  keyboardType="default"
                />
                {nomeError ? (
                  <Text style={styles.errorText}>{nomeError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="Sobrenome"
                  value={sobrenome}
                  onChangeText={setSobrenome}
                  keyboardType="default"
                />
                {sobrenomeError ? (
                  <Text style={styles.errorText}>{sobrenomeError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="Cpf"
                  value={cpf}
                  onChangeText={setCpf}
                  keyboardType="numeric"
                  maskType="cpf"
                />
                {cpfError ? (
                  <Text style={styles.errorText}>{cpfError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <DatePicker
                  label="Data de Nascimento"
                  value={dataNascimento}
                  onChange={(newDate: Date) => setDataNascimento(newDate)}
                />
                {dataNascimentoError ? (
                  <Text style={styles.errorText}>{dataNascimentoError}</Text>
                ) : null}
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Continuar"
                  onPress={handleNextStep}
                  backgroundColor={Colors.orange}
                  textColor={Colors.white}
                  borderColor={Colors.orange}
                  borderRadius={12}
                  height={40}
                  width={335}
                />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepThreeContainer}>
              <View style={styles.textContainer}>
                <Text style={styles.welcomeText}>Seu Cadastro</Text>
                <TouchableOpacity onPress={handlePreviousStep}>
                  <Text style={styles.backText}>← Foto de Perfil</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.subText}>
                Deseja adicionar uma foto de perfil?
              </Text>
              <Text style={styles.subText}>Esta etapa é opcional</Text>

              <View style={styles.profileImageContainer}>
                <ImageInput
                  imageUri={imageUri}
                  onImageSelect={handleImageSelect}
                  onEditPress={handleEditPress}
                  onPress={() => {}}
                  shape="rounded"
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Cadastrar"
                  onPress={handleRegisterPress}
                  backgroundColor={Colors.orange}
                  textColor={Colors.white}
                  borderColor={Colors.orange}
                  borderRadius={12}
                  height={40}
                  width={335}
                />
              </View>
            </View>
          )}

          {step === 4 && (
            <View>
              <View style={styles.textContainer}>
                <Text style={styles.welcomeText}>Seu Cadastro</Text>
                <TouchableOpacity onPress={handlePreviousStep}>
                  <Text style={styles.backText}>← Sobre a organização</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="Razão Social"
                  value={razao}
                  onChangeText={setRazao}
                  keyboardType="default"
                />
                {razaoError ? (
                  <Text style={styles.errorText}>{razaoError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="Nome Fantasia"
                  value={nomeFantasia}
                  onChangeText={setNomeFantasia}
                  keyboardType="default"
                />
                {nomeFantasiaError ? (
                  <Text style={styles.errorText}>{nomeFantasiaError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="CNPJ"
                  value={cnpj}
                  onChangeText={setCnpj}
                  keyboardType="numeric"
                  maskType="cnpj"
                />
                {cnpjError ? (
                  <Text style={styles.errorText}>{cnpjError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="Telefone"
                  value={telefone}
                  onChangeText={setTelefone}
                  keyboardType="phone-pad"
                  maskType="phone"
                />
                {telefoneError ? (
                  <Text style={styles.errorText}>{telefoneError}</Text>
                ) : null}
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Continuar"
                  onPress={handleNextStep}
                  backgroundColor={Colors.orange}
                  textColor={Colors.white}
                  borderColor={Colors.orange}
                  borderRadius={12}
                  height={40}
                  width={335}
                />
              </View>
            </View>
          )}

          {step === 5 && (
            <View>
              <View style={styles.textContainer}>
                <Text style={styles.welcomeText}>Seu Cadastro</Text>
                <TouchableOpacity onPress={handlePreviousStep}>
                  <Text style={styles.backText}>← Localização</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="CEP"
                  value={cep}
                  onChangeText={findCep}
                  keyboardType="numeric"
                  maskType="cep"
                />
                {findCepError ? (
                  <Text style={styles.inputInfoText}>{findCepError}</Text>
                ) : null}
                {cepError ? (
                  <Text style={styles.errorText}>{cepError}</Text>
                ) : null}
              </View>
              <View style={styles.inputContainer}>
                <Input
                  label="Rua"
                  value={rua}
                  onChangeText={setRua}
                  keyboardType="default"
                />
                {ruaError ? (
                  <Text style={styles.errorText}>{ruaError}</Text>
                ) : null}
              </View>
              <View style={styles.inputContainer}>
                <Input
                  label="Número"
                  value={numero}
                  onChangeText={setNumero}
                  keyboardType="numeric"
                />
                {numeroError ? (
                  <Text style={styles.errorText}>{numeroError}</Text>
                ) : null}
              </View>
              <View style={styles.inputContainer}>
                <SelectEstado
                  label="Estado"
                  selectedValue={estadoSelecionado}
                  options={estadosBrasileiros}
                  onValueChange={handleEstadoChange}
                />

                {estadoError ? (
                  <Text style={styles.errorText}>{estadoError}</Text>
                ) : null}
              </View>
              <View style={styles.inputContainer}>
                <Input
                  label="Cidade"
                  value={cidade}
                  onChangeText={setCidade}
                  keyboardType="default"
                />
                {cidadeError ? (
                  <Text style={styles.errorText}>{cidadeError}</Text>
                ) : null}
              </View>
              <View style={styles.inputContainer}>
                <Input
                  label="Bairro"
                  value={bairro}
                  onChangeText={setBairro}
                  keyboardType="default"
                />
                {bairroError ? (
                  <Text style={styles.errorText}>{bairroError}</Text>
                ) : null}
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Continuar"
                  onPress={handleNextStep}
                  backgroundColor={Colors.orange}
                  textColor={Colors.white}
                  borderColor={Colors.orange}
                  borderRadius={12}
                  height={40}
                  width={335}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 100,
    marginTop: 68,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  textContainer: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
  },
  backText: {
    fontSize: 16,
    color: "#666",
  },
  subText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  switchText: {
    marginLeft: 10,
    fontSize: 18,
  },
  buttonContainer: {
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  footerContainer: {
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
  inputContainer: {
    marginBottom: 15,
  },
  stepThreeContainer: {
    alignItems: "center",
  },
  profileImageContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  inputInfoText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});
