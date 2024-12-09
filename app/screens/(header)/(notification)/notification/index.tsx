import Button from "@/components/baseComponets/Button";
import NotificationCard from "@/components/headerComponents/NotificationCard";
import { Colors } from "@/constants/Colors";
import { UserType } from "@/enums/UserType";
import { ConnectionRequestList } from "@/models/viewModels/ConnectionRequestList";
import { Volunteer } from "@/models/Volunteer";
import { acceptConnection, getPendingConnections, rejectConnection } from "@/services/connection.service";
import { getUserTypeByToken } from "@/services/managers/TokenManager";
import { getVolunteer } from "@/services/volunteer.service";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotificationScreen() {
    const params = useLocalSearchParams();
    const [pageFrom, setPageFrom] = useState<'feed' | 'store' | 'events'>('feed');

    const [refreshing, setRefreshing] = useState(false);
    const [pendingConnections, setPendingConnections] = useState<ConnectionRequestList[]>([]);
    const [volunteersPendingConnections, setVolunteersPendingConnections] = useState<{ requestId: String, volunteer: Volunteer }[]>([]);
    const [loggedUserType, setLoggedUserType] = useState<UserType>();

    const [confirmAcceptModal, setConfirmAcceptModal] = useState<boolean>(false);
    const [confirmRejectModal, setConfirmRejectModal] = useState<boolean>(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            await fetchLoggedUserType();
            await fetchConnectionRequest();

            const responsePageFrom = Array.isArray(params.pageFrom) ? params.pageFrom[0] : params.pageFrom;
            if (responsePageFrom == 'feed' || responsePageFrom == 'events' || responsePageFrom == 'store') setPageFrom(responsePageFrom);
        };
        fetchData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchConnectionRequest();
        setRefreshing(false);
    };

    const fetchLoggedUserType = async () => {
        try {
            const response = await getUserTypeByToken();
            if (response == 'volunteer')
                setLoggedUserType(UserType.VOLUNTEER);
            else if (response == 'organization')
                setLoggedUserType(UserType.ORGANIZATION);
        } catch (error) {
            console.error('LINKA-LOG: Error loading logged user type');
        }
    }

    const fetchConnectionRequest = async () => {
        try {
            const response = await getPendingConnections();
            setPendingConnections(Array.isArray(response.data.connectionRequests) ? response.data.connectionRequests : []);

            const volunteersDetailsList = await Promise.all(
                response.data.connectionRequests.map(async (connectionRequest: ConnectionRequestList) => {
                    const volunteerData = await fetchVolunteerDetails(connectionRequest.requesterId);
                    return { requestId: connectionRequest.id, volunteer: volunteerData }
                })
            );

            setVolunteersPendingConnections(volunteersDetailsList);
        } catch (error) {
            console.error('LINKA-LOG: Error during load pending connection requests');
        }
    }

    const fetchVolunteerDetails = async (id: string) => {
        try {
            const volunteer = await getVolunteer(id);
            return { ...volunteer, id: id };
        } catch (e) {
            console.error('LINKA-LOG: Error loading volunteer');
            return { name: '', profilePictureBase64: '' };
        }
    };

    const handleAcceptConnection = (requestId: string) => {
        setConfirmAcceptModal(true);
        setSelectedRequestId(requestId);
    }

    const handleRejectConnection = (requestId: string) => {
        setConfirmRejectModal(true);
        setSelectedRequestId(requestId);
    }

    const handleConfirmAcceptConnection = async () => {
        selectedRequestId && await acceptConnection(selectedRequestId);
        setSelectedRequestId(null);
        fetchConnectionRequest();
        setConfirmAcceptModal(false);
    }

    const handleConfirmRejectConnection = async () => {
        selectedRequestId && await rejectConnection(selectedRequestId);
        setSelectedRequestId(null);
        fetchConnectionRequest();
        setConfirmRejectModal(false);
    }

    const handleReturnPage = () => {
        switch (pageFrom) {
            case "feed":
                router.push('/screens/(tabs)/(feed)/feed');
                break;
            case "store":
                router.push('/screens/(tabs)/(store)/store');
                break;
            case "events":
                router.push('/screens/(tabs)/(event)/event');
                break;
        }
    }

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[Colors.orange, Colors.orange]}
                />}
            style={styles.pageColor}
        >
            <View style={styles.container}>
                {loggedUserType == UserType.VOLUNTEER && (
                    <>
                        <View style={styles.titleContainer}>
                            <TouchableOpacity onPress={() => { handleReturnPage() }}><Ionicons name="arrow-back-outline" size={28} color={Colors.gray} /></TouchableOpacity>
                            <Text style={styles.title}>Solicitações de Conexão</Text>
                        </View>

                        {volunteersPendingConnections?.length > 0 ? (
                            volunteersPendingConnections.map((data, index) => (
                                <NotificationCard
                                    key={index}
                                    userFullName={data.volunteer.name + ' ' + data.volunteer.surname}
                                    userId={data.volunteer.id ? data.volunteer.id : ''}
                                    userImageProfile={data.volunteer.profilePictureBase64 ?? ''}
                                    username={data.volunteer.username}
                                    onPressAcept={data.requestId
                                        ? () => handleAcceptConnection(data.requestId as string)
                                        : () => { Alert.alert('Ops...', 'Um erro aconteceu. Tente de novo') }}
                                    onPressReject={data.requestId
                                        ? () => handleRejectConnection(data.requestId as string)
                                        : () => { Alert.alert('Ops...', 'Um erro aconteceu. Tente de novo') }}
                                />
                            ))
                        ) : (
                            <Text>Nenhuma solicitação de conexão pendente</Text>
                        )}
                    </>
                )}
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={confirmAcceptModal}
                onRequestClose={() => setConfirmAcceptModal(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Você realmente deseja aceitar esta conexão?</Text>
                        <View style={styles.modalButtonContainer}>
                            <Button
                                title='Cancelar'
                                onPress={() => { setConfirmAcceptModal(false); setSelectedRequestId(null); }}
                                backgroundColor={Colors.white}
                                textColor={Colors.gray}
                                borderColor={Colors.gray}
                                borderRadius={15}
                                width={125}
                                height={35}
                            />
                            <Button
                                title='Aceitar'
                                onPress={() => handleConfirmAcceptConnection()}
                                backgroundColor={Colors.orange}
                                textColor={Colors.white}
                                borderColor={Colors.orange}
                                borderRadius={15}
                                width={125}
                                height={35}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={confirmRejectModal}
                onRequestClose={() => setConfirmRejectModal(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Você realmente deseja rejeitar esta conexão?</Text>
                        <View style={styles.modalButtonContainer}>
                            <Button
                                title='Cancelar'
                                onPress={() => { setConfirmRejectModal(false); setSelectedRequestId(null); }}
                                backgroundColor={Colors.white}
                                textColor={Colors.gray}
                                borderColor={Colors.gray}
                                borderRadius={15}
                                width={125}
                                height={35}
                            />
                            <Button
                                title='Rejeitar'
                                onPress={() => handleConfirmRejectConnection()}
                                backgroundColor={Colors.red}
                                textColor={Colors.white}
                                borderColor={Colors.red}
                                borderRadius={15}
                                width={125}
                                height={35}
                            />
                        </View>
                    </View>
                </View>
            </Modal>


        </ScrollView>
    )
}

const styles = StyleSheet.create({
    pageColor: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    container: {
        backgroundColor: Colors.white,
        padding: 10,
        marginBottom: 75,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        height: 40,
        paddingHorizontal: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 30,
        borderRadius: 15,
        height: 175,
        width: '85%',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 25,
        textAlign: 'center',
        color: Colors.black,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around'
    },
})