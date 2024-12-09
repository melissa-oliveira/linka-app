import Button from "@/components/baseComponets/Button";
import { Colors } from "@/constants/Colors";
import { UserType } from "@/enums/UserType";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import { EventStatus } from "@/enums/EventStatus";
import { Event } from "@/models/Event";
import { formatDate, formatTime } from "@/utils/formatDateTime";
import EventEditModal from "../EventEditModal";
import { getOrganization } from "@/services/organization.service";
import { Organization } from "@/models/Organization";

type IoniconNames = keyof typeof Ionicons.glyphMap;

type Props = {
  userType: UserType;
  event: Event;
  eventFilledJobs: string;
  cancelEventFunction?: any;
  startEventFunction?: any;
  endEventFunction?: any;
  qrCodeFunction?: any;
  onChange: any;
};

export default function EventDetailsHeader(props: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<
    "cancel" | "start" | "end" | "automatic-start" | "automatic-end" | null
  >(null);
  const [statusDetails, setStatusDetails] = useState<{
    icon: IoniconNames;
    text: string;
  }>({
    icon: "alert-circle",
    text: "Desconhecido",
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isStartButtonEnabled, setStartButtonEnabled] = useState(false);
  const [isEndButtonEnabled, setEndButtonEnabled] = useState(false);
  const [organizationData, setOrganizationData] = useState<Organization>();

  const event = useRef(props.event);

  useEffect(() => {
    const fetchData = async () => {
      event.current = props.event;
      updateStatusDetails(props.event.status);
      updateButtonStates();

      const organizationId = await fetchOrganizationDetails(
        props.event.organizationId
      );
      if (organizationId) {
        setOrganizationData(organizationId);
      }
    };
    fetchData();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateButtonStates();
    }, 60000);

    return () => clearInterval(timer);
  }, [props.event]);

  const updateButtonStates = () => {
    const startDateTime = new Date(event.current.startDateTime);
    const endDateTime = new Date(event.current.endDateTime);

    setStartButtonEnabled(
      currentTime >= new Date(startDateTime.getTime() - 2 * 60 * 60 * 1000) &&
        currentTime <= new Date(endDateTime.getTime() + 2 * 60 * 60 * 1000)
    );

    setEndButtonEnabled(
      currentTime >= startDateTime &&
        currentTime <= new Date(endDateTime.getTime() + 2 * 60 * 60 * 1000)
    );

    if (
      props.event.status != EventStatus.COMPLETED &&
      currentTime >= new Date(endDateTime.getTime() + 2 * 60 * 60 * 1000)
    ) {
      props.endEventFunction();
    }
  };

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    props.onChange();
    setEditModalVisible(false);
  };

  const updateStatusDetails = (status: EventStatus) => {
    const details = getStatusDetails(status);
    setStatusDetails(details);
  };

  const confirmAction = () => {
    setModalVisible(false);
    if (modalAction === "cancel") {
      props.cancelEventFunction();
    } else if (modalAction === "start") {
      props.startEventFunction();
    } else if (modalAction === "end") {
      props.endEventFunction();
    }
  };

  const getStatusDetails = (
    status: EventStatus
  ): { icon: IoniconNames; text: string } => {
    switch (status) {
      case EventStatus.OPEN:
        return { icon: "lock-open", text: "Aberto para inscrições" };
      case EventStatus.INPROGRESS:
        return { icon: "time", text: "Em andamento" };
      case EventStatus.COMPLETED:
        return { icon: "checkmark-circle", text: "Concluído" };
      case EventStatus.CANCELED:
        return { icon: "close-circle", text: "Cancelado" };
      default:
        return { icon: "alert-circle", text: "Desconhecido" };
    }
  };

  const fetchOrganizationDetails = async (id: string) => {
    try {
      const organization = await getOrganization(id);
      return organization;
    } catch (e) {
      console.log("Error loading organization");
      return null;
    }
  };

  const renderActionButtons = () => {
    if (props.userType === UserType.ORGANIZATION) {
      switch (event.current.status) {
        case EventStatus.OPEN:
          return (
            <View style={styles.buttonContainerRow}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setModalVisible(true);
                  setModalAction("cancel");
                }}
                backgroundColor={Colors.white}
                textColor={Colors.red}
                borderColor={Colors.red}
                borderRadius={15}
                height={30}
                width={80}
              />
              <Button
                title="Iniciar"
                onPress={() => {
                  setModalVisible(true);
                  setModalAction("start");
                }}
                backgroundColor={Colors.orange}
                textColor={Colors.white}
                borderColor={Colors.orange}
                borderRadius={15}
                height={30}
                width={80}
                disabled={!isStartButtonEnabled}
              />
            </View>
          );
        case EventStatus.INPROGRESS:
          return (
            <View style={styles.buttonContainerRow}>
              <Button
                title="Finalizar"
                onPress={() => {
                  setModalVisible(true);
                  setModalAction("end");
                }}
                backgroundColor={Colors.white}
                textColor={Colors.red}
                borderColor={Colors.red}
                borderRadius={15}
                height={30}
                width={80}
                disabled={!isEndButtonEnabled}
              />
            </View>
          );
        default:
          return null;
      }
    }
    return null;
  };

  const renderModalContent = () => {
    if (modalAction === "cancel") {
      return {
        title: "Deseja cancelar este evento?",
        text: "Esta ação não pode ser revertida.",
        confirmButtonText: "Cancelar",
      };
    } else if (modalAction === "start") {
      return {
        title: "Deseja iniciar este evento?",
        text: "Certifique-se de que tudo está pronto antes de começar.",
        confirmButtonText: "Iniciar",
      };
    } else if (modalAction === "end") {
      return {
        title: "Deseja finalizar este evento?",
        text: "Você está prestes a encerrar o evento.",
        confirmButtonText: "Finalizar",
      };
    }
    return { title: "", text: "", confirmButtonText: "" };
  };

  const modalContent = renderModalContent();

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.titleContainer}>
          <View style={styles.iconRow}>
            <Ionicons name={statusDetails.icon} size={18} color={Colors.gray} />
            <Text style={styles.statusText}>{statusDetails.text}</Text>
          </View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.current.title}</Text>
            {props.userType === UserType.ORGANIZATION &&
              event.current.status == EventStatus.OPEN && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEdit}
                >
                  <Ionicons name={"pencil"} size={14} color={Colors.gray} />
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>
              )}
          </View>

          {props.userType === UserType.ORGANIZATION
            ? renderActionButtons()
            : null}
        </View>

        {props.userType === UserType.ORGANIZATION &&
        event.current.status == EventStatus.INPROGRESS ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.qrcodeButton}
              onPress={props.qrCodeFunction}
            >
              <Ionicons name="qr-code-outline" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      <View style={[styles.iconRow, { marginBottom: 5 }]}>
        <Ionicons name="person-outline" size={18} color={Colors.gray} />
        <Text style={styles.text}>
          Promovido por: {organizationData?.tradingName}
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.colLeft}>
          <View style={styles.iconRow}>
            <Ionicons name="location-outline" size={18} color={Colors.gray} />
            <Text style={styles.text}>{event.current.address.city}</Text>
          </View>

          <View style={styles.iconRow}>
            <Ionicons name="calendar-outline" size={18} color={Colors.gray} />
            <Text style={styles.text}>
              {formatDate(event.current.startDateTime)} -{" "}
              {formatDate(event.current.endDateTime)}
            </Text>
          </View>
        </View>
        <View style={styles.colRight}>
          <View style={styles.iconRow}>
            <Ionicons name="people-outline" size={18} color={Colors.gray} />
            <Text style={styles.text}>{props.eventFilledJobs}</Text>
          </View>

          <View style={styles.iconRow}>
            <Ionicons name="alarm-outline" size={18} color={Colors.gray} />
            <Text style={styles.text}>
              {formatTime(event.current.startDateTime)} -{" "}
              {formatTime(event.current.endDateTime)}
            </Text>
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <Text style={styles.modalText}>{modalContent.text}</Text>
            <View style={styles.modalButtonContainer}>
              <Button
                title="Sair"
                onPress={() => setModalVisible(false)}
                backgroundColor={Colors.white}
                textColor={Colors.gray}
                borderColor={Colors.gray}
                borderRadius={15}
                width={125}
                height={35}
              />
              <Button
                title={modalContent.confirmButtonText}
                onPress={confirmAction}
                backgroundColor={
                  modalAction == "cancel" ? Colors.red : Colors.orange
                }
                textColor={Colors.white}
                borderColor={
                  modalAction == "cancel" ? Colors.red : Colors.orange
                }
                borderRadius={15}
                width={125}
                height={35}
              />
            </View>
          </View>
        </View>
      </Modal>

      <EventEditModal
        visible={editModalVisible}
        onClose={handleEditModalClose}
        currentEvent={event.current}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  titleContainer: {
    justifyContent: "center",
  },
  buttonContainer: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    gap: 2,
  },
  buttonContainerRow: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 5,
    flexDirection: "row",
    marginBottom: 10,
  },
  qrcodeButton: {
    backgroundColor: Colors.orange,
    padding: 10,
    borderRadius: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  cancelEvent: {
    color: "red",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  colLeft: {
    flex: 0.6,
    gap: 5,
  },
  colRight: {
    flex: 0.4,
    gap: 5,
    paddingStart: 35,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  text: {
    fontSize: 14,
    color: Colors.gray,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 30,
    borderRadius: 15,
    height: 175,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 3,
    textAlign: "center",
    color: Colors.black,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 25,
    textAlign: "center",
    color: Colors.gray,
  },
  modalButtonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  statusText: {
    color: Colors.gray,
    fontSize: 14,
    fontWeight: "bold",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  editText: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 4,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: -5,
    marginBottom: 10,
    textAlign: "left",
  },
});
