import { UserType } from "@/enums/UserType";
import { ProductReservation } from "@/models/ProductReservation";
import { cancelProductReservation, getProductReservationsByOrganization, getProductReservationsByVolunteer, withdrawProductReservation } from "@/services/productReservation.service";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import ReservationCard from "./ReservationCard";

type Props = {
    visible: boolean;
    onClose: () => void;
    userType: UserType;
    filter: 'withdraw' | 'canceled' | 'reserved';
}

export function MyProductsModal(props: Props) {
    const [reservations, setReservations] = useState<ProductReservation[]>([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [props.visible]);

    const loadData = async () => {
        setLoading(true);
        await fetchReservations();
        setLoading(false);
    };

    const fetchReservations = async () => {
        try {
            if (props.userType == UserType.VOLUNTEER) {
                const responseReservations = await getProductReservationsByVolunteer();
                setReservations(responseReservations.reservations);
            } else {
                const responseReservations = await getProductReservationsByOrganization();
                setReservations(responseReservations.reservations);
            }
        } catch (error) {
            console.error("LINKA-LOG: Error loading reservations");
        }
    }

    const fetchCancelReservation = async (id: string) => {
        try {
            setLoading(true);
            await cancelProductReservation(id);
            await loadData();
        } catch (error) {
            console.error("LINKA-LOG: Error canceling reservation");
            setLoading(false);
        }
    }

    const fetchWithdrawReservation = async (id: string) => {
        try {
            setLoading(true);
            await withdrawProductReservation(id);
            await loadData();
        } catch (error) {
            console.error("LINKA-LOG: Error withdrawing reservation");
            setLoading(false);
        }
    }

    const filteredReservations = reservations.filter((reservation) => {
        switch (props.filter) {
            case 'withdraw':
                return reservation.withdrawn;
            case 'canceled':
                return reservation.cancelled;
            case 'reserved':
                return !reservation.cancelled && !reservation.withdrawn;
            default:
                return true;
        }
    });

    const renderTitle = () => {
        switch (props.filter) {
            case 'withdraw':
                return "Resgatadas";
            case 'canceled':
                return "Canceladas";
            case 'reserved':
            default:
                return "Reservadas"
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}
            onRequestClose={props.onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.closeButton}>
                        <Text style={styles.modalTitle}>{renderTitle()}</Text>
                        <TouchableOpacity onPress={props.onClose}>
                            <Ionicons name="close" size={30} color={Colors.gray} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {loading ?
                            (<View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={Colors.orange} />
                            </View>) :
                            (filteredReservations.length < 1
                                ? <Text>Nenhum produto encontrado</Text>
                                : filteredReservations.map((data, index) => (
                                    <ReservationCard
                                        key={index}
                                        reservation={data}
                                        onPressAcept={() => { fetchWithdrawReservation(data.id) }}
                                        onPressCancelReservation={() => { fetchCancelReservation(data.id) }}
                                        userType={props.userType}
                                        btnsAvaible={props.filter == 'reserved' ? true : false}
                                    />
                                )))
                        }
                    </ScrollView>
                </View>
            </View>
        </Modal >
    )
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    inputContainer: {
        marginBottom: 15,
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    buttonWrapper: {
        marginBottom: 10,
    },
    closeButton: {
        width: '100%',
        marginBottom: 20,
        paddingEnd: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    divider: {
        borderBottomColor: Colors.mediumGray,
        borderBottomWidth: 1,
        marginTop: 10,
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 15,
        marginBottom: 10,
    },
});
