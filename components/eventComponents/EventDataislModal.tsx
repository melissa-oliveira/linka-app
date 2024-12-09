import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from "@expo/vector-icons";
import EventDetailsHeader from "@/components/eventComponents/eventDetailsComponents/EventDetailsHeader";
import JobCardComponent from "@/components/eventComponents/eventDetailsComponents/JobCard";
import { Colors } from "@/constants/Colors";
import { UserType } from "@/enums/UserType";
import { Event } from "@/models/Event";
import { EventJob } from "@/models/EventJob";
import { subscribeToEventJob, unsubscribeFromEventJob } from "@/services/eventJobs.service";
import { cancelEvent, closeEvent, openEvent } from "@/services/event.service";
import CheckInOutModal from "./CheckInOutModal";
import VolunteerTicketModal from "./VolunteerTicketModal";
import { VolunteerListModal } from "./VolunteerListModal";
import { VolunteerSubscribed } from "@/models/viewModels/VolunteerSubscribed";
import Geocoder from 'react-native-geocoding';

interface Props {
    visible: boolean;
    event: Event;
    eventJobs: EventJob[];
    userType: UserType;
    volunteerId: string;
    onClose: () => void;
    onChange: () => void;
}

Geocoder.init("CHAVE_API_GOOGLE", { language: "pt" });

export const EventDetailsModal = (props: Props) => {

    const [loading, setLoading] = useState(false);
    const [checkInOutModalVisible, setCheckInOutModalVisible] = useState(false);
    const [ticketModalVisible, setTicketModalVisible] = useState(false);
    const [volunteerListModalVisible, setVolunteerListModalVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState<EventJob | null>(null);
    const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerSubscribed | null>(null);
    const [totalJobs, setTotalJobs] = useState(0);
    const [region, setRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const event = useRef(props.event);
    const eventJobsRef = useRef(props.eventJobs);

    useEffect(() => {
        geocodeAddress();

        const totalJobs = props.eventJobs.reduce((sum: number, job: EventJob) => sum + job.maxVolunteers, 0);;
        setTotalJobs(totalJobs);

        event.current = props.event;
        eventJobsRef.current = props.eventJobs;
        setLoading(false);

        if (selectedJob) {
            const eventJobUpdated = eventJobsRef.current.find(
                (e) => e.id === selectedJob.id
            );
            if (eventJobUpdated) {
                setSelectedJob(eventJobUpdated);

                if (selectedVolunteer) {
                    const volunteer = eventJobUpdated.volunteersSubscribed.find(
                        (v) => v.id === selectedVolunteer.id
                    );

                    if (volunteer) {
                        setSelectedVolunteer(volunteer);
                    }
                }
            }
        }

    }, [props.event, props.eventJobs]);


    const geocodeAddress = async () => {
        const address = `${event.current.address.street}, ${event.current.address.number}, ${event.current.address.city}, ${event.current.address.state}`;
        try {
            const geoResult = await Geocoder.from(address);
            const location = geoResult.results[0].geometry.location;
            setRegion({
                latitude: location.lat,
                longitude: location.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        } catch (error) {
            console.error('Erro na geocodificação:', error);
        }
    };

    const subscribeEvent = async (eventJobId: string) => {
        setLoading(true);
        try {
            await subscribeToEventJob(eventJobId);
            props.onChange();
        } catch (error) {
            console.error('LINKA-LOG: Error subscribing event job:', error);
            Alert.alert('Ops...', 'Ocorreu um erro durante a sua inscrição. Tente novamente.');
        }
    };

    const unsubscribeEvent = async (eventJobId: string) => {
        setLoading(true);
        try {
            await unsubscribeFromEventJob(eventJobId);
            setTicketModalVisible(false);
            props.onChange();
        } catch (error) {
            console.error('LINKA-LOG: Error unsubscribing event job:', error);
            Alert.alert('Ops...', 'Ocorreu um erro durante o cancelar a sua inscrição. Tente novamente.');
        }
    };

    const organizationCancelEvent = async (eventId: string) => {
        setLoading(true);
        try {
            await cancelEvent(eventId);
            props.onChange();
            Alert.alert('Sucesso', 'O evento foi cancelado');
        } catch (error) {
            console.error('LINKA-LOG: Error canceling event:', error);
            Alert.alert('Ops.. Algo deu errado', 'Erro ao cancelar evento');
        }
    }

    const organizationOpenEvent = async (eventId: string) => {
        setLoading(true);
        try {
            await openEvent(eventId);
            props.onChange();
            Alert.alert('Sucesso', 'O evento foi iniciado');
        } catch (error) {
            console.error('LINKA-LOG: Error opening event:', error);
            Alert.alert('Ops.. Algo deu errado', 'Erro ao abrir o evento');
        }
    }

    const organizationCloseEvent = async (eventId: string) => {
        setLoading(true);
        try {
            await closeEvent(eventId);
            props.onChange();
            Alert.alert('Sucesso', 'O evento foi finalizado');
        } catch (error) {
            console.error('LINKA-LOG: Error closing event:', error);
            Alert.alert('Ops.. Algo deu errado', 'Erro ao finalizar o evento');
        }
    }

    const organizationOpenCheckInOutModal = () => {
        props.onChange();
        setCheckInOutModalVisible(true);
    };

    const closeCheckInOutModal = () => {
        props.onChange();
        setCheckInOutModalVisible(false);
    };

    const volunteerOpenTicketModal = (eventJob: EventJob) => {
        props.onChange();

        const eventJobUpdated = eventJobsRef.current.find(
            (e) => e.id === eventJob.id
        );

        if (eventJobUpdated) {
            const volunteer = eventJobUpdated.volunteersSubscribed.find(
                (v) => v.id === props.volunteerId
            );

            if (volunteer) {
                setSelectedJob(eventJobUpdated);
                setSelectedVolunteer(volunteer);
                setTicketModalVisible(true);
            }
        }
    };

    const volunteerCloseTicketModal = () => {
        props.onChange();
        setSelectedJob(null);
        setSelectedVolunteer(null);
        setTicketModalVisible(false);
    };

    const organizationOpenTicketModal = (volunteer: VolunteerSubscribed) => {
        props.onChange();

        if (selectedJob) {

            const eventJobUpdated = eventJobsRef.current.find(
                (e) => e.id === selectedJob.id
            );

            if (eventJobUpdated) {
                const volunteerUpdated = eventJobUpdated.volunteersSubscribed.find(
                    (v) => v.id === volunteer.id
                );

                if (volunteerUpdated) {
                    setSelectedVolunteer(volunteerUpdated);
                    setVolunteerListModalVisible(false);
                    setTicketModalVisible(true);
                }
            }
        }
    };

    const organizationCloseTicketModal = () => {
        props.onChange();
        setSelectedVolunteer(null);
        setTicketModalVisible(false);

        if (selectedJob) {
            const eventJobUpdated = eventJobsRef.current.find(
                (e) => e.id === selectedJob.id
            );

            if (eventJobUpdated) {
                organizationOpenVolunteerListModal(eventJobUpdated)
                setSelectedJob(eventJobUpdated);
            }
        }
    };

    const organizationOpenVolunteerListModal = (eventJob: EventJob) => {
        props.onChange();

        const eventJobUpdated = props.eventJobs.find(
            (e) => e.id === eventJob.id
        );

        if (eventJobUpdated) {
            setSelectedJob(eventJobUpdated);
            setVolunteerListModalVisible(true);
        }
    };

    const organizationCloseVolunteerListModal = () => {
        props.onChange();
        setSelectedJob(null);
        setVolunteerListModalVisible(false);
    };

    const handleModalChange = () => {
        props.onChange();
    };

    return (
        <>
            <Modal
                visible={props.visible}
                animationType="slide"
                transparent={true}
                onRequestClose={props.onClose}
            >
                <ScrollView style={styles.pageColor}>

                    <View style={styles.closeButton}>
                        <TouchableOpacity onPress={props.onClose}>
                            <Ionicons name="close" size={30} color={Colors.gray} />
                        </TouchableOpacity>
                    </View>

                    <Image source={{ uri: `data:image/jpeg;base64,${event.current.imageBase64}` }} style={styles.image} />

                    <View style={styles.container}>
                        <EventDetailsHeader
                            userType={props.userType}
                            event={event.current}
                            eventFilledJobs={totalJobs.toString()}
                            onChange={() => props.onChange()}
                            cancelEventFunction={
                                props.userType == UserType.ORGANIZATION ?
                                    (() => { organizationCancelEvent(event.current.id!) }) :
                                    null}
                            startEventFunction={
                                props.userType == UserType.ORGANIZATION ?
                                    (() => { organizationOpenEvent(event.current.id!) }) :
                                    null}
                            endEventFunction={
                                props.userType == UserType.ORGANIZATION ?
                                    (() => { organizationCloseEvent(event.current.id!) }) :
                                    null}
                            qrCodeFunction={
                                props.userType == UserType.ORGANIZATION ?
                                    (() => { organizationOpenCheckInOutModal() }) :
                                    null}
                        />

                        <View>
                            <Text style={styles.sectionTitle}>Detalhes</Text>
                            <Text style={styles.sectionText}>{event.current.description}</Text>
                        </View>


                        <View>
                            <Text style={styles.sectionTitle}>Vagas</Text>
                            {loading ?
                                <ActivityIndicator size="small" color={Colors.orange} />
                                :
                                eventJobsRef.current.map((job, index) => {
                                    const isVolunteerSubscribedToThisJob = job.volunteersSubscribed.some(
                                        (volunteer) => volunteer.id === props.volunteerId
                                    );

                                    const isVolunteerSubscribedToAnyJob = eventJobsRef.current.some((j) =>
                                        j.volunteersSubscribed.some((volunteer) => volunteer.id === props.volunteerId)
                                    );

                                    let buttonType: 'organization' | 'volunteer' | 'subscribedVolunteer' | 'subscribedVolunteerOtherJob';
                                    if (props.userType === UserType.ORGANIZATION) {
                                        buttonType = 'organization';
                                    } else if (isVolunteerSubscribedToThisJob) {
                                        buttonType = 'subscribedVolunteer';
                                    } else if (isVolunteerSubscribedToAnyJob) {
                                        buttonType = 'subscribedVolunteerOtherJob';
                                    } else {
                                        buttonType = 'volunteer';
                                    }

                                    return (
                                        <JobCardComponent
                                            key={index}
                                            buttonType={buttonType}
                                            eventStatus={event.current.status}
                                            jobTitle={job.title}
                                            filledJobs={job.volunteersCount.toString()}
                                            totalJobs={job.maxVolunteers.toString()}
                                            jobsDetails={job.description}
                                            onPress={() => props.userType === UserType.VOLUNTEER
                                                ? job.id
                                                    ? subscribeEvent(job.id)
                                                    : alert('Erro inesperado ao se inscrever em cargo')
                                                : organizationOpenVolunteerListModal(job)
                                            }
                                            onPressTicket={
                                                props.userType === UserType.VOLUNTEER
                                                    ? () => {
                                                        const volunteer = job.volunteersSubscribed.find(
                                                            (v) => v.id === props.volunteerId
                                                        );
                                                        if (volunteer) {
                                                            volunteerOpenTicketModal(job);
                                                        } else {
                                                            Alert.alert('Erro', 'Voluntário não encontrado.');
                                                        }
                                                    }
                                                    : null
                                            }
                                        />
                                    );
                                })}
                        </View>
                    </View>

                    <MapView
                        style={styles.map}
                        region={region}
                    >
                        <Marker
                            coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                            title={event.current.title}
                            description={`${event.current.address.street}, ${event.current.address.number}`}
                        />
                    </MapView>

                    <View style={styles.mapDescriptionContainer}>
                        <Text style={styles.mapDescriptionText}>
                            <Ionicons style={styles.mapDescriptionIcon} name="location-outline" size={16} color={Colors.gray} />
                            {event.current.address.street}, {event.current.address.number} - {event.current.address.neighborhood}
                        </Text>
                        <Text style={styles.mapDescriptionText}>{event.current.address.city}, {event.current.address.state}</Text>
                    </View>

                    <CheckInOutModal
                        visible={checkInOutModalVisible}
                        onClose={closeCheckInOutModal}
                    />

                    {selectedJob && (
                        <VolunteerListModal
                            visible={volunteerListModalVisible}
                            onClose={organizationCloseVolunteerListModal}
                            eventJob={selectedJob}
                            onPressVolunteerTicket={organizationOpenTicketModal}
                        />
                    )}

                    {event.current && event.current.id && selectedJob && selectedVolunteer && (
                        <VolunteerTicketModal
                            visible={ticketModalVisible}
                            onClose={props.userType == UserType.VOLUNTEER ? volunteerCloseTicketModal : organizationCloseTicketModal}
                            eventId={event.current.id}
                            eventName={event.current.title}
                            eventStatus={event.current.status}
                            eventJobName={selectedJob.title}
                            selectedVolunteer={selectedVolunteer}
                            userType={props.userType}
                            onPressUnsubscribe={() => unsubscribeEvent(selectedJob.id)}
                            onChange={handleModalChange}
                        />
                    )}

                </ScrollView>
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
        marginBottom: 25,
        paddingEnd: 30,
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
});


