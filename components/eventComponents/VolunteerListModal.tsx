import React, { useEffect, useRef } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { EventJob } from "@/models/EventJob";
import { VolunteerListCard } from "./VolunteerListCard";

interface Props {
    visible: boolean;
    eventJob: EventJob;
    onClose: () => void;
    onPressVolunteerTicket: any;
}

export const VolunteerListModal = (props: Props) => {

    const eventJobRef = useRef(props.eventJob);

    useEffect(() => {
        eventJobRef.current = props.eventJob;
    }, [props.eventJob]);

    return (
        <>
            <Modal
                visible={props.visible}
                animationType="slide"
                transparent={true}
                onRequestClose={props.onClose}
            >
                <View style={styles.pageColor}>
                    <View style={styles.container}>
                        <View style={styles.headerRow}>
                            <Text style={styles.headerTitle}>Voluntários Inscritos</Text>
                            <TouchableOpacity onPress={props.onClose}>
                                <Ionicons name="close" size={30} color={Colors.gray} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.roleContainer}>
                            <Text style={styles.roleText}>Cargo: {eventJobRef.current.title}</Text>
                            <View style={styles.roleCapacityContainer}>
                                <Ionicons name="people-outline" size={20} color={Colors.black} />
                                <Text style={styles.roleCapacityText}>{eventJobRef.current.volunteersCount} / {eventJobRef.current.maxVolunteers}</Text>
                            </View>
                        </View>
                        <FlatList
                            data={eventJobRef.current.volunteersSubscribed}
                            keyExtractor={(volunteer) => volunteer.id}
                            renderItem={({ item }) => (
                                <VolunteerListCard
                                    volunteerInfo={item}
                                    onPressVolunteerTicket={() => props.onPressVolunteerTicket(item)}
                                />
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    pageColor: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    image: {
        width: '100%',
        height: 150,
    },
    container: {
        padding: 30,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 30,
        marginBottom: 10,
    },
    sectionText: {
        fontSize: 14,
    },
    map: {
        width: '100%',
        height: 200,
    },
    mapDescriptionContainer: {
        marginTop: 20,
        marginBottom: 50,
    },
    mapDescriptionText: {
        color: Colors.gray,
        textAlign: 'center',
        fontSize: 14,
    },
    mapDescriptionIcon: {
        marginEnd: 3,
        marginTop: 5,
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
    closeButton: {
        width: '100%',
        marginTop: 30,
        paddingEnd: 30,
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    headerRow: {
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
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    roleText: {
        fontSize: 16,
        fontWeight: '600',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    roleCapacityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    roleCapacityText: {
        fontSize: 16,
    },
});


