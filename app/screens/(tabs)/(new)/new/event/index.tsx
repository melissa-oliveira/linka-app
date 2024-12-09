import React, { useEffect, useRef, useState } from "react";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Input from "@/components/baseComponets/Input";
import Button from "@/components/baseComponets/Button";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import ImageInput from "@/components/baseComponets/ImageInput";
import { router } from "expo-router";
import { addEvent } from "@/services/event.service";
import DatePicker from "@/components/newComponents/newEventComponents/DatePicker";
import TimePicker from "@/components/newComponents/newEventComponents/TimePicker";
import { EventStatus } from "@/enums/EventStatus";
import { combineDateTimeString } from "@/utils/formatDateTime";
import { EventCreate } from "@/models/viewModels/EventCreate";
import { ViaCEPFind } from "@/services/cep.service";
import { validCep } from "@/utils/inputValidation";

type Entry = {
  id: number;
  role: string;
  description: string;
  quantity: string;
};

export default function NewEvent() {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    startDateTime: new Date(),
    endDateTime: new Date(),
    imageUri: undefined as string | undefined,
    address: {
      nickname: "",
      cep: "",
      street: "",
      number: "",
      state: "",
      city: "",
      neighbour: "",
    },
  });
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    address: {
      cep: "",
      street: "",
      number: "",
      state: "",
      city: "",
      neighbour: "",
    },
  });

  const [entries, setEntries] = useState<Entry[]>([
    { id: 0, role: "", description: "", quantity: "" },
  ]);
  const [errorsJobs, setErrorsJobs] = useState<Record<number, Partial<Entry>>>(
    {}
  );

  const [counter, setCounter] = useState(1);

  const updateFormState = <T extends keyof typeof formState>(
    field: T,
    value: (typeof formState)[T]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddressState = <T extends keyof typeof formState.address>(
    field: T,
    value: (typeof formState.address)[T]
  ) => {
    setFormState((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const updateErrorState = <T extends keyof typeof errors>(
    field: T,
    value: (typeof errors)[T]
  ) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddressErrorState = <T extends keyof typeof errors.address>(
    field: T,
    value: (typeof errors.address)[T]
  ) => {
    setErrors((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const findCep = async (cep: string) => {
    try {
      updateAddressState("cep", cep);
      if (cep.length === 9) {
        const resultado = await ViaCEPFind(removeMask(cep, null));
        updateAddressState("street", resultado.logradouro);
        updateAddressState("neighbour", resultado.bairro);
        updateAddressState("city", resultado.localidade);
        updateAddressState("state", resultado.uf);
      }
    } catch (error) {
      console.error("LINKA-LOG: Search CEP erros: ", error);
    }
  };

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { id: counter, role: "", description: "", quantity: "" },
    ]);
    setCounter((prev) => prev + 1);
  };

  const updateEntry = (id: number, field: keyof Entry, value: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeEntry = (id: number) => {
    if (entries.length > 1) {
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  const clearFormFields = () => {
    setFormState({
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      startDateTime: new Date(),
      endDateTime: new Date(),
      imageUri: undefined,
      address: {
        nickname: "",
        cep: "",
        street: "",
        number: "",
        state: "",
        city: "",
        neighbour: "",
      },
    });
    setErrors({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      address: {
        cep: "",
        street: "",
        number: "",
        state: "",
        city: "",
        neighbour: "",
      },
    });
    setEntries([{ id: 0, role: "", description: "", quantity: "" }]);
    setErrorsJobs({});
  };

  const removeMask = (text: string, type: string | null) => {
    if (type === "phone") {
      return text.replace(/[^\d+]/g, "");
    } else {
      return text.replace(/\D/g, "");
    }
  };

  const publishEvent = async () => {
    let valid = true;
    let newErrors: Record<number, Partial<Entry>> = {};

    const fields = ["title", "description"] as const;
    const addressFields = [
      "cep",
      "street",
      "number",
      "state",
      "city",
      "neighbour",
    ] as const;

    const fieldTranslations: Record<(typeof fields)[number], string> = {
      title: "título",
      description: "descrição",
    };

    const addressFieldTranslations: Record<
      (typeof addressFields)[number],
      string
    > = {
      cep: "CEP",
      street: "rua",
      number: "número",
      state: "estado",
      city: "cidade",
      neighbour: "bairro",
    };

    fields.forEach((field) => {
      if (!formState[field as keyof typeof formState]) {
        updateErrorState(
          field as keyof typeof errors,
          `Por favor, insira um ${fieldTranslations[field]}.`
        );
        valid = false;
      } else {
        updateErrorState(field as keyof typeof errors, "");
      }
    });

    ["startDate", "endDate", "startTime", "endTime"].forEach((field) => {
      if (!formState[field as keyof typeof formState]) {
        updateErrorState(
          field as keyof typeof errors,
          `Por favor, insira ${
            field === "startDate" || field === "endDate" ? "a data" : "a hora"
          }.`
        );
        valid = false;
      } else {
        updateErrorState(field as keyof typeof errors, "");
      }
    });

    if (formState.endDate < formState.startDate) {
      updateErrorState(
        "endDate",
        "A data final deve ser maior que a data inicial."
      );
      valid = false;
    }

    if (
      datesAreEqual(formState.startDate, formState.endDate) &&
      isStartTimeGreaterOrEqualThanEndTime(
        formState.startTime,
        formState.endTime
      )
    ) {
      updateErrorState(
        "endTime",
        "A hora final deve ser maior que a hora inicial."
      );
      valid = false;
    }

    addressFields.forEach((field) => {
      if (!formState.address[field]) {
        updateAddressErrorState(
          field,
          `Por favor, insira ${addressFieldTranslations[field]}.`
        );
        valid = false;
      } else {
        updateAddressErrorState(field, "");
      }
    });

    const cep = removeMask(formState.address.cep, null);
    if (!validCep(cep)) {
      updateAddressErrorState("cep", "Por favor, insira um CEP válido.");
      valid = false;
    }

    entries.forEach((entry, index) => {
      let entryErrors: Partial<Entry> = {};

      if (!entry.role) {
        entryErrors.role = "Por favor, insira um cargo.";
        valid = false;
      }

      if (!entry.quantity) {
        entryErrors.quantity = "Campo obrigatório";
        valid = false;
      }

      if (!entry.description) {
        entryErrors.description = "Por favor, insira uma descrição.";
        valid = false;
      }

      if (Object.keys(entryErrors).length > 0) {
        newErrors[entry.id] = entryErrors;
      }
    });
    setErrorsJobs(newErrors);

    if (valid) {
      console.log("Formulário enviado com sucesso!");
      try {
        const address = {
          nickname: "",
          cep: removeMask(formState.address.cep, null),
          street: formState.address.street,
          neighborhood: formState.address.neighbour,
          state: formState.address.state,
          city: formState.address.city,
          number: Number(formState.address.number),
        };

        const event: EventCreate = {
          title: formState.title,
          description: formState.description,
          startDateTime: combineDateTimeString(
            formState.startDate,
            formState.startTime
          ),
          endDateTime: combineDateTimeString(
            formState.endDate,
            formState.endTime
          ),
          imageBase64: formState.imageUri || null,
          address: address,
          eventJobs: entries.map((entry) => ({
            title: entry.role,
            description: entry.description,
            maxVolunteers: Number(entry.quantity),
          })),
          status: EventStatus.OPEN,
        };

        await addEvent(event);
        Alert.alert("Success", "Evento cadastrado com sucesso!");
        clearFormFields();
        router.push({ pathname: "/screens/(tabs)/(event)/event" });
      } catch (error) {
        Alert.alert("Erro", "Opss... Erro ao cadastrar evento");
        console.error("Error publishing event:", error);
      }
    }
  };

  const cancelEvent = () => {
    clearFormFields();
    if (scrollViewRef.current)
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    router.push({ pathname: "/screens/(tabs)/(event)/event" });
  };

  const datesAreEqual = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isStartTimeGreaterThanEndTime = (startTime: Date, endTime: Date) => {
    return (
      startTime.getHours() > endTime.getHours() ||
      (startTime.getHours() === endTime.getHours() &&
        startTime.getMinutes() > endTime.getMinutes())
    );
  };

  const isStartTimeGreaterOrEqualThanEndTime = (
    startTime: Date,
    endTime: Date
  ) => {
    return (
      startTime.getHours() > endTime.getHours() ||
      (startTime.getHours() === endTime.getHours() &&
        startTime.getMinutes() >= endTime.getMinutes())
    );
  };

  return (
    <View style={styles.pageColor}>
      <ScrollView ref={scrollViewRef}>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Novo Evento</Text>
            <TouchableOpacity onPress={cancelEvent}>
              <Ionicons
                name="close-outline"
                size={30}
                color={Colors.gray}
                style={styles.iconBack}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.subtitle}>Capa</Text>
            <ImageInput
              imageUri={formState.imageUri}
              onImageSelect={(base64) => updateFormState("imageUri", base64)}
              onEditPress={() => updateFormState("imageUri", undefined)}
              onPress={() => {}}
              resolutionHeight={450}
              resolutionWidth={1080}
              inputHeight={150}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>Sobre</Text>
            <View style={styles.divider} />

            <View style={styles.inputContainer}>
              <Input
                label="Título"
                value={formState.title}
                onChangeText={(text) => updateFormState("title", text)}
                keyboardType="default"
              />
              {errors.title ? (
                <Text style={styles.error}>{errors.title}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Descrição"
                value={formState.description}
                onChangeText={(text) => updateFormState("description", text)}
                keyboardType="default"
              />
              {errors.description ? (
                <Text style={styles.error}>{errors.description}</Text>
              ) : null}
            </View>

            <View style={styles.row}>
              <View style={styles.inputDateContainer}>
                <DatePicker
                  label="Data Inicial"
                  value={formState.startDate}
                  onChange={(newDate: Date) => {
                    updateFormState("startDate", newDate);
                    if (newDate >= formState.endDate) {
                      updateFormState("endDate", newDate);
                      if (
                        isStartTimeGreaterThanEndTime(
                          formState.startTime,
                          formState.endTime
                        )
                      ) {
                        updateFormState("endTime", formState.startTime);
                      }
                    }
                  }}
                  minimumDate={new Date()}
                />
                {errors.startDate ? (
                  <Text style={styles.error}>{errors.startDate}</Text>
                ) : null}
              </View>

              <View style={styles.inputTimeContainer}>
                <TimePicker
                  label="Hora Inicial"
                  value={formState.startTime}
                  onChange={(newTime: Date) => {
                    updateFormState("startTime", newTime);
                    if (
                      datesAreEqual(formState.startDate, formState.endDate) &&
                      isStartTimeGreaterThanEndTime(
                        formState.startTime,
                        formState.endTime
                      )
                    ) {
                      updateFormState("endTime", newTime);
                    }
                  }}
                  minimumTime={
                    datesAreEqual(formState.startDate, new Date())
                      ? new Date() // Horário atual para o dia de hoje
                      : new Date(0, 0, 0, 0, 0, 0, 0) // Hora mínima: 00:00 para outros dias
                  }
                />

                {errors.startTime ? (
                  <Text style={styles.error}>{errors.startTime}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputDateContainer}>
                <DatePicker
                  label="Data Final"
                  value={formState.endDate}
                  onChange={(newDate: Date) => {
                    updateFormState("endDate", newDate);
                    if (
                      datesAreEqual(formState.startDate, newDate) &&
                      isStartTimeGreaterThanEndTime(
                        formState.startTime,
                        formState.endTime
                      )
                    ) {
                      updateFormState("endTime", formState.startTime);
                    }
                  }}
                  minimumDate={formState.startDate}
                />
                {errors.endDate ? (
                  <Text style={styles.error}>{errors.endDate}</Text>
                ) : null}
              </View>

              <View style={styles.inputTimeContainer}>
                <TimePicker
                  label="Hora Final"
                  value={formState.endTime}
                  onChange={(newTime: Date) => {
                    updateFormState("endTime", newTime);
                  }}
                  minimumTime={
                    datesAreEqual(formState.startDate, formState.endDate)
                      ? formState.startTime
                      : undefined
                  }
                />
                {errors.endTime ? (
                  <Text style={styles.error}>{errors.endTime}</Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.divider} />

            <View style={styles.inputContainer}>
              <Input
                label="CEP"
                value={formState.address.cep}
                onChangeText={(text) => {
                  findCep(text);
                  updateAddressState("cep", text);
                }}
                keyboardType="numeric"
                maskType="cep"
              />
              {errors.address.cep ? (
                <Text style={styles.error}>{errors.address.cep}</Text>
              ) : null}
            </View>
            <View style={styles.inputContainer}>
              <Input
                label="Rua"
                value={formState.address.street}
                onChangeText={(text) => updateAddressState("street", text)}
                keyboardType="default"
              />
              {errors.address.street ? (
                <Text style={styles.error}>{errors.address.street}</Text>
              ) : null}
            </View>
            <View style={styles.inputContainer}>
              <Input
                label="Número"
                value={formState.address.number}
                onChangeText={(text) => updateAddressState("number", text)}
                keyboardType="default"
              />
              {errors.address.number ? (
                <Text style={styles.error}>{errors.address.number}</Text>
              ) : null}
            </View>
            <View style={styles.inputContainer}>
              <Input
                label="Estado"
                value={formState.address.state}
                onChangeText={(text) => updateAddressState("state", text)}
                keyboardType="default"
              />
              {errors.address.state ? (
                <Text style={styles.error}>{errors.address.state}</Text>
              ) : null}
            </View>
            <View style={styles.inputContainer}>
              <Input
                label="Cidade"
                value={formState.address.city}
                onChangeText={(text) => updateAddressState("city", text)}
                keyboardType="default"
              />
              {errors.address.city ? (
                <Text style={styles.error}>{errors.address.city}</Text>
              ) : null}
            </View>
            <View style={styles.inputContainer}>
              <Input
                label="Bairro"
                value={formState.address.neighbour}
                onChangeText={(text) => updateAddressState("neighbour", text)}
                keyboardType="default"
              />
              {errors.address.neighbour ? (
                <Text style={styles.error}>{errors.address.neighbour}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>Vagas</Text>
            <View style={styles.divider} />

            {entries.map((entry) => (
              <View key={entry.id} style={styles.jobContainer}>
                <View style={styles.row}>
                  <View style={styles.inputLargeContainer}>
                    <Input
                      label="Cargo"
                      value={entry.role}
                      onChangeText={(text) =>
                        updateEntry(entry.id, "role", text)
                      }
                      keyboardType="default"
                    />
                    {errorsJobs[entry.id]?.role ? (
                      <Text style={styles.error}>
                        {errorsJobs[entry.id]?.role}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.inputSmallContainer}>
                    <Input
                      label="Quantidade"
                      value={entry.quantity}
                      onChangeText={(text) =>
                        updateEntry(entry.id, "quantity", text)
                      }
                      keyboardType="numeric"
                      isNumeric={true}
                    />
                    {errorsJobs[entry.id]?.quantity ? (
                      <Text style={styles.error}>
                        {errorsJobs[entry.id]?.quantity}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.inputJobDescriptionContainer}>
                    <Input
                      label="Descrição"
                      value={entry.description}
                      onChangeText={(text) =>
                        updateEntry(entry.id, "description", text)
                      }
                      keyboardType="default"
                    />
                    {errorsJobs[entry.id]?.description ? (
                      <Text style={styles.error}>
                        {errorsJobs[entry.id]?.description}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.inputJobTrashContainer}>
                    <TouchableOpacity
                      style={styles.trashIcon}
                      onPress={() => removeEntry(entry.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={24}
                        color={Colors.orange}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButtonContainer}
              onPress={addEntry}
            >
              <Ionicons name="add-outline" size={24} color={Colors.orange} />
              <Text style={styles.addButton}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Publicar Evento"
              onPress={publishEvent}
              backgroundColor={Colors.orange}
              textColor={Colors.white}
              borderColor={Colors.orange}
              borderRadius={12}
              height={40}
              width={335}
            />
            <Button
              title="Cancelar"
              onPress={cancelEvent}
              backgroundColor={Colors.white}
              textColor={Colors.red}
              borderColor={Colors.red}
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
  subtitle: {
    fontSize: 15,
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  image: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  divider: {
    borderBottomColor: Colors.mediumGray,
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 20,
  },
  cleanDivider: {
    borderBottomColor: Colors.lightGray,
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  inputHalfContainer: {
    flex: 1,
    marginRight: 10,
  },
  spacingBottom: {
    marginBottom: 10,
  },
  inputLargeContainer: {
    flex: 0.7,
    marginRight: 10,
  },
  inputSmallContainer: {
    flex: 0.3,
  },
  inputDateContainer: {
    flex: 0.6,
    marginRight: 10,
  },
  inputTimeContainer: {
    flex: 0.4,
  },
  jobContainer: {
    marginTop: 10,
  },
  inputJobDescriptionContainer: {
    flex: 0.9,
    marginRight: 10,
  },
  inputJobTrashContainer: {
    flex: 0.1,
  },
  addressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  selectExisting: {
    color: Colors.orange,
    fontSize: 12,
    alignSelf: "flex-end",
    textDecorationLine: "underline",
  },
  trashIcon: {
    alignSelf: "center",
    marginTop: 25,
    padding: 5,
  },
  addButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  addButton: {
    color: Colors.orange,
    fontSize: 15,
    marginLeft: 5,
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: "center",
    gap: 7,
  },
  inputRemoveAddress: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    borderRadius: 10,
    marginBottom: 15,
  },
  removeAddress: {
    color: Colors.orange,
    textDecorationLine: "underline",
  },
  textWarningRemoveAddress: {
    color: Colors.gray,
    marginBottom: 5,
    fontSize: 14,
  },
  error: {
    color: Colors.red,
  },
});
