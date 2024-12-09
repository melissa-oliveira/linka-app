import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import OptionModalNew from './OptionModalNew';
import { UserType } from '@/enums/UserType';
import { getUserTypeByToken } from '@/services/managers/TokenManager';

type Props = {
    visible: any,
    onClose: any,
}

export default function ModalNew(props: Props) {

    const [userType, setUserType] = useState<UserType>(UserType.VOLUNTEER);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                await fetchUserType();
            } catch (error) {
                console.error(error);
            }
        };
        fetchUser();
    }, []);

    const fetchUserType = async () => {
        const userType = await getUserTypeByToken();

        if (userType) {
            try {
                if (userType == 'volunteer') {
                    setUserType(UserType.VOLUNTEER);
                } else if (userType == 'organization') {
                    setUserType(UserType.ORGANIZATION);
                } else {
                    console.error('LINKA-LOG: UserType do not exist');
                }
            } catch (error) {
                console.error('LINKA-LOG: UserType error: ' + error);
            }
        }
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}
            onRequestClose={props.onClose}
        >
            <TouchableWithoutFeedback onPress={props.onClose}>
                <View style={styles.modalBackground}>
                    <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
                        <View style={styles.container}>
                            <View style={styles.buttonsContainer}>

                                {userType === UserType.ORGANIZATION && (
                                    <OptionModalNew
                                        title="Criar evento"
                                        iconName="calendar-outline"
                                        onPress={() => {
                                            props.onClose();
                                            router.push({ pathname: "/screens/new/event" });
                                        }}
                                        backgroundColor={Colors.white}
                                        textColor={Colors.orange}
                                        borderColor={Colors.white}
                                        width={200}
                                    />
                                )}

                                <OptionModalNew
                                    title="Escrever post"
                                    iconName="create-outline"
                                    onPress={() => {
                                        props.onClose();
                                        router.push({ pathname: "/screens/(tabs)/(new)/new/post" });
                                    }}
                                    backgroundColor={Colors.white}
                                    textColor={Colors.orange}
                                    borderColor={Colors.white}
                                    width={200}
                                />

                                {userType === UserType.ORGANIZATION && (
                                    <OptionModalNew
                                        title="Criar recompensa"
                                        iconName="cart-outline"
                                        onPress={() => {
                                            props.onClose();
                                            router.push({ pathname: "/screens/(tabs)/(new)/new/reward" });
                                        }}
                                        backgroundColor={Colors.white}
                                        textColor={Colors.orange}
                                        borderColor={Colors.white}
                                        width={200}
                                    />
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        paddingBottom: 75,
    },
    modalContainer: {
        backgroundColor: 'transparent',
        borderRadius: 30,
    },
    container: {
        padding: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        fontSize: 16,
        color: Colors.red,
    },
    buttonsContainer: {
        gap: 5,
    },
});
