import { Colors } from '@/constants/Colors';
import { checkInEvent, checkOutEvent } from '@/services/event.service';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import Button from '../baseComponets/Button';
import { formatDateTime } from '@/utils/formatDateTime';
import { UserType } from '@/enums/UserType';
import QRCode from 'react-native-qrcode-svg';
import { VolunteerSubscribed } from '@/models/viewModels/VolunteerSubscribed';
import { EventStatus } from '@/enums/EventStatus';

type Props = {
    eventId: string;
    eventName: string;
    eventStatus: EventStatus;
    eventJobName: string;
    selectedVolunteer: VolunteerSubscribed,
    visible: boolean;
    userType: UserType;
    onClose: () => void;
    onPressUnsubscribe?: () => void;
    onChange: () => void;
};

export default function VolunteerTicketModal(props: Props) {
    const [modalVisible, setModalVisible] = useState(false);

    const volunteerRef = useRef(props.selectedVolunteer);

    useEffect(() => {
        volunteerRef.current = props.selectedVolunteer;
    }, [props.selectedVolunteer]);

    const handleButtonPress = async () => {
        if (props.eventStatus == EventStatus.OPEN) {
            Alert.alert('O evento ainda não começou. O check-in só será permitido a partir da data de início.');
            return;
        } else if (props.eventStatus == EventStatus.COMPLETED) {
            Alert.alert('O evento já terminou. Não é possível realizar check-in ou check-out.');
            return;
        } else if (props.eventStatus == EventStatus.CANCELED) {
            Alert.alert('O evento foi cancelado. Não é possível realizar check-in ou check-out.');
            return;
        }

        if (!props.selectedVolunteer.checkIn) {
            await checkInEvent(props.eventId, props.selectedVolunteer.id);
            Alert.alert('Check-in realizado com sucesso!');
        } else if (props.selectedVolunteer.checkIn && !props.selectedVolunteer.checkOut) {
            await checkOutEvent(props.eventId, props.selectedVolunteer.id);
            Alert.alert('Check-out realizado com sucesso!');
        } else {
            Alert.alert('Voluntário já realizou check-out.');
            return;
        }

        props.onChange();
    };

    const getQrCodeData = () => {
        if (!props.selectedVolunteer.checkIn) {
            return `/event/${props.eventId}/check-in/${props.selectedVolunteer.id}`;
        } else if (props.selectedVolunteer.checkIn && !props.selectedVolunteer.checkOut) {
            return `/event/${props.eventId}/check-out/${props.selectedVolunteer.id}`;
        }
        return undefined;
    };

    const confirmCancelEvent = () => {
        setModalVisible(false);
        props.onPressUnsubscribe?.();
        props.onChange();
    };

    return (
        <Modal
            visible={props.visible}
            animationType="slide"
            transparent={false}
            onRequestClose={props.onClose}
        >
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Inscrição</Text>
                    <TouchableOpacity onPress={props.onClose}>
                        <Ionicons name="close" size={30} color={Colors.gray} />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.volunteerText}>
                        <Text style={styles.label}>Voluntário(a): </Text>
                        {volunteerRef.current.fullName}
                    </Text>

                    <Text style={styles.jobText}>
                        <Text style={styles.label}>Cargo: </Text>
                        {props.eventJobName}
                    </Text>

                    <View style={styles.iconTextContainer}>
                        {volunteerRef.current.checkIn
                            ? <Ionicons name="checkmark-circle-outline" size={20} color={Colors.green} />
                            : < Ionicons name="close-circle-outline" size={20} color={Colors.red} />}
                        <Text style={[
                            styles.statusText,
                            { color: volunteerRef.current.checkIn ? Colors.green : Colors.red }
                        ]}>
                            <Text style={styles.label}>Check-in: </Text>{volunteerRef.current.checkIn ? formatDateTime(volunteerRef.current.checkIn.toString()) : 'não realizado'}
                        </Text>
                    </View>

                    <View style={styles.iconTextContainer}>
                        {volunteerRef.current.checkOut
                            ? <Ionicons name="checkmark-circle-outline" size={20} color={Colors.green} />
                            : <Ionicons name="close-circle-outline" size={20} color={Colors.red} />}
                        <Text style={[
                            styles.statusText,
                            { color: volunteerRef.current.checkOut ? Colors.green : Colors.red }
                        ]}>
                            <Text style={styles.label}>Check-out: </Text>{volunteerRef.current.checkOut ? formatDateTime(volunteerRef.current.checkOut.toString()) : 'não realizado'}
                        </Text>
                    </View>
                </View>

                {props.userType == UserType.VOLUNTEER && (!volunteerRef.current.checkIn || !volunteerRef.current.checkOut) && (
                    <>
                        {props.eventStatus == EventStatus.INPROGRESS ? (
                            <View style={styles.qrCode}>
                                <QRCode
                                    value={getQrCodeData()}
                                    size={320}
                                />
                            </View>
                        ) : (
                            <Text style={styles.errorText}>
                                {props.eventStatus == EventStatus.OPEN
                                    ? 'O evento ainda não começou. O QR-Code de check-in estará disponível na data de início.'
                                    : props.eventStatus == EventStatus.COMPLETED
                                        ? 'O evento já terminou. Não é possível realizar check-in ou check-out.'
                                        : 'O evento foi cancelado. Não é possível realizar check-in ou check-out.'}
                            </Text>
                        )}

                        {!(volunteerRef.current.checkIn || volunteerRef.current.checkOut)
                            && (props.eventStatus == EventStatus.OPEN || props.eventStatus == EventStatus.INPROGRESS) && (
                                <Button
                                    title='Cancelar inscrição'
                                    onPress={() => setModalVisible(true)}
                                    backgroundColor={Colors.white}
                                    textColor={Colors.gray}
                                    borderColor={Colors.gray}
                                    borderRadius={7}
                                    width={320}
                                    height={30}
                                    fontSize={16}
                                    iconName='alert-circle-outline'
                                />
                            )}
                    </>
                )}

                {props.userType == UserType.ORGANIZATION && (!volunteerRef.current.checkIn || !volunteerRef.current.checkOut) && (
                    <View style={styles.buttonContainer}>
                        {props.eventStatus == EventStatus.INPROGRESS ? (
                            <Button
                                title={!volunteerRef.current.checkIn
                                    ? 'Fazer Check-In' : 'Fazer Check-Out'}
                                onPress={handleButtonPress}
                                backgroundColor={Colors.white}
                                textColor={Colors.red}
                                borderColor={Colors.red}
                                borderRadius={10}
                                width={200}
                                height={70}
                                fontSize={20}
                            />
                        ) : (
                            <Text style={styles.errorText}>
                                {props.eventStatus == EventStatus.OPEN
                                    ? 'O evento ainda não começou. O botão para realizar o check-in estará disponível na data de início.'
                                    : props.eventStatus == EventStatus.COMPLETED
                                        ? 'O evento já terminou. Não é possível realizar check-in ou check-out.'
                                        : 'O evento foi cancelado. Não é possível realizar check-in ou check-out.'}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Deseja cancelar sua inscrição neste evento?</Text>
                        <Text style={styles.modalText}>Esta ação não pode ser revertida</Text>
                        <View style={styles.modalButtonContainer}>
                            <Button
                                title='Sair'
                                onPress={() => setModalVisible(false)}
                                backgroundColor={Colors.gray}
                                textColor={Colors.white}
                                borderColor={Colors.gray}
                                borderRadius={15}
                                width={125}
                                height={35}
                            />

                            <Button
                                title='Cancelar'
                                onPress={confirmCancelEvent}
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
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    volunteerText: {
        fontSize: 18,
        marginBottom: 8,
    },
    jobText: {
        fontSize: 18,
        marginBottom: 20,
    },
    statusText: {
        fontSize: 16,
        justifyContent: 'center',
    },
    label: {
        fontWeight: 'bold',
    },
    qrCode: {
        marginTop: 10,
        marginBottom: 32,
    },
    iconTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    buttonContainer: {
        height: '50%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorText: {
        color: Colors.gray,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 100,
        marginBottom: 40,
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
        width: '90%',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 3,
        textAlign: 'center',
        color: Colors.black,
    },
    modalText: {
        fontSize: 14,
        marginBottom: 25,
        textAlign: 'center',
        color: Colors.gray,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around'
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});
