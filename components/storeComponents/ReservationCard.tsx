import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { UserType } from '@/enums/UserType';
import { ProductReservation } from '@/models/ProductReservation';
import Button from '../baseComponets/Button';

type Props = {
    reservation: ProductReservation,
    onPressCancelReservation: any,
    onPressAcept: any,
    userType: UserType,
    btnsAvaible: boolean;
};

export default function ReservationCard(props: Props) {

    const [confirmCancelModalVisible, setConfirmCancelModalVisible] = useState<boolean>(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);

    return (
        <View style={styles.container}>

            <View style={styles.pressArea}>
                <View style={styles.textContainer}>
                    <Text style={styles.fullname} numberOfLines={1} ellipsizeMode="tail">
                        1 {props.reservation.productName}
                    </Text>
                    <Text style={styles.username} numberOfLines={1} ellipsizeMode="tail">
                        Voluntário: {props.reservation.volunteerFullName}
                    </Text>
                </View>
            </View>

            {props.btnsAvaible && <View style={styles.buttonContainer} >
                {props.userType == UserType.ORGANIZATION && <TouchableOpacity onPress={() => setConfirmModalVisible(true)}>
                    <Ionicons name="checkmark-outline" size={28} color={Colors.green} />
                </TouchableOpacity>}
                <TouchableOpacity onPress={() => setConfirmCancelModalVisible(true)}>
                    <Ionicons name="close-outline" size={28} color={Colors.red} />
                </TouchableOpacity>
            </View>}

            <Modal
                animationType="fade"
                transparent={true}
                visible={confirmCancelModalVisible}
                onRequestClose={() => setConfirmCancelModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Você deseja cancelar a reserva deste produto?
                        </Text>
                        <View style={styles.modalButtonContainer}>
                            <Button
                                title="Sim"
                                onPress={() => props.onPressCancelReservation()}
                                backgroundColor={Colors.red}
                                textColor={Colors.white}
                                borderColor={Colors.red}
                                borderRadius={15}
                                width={125}
                                height={35}
                            />
                            <Button
                                title="Não"
                                onPress={() => setConfirmCancelModalVisible(false)}
                                backgroundColor={Colors.gray}
                                textColor={Colors.white}
                                borderColor={Colors.gray}
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
                visible={confirmModalVisible}
                onRequestClose={() => setConfirmModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Você deseja confirmar que o voluntário resgatou este produto?
                        </Text>
                        <View style={styles.modalButtonContainer}>
                            <Button
                                title="Não"
                                onPress={() => setConfirmModalVisible(false)}
                                backgroundColor={Colors.white}
                                textColor={Colors.gray}
                                borderColor={Colors.gray}
                                borderRadius={15}
                                width={125}
                                height={35}
                            />
                            <Button
                                title="Sim"
                                onPress={() => { props.onPressAcept() }}
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

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        backgroundColor: Colors.white,
        borderRadius: 10,
        borderColor: Colors.mediumGray,
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 100,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    fullname: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    username: {
        fontSize: 14,
        color: Colors.gray,
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    pressArea: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '77%'
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
        marginBottom: 25,
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
});
