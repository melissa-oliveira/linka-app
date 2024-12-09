import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Text, FlatList } from 'react-native';
import { Colors } from "@/constants/Colors";
import { Address } from '@/models/Address';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    visible: boolean;
    onClose: any;
    onSelectAddress: (address: Address) => void;
    addresses: Address[];
}

export default function ModalAddress(props: Props) {
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
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>Selecione um endereço</Text>
                                <TouchableOpacity onPress={props.onClose}>
                                    <Ionicons name="close-outline" size={24} color={Colors.black} />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={props.addresses}
                                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.addressButton}
                                        onPress={() => { props.onSelectAddress(item) }}
                                    >
                                        <Text style={styles.nickname}>{item.nickname}</Text>
                                        <Text style={styles.details}>{`${item.street}, ${item.number} - ${item.neighborhood}, ${item.city}`}</Text>
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={styles.buttonsContainer}
                            />
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    modalContainer: {
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 15,
        height: 350,
        width: '85%',
    },
    container: {
        padding: 10,
        height: 320,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 20,
        width: '100%',
    },
    title: {
        fontSize: 18,
    },
    closeButton: {
        fontSize: 16,
        color: Colors.red,
    },
    buttonsContainer: {
        gap: 5,
    },
    addressButton: {
        backgroundColor: Colors.lightGray,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 5,
    },
    nickname: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.orange,
    },
    details: {
        fontSize: 14,
        color: Colors.gray,
    },
});
