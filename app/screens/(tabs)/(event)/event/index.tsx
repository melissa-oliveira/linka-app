import React, { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/baseComponets/Header";
import EventListComponent from "@/components/eventComponents/EventsList";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Alert,
} from "react-native";
import { UserType } from "@/enums/UserType";
import {
  getOrgVolIdByToken,
  getValidDecodedToken,
} from "@/services/managers/TokenManager";
import {
  getAllEvents,
  getEventsByOrganization,
} from "@/services/event.service";
import { getVolunteer, getVolunteerEvents } from "@/services/volunteer.service";
import { EventList } from "@/models/viewModels/EventList";
import { Event } from "@/models/Event";
import { getEventJobByEvent } from "@/services/eventJobs.service";
import { EventJob } from "@/models/EventJob";
import { EventDetailsModal } from "@/components/eventComponents/EventDataislModal";
import Button from "@/components/baseComponets/Button";
import { EventStatus } from "@/enums/EventStatus";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import * as Location from "expo-location";
import { Volunteer } from "@/models/Volunteer";

const googleApiKey = "CHAVE_API_GOOGLE";

export default function EventListScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const hasFetchedLocation = useRef(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<EventStatus[]>([
    EventStatus.OPEN,
    EventStatus.INPROGRESS,
  ]);

  const [orgVolId, setOrgVolId] = useState<string>("");
  const [userType, setUserType] = useState<UserType>(UserType.VOLUNTEER);
  const [events, setEvents] = useState<Event[]>([]);
  const [originalAvailableEvents, setOriginalAvailableEvents] = useState<
    EventList[]
  >([]);
  const [originalSubscribedEvents, setOriginalSubscribedEvents] = useState<
    EventList[]
  >([]);
  const [subscribedEvents, setSubscribedEvents] = useState<EventList[]>([]);
  const [availableEvents, setAvailableEvents] = useState<EventList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const [eventDatailsModalVisible, setEventDataisModalVisible] =
    useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventJobs, setSelectedEventJobs] = useState<EventJob[]>([]);

  const [coordinates, setCoordinates] = useState<{
    [eventId: string]: { latitude: number; longitude: number };
  }>({});
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [volunteerData, setVolunteerData] = useState<Volunteer>();

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prevKey) => prevKey + 1);
    }, [])
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await fetchUserData();
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  const onRefresh = async () => {
    console.log("entrei");
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  const handleFilterOption = (option: EventStatus) => {
    setSelectedOptions((prevState) => {
      const updatedOptions = prevState.includes(option)
        ? prevState.filter((opt) => opt !== option)
        : [...prevState, option];

      if (userType === UserType.VOLUNTEER) {
        const filteredAvailableEvents = originalAvailableEvents
          .filter((event) => updatedOptions.includes(event.eventStatus))
          .sort(
            (a, b) =>
              new Date(a.eventStartDateTime).getTime() -
              new Date(b.eventStartDateTime).getTime()
          );

        const filteredAvailableEventsByLocation = sortEventsByProximity(
          filteredAvailableEvents
        );
        setAvailableEvents(filteredAvailableEventsByLocation);

        const filteredSubscribedEvents = originalSubscribedEvents
          .filter((event) => updatedOptions.includes(event.eventStatus))
          .sort(
            (a, b) =>
              new Date(a.eventStartDateTime).getTime() -
              new Date(b.eventStartDateTime).getTime()
          );
        setSubscribedEvents(filteredSubscribedEvents);
      } else if (userType === UserType.ORGANIZATION) {
        const filteredAvailableEvents = originalAvailableEvents
          .filter((event) => updatedOptions.includes(event.eventStatus))
          .sort(
            (a, b) =>
              new Date(a.eventStartDateTime).getTime() -
              new Date(b.eventStartDateTime).getTime()
          );
        setAvailableEvents(filteredAvailableEvents);
      }

      return updatedOptions;
    });
  };

  const filterSelected = (option: EventStatus) =>
    selectedOptions.includes(option);

  const fetchUserData = async () => {
    const decodedToken = await getValidDecodedToken();

    if (decodedToken && decodedToken.id) {
      const responseUserType = decodedToken.type;
      const responseId = decodedToken.id;
      setOrgVolId(responseId);

      if (responseUserType === "volunteer") {
        setUserType(UserType.VOLUNTEER);
        await fetchVolunteerData(responseId);

        if (!hasFetchedLocation.current) {
          fetchUserLocation();
          hasFetchedLocation.current = true;
        }

        if (responseId) {
          await fetchSubscribedEvents(responseId);
          await fetchAvailableEvents();
        }
      } else if (responseUserType === "organization") {
        setUserType(UserType.ORGANIZATION);
        if (responseId) {
          await fetchEventByOrganization(responseId);
        }
      }
    }
  };

  const fetchSubscribedEvents = async (id: string) => {
    try {
      const response = await getVolunteerEvents(id);
      const eventsData = response.data as Event[];
      const listEventData: EventList[] = await Promise.all(
        eventsData.map((event) => convertEventToEventList(event))
      );

      setOriginalSubscribedEvents(listEventData);

      const filteredSubscribedEvents = listEventData
        .filter((event) =>
          [EventStatus.OPEN, EventStatus.INPROGRESS].includes(event.eventStatus)
        )
        .sort(
          (a, b) =>
            new Date(a.eventStartDateTime).getTime() -
            new Date(b.eventStartDateTime).getTime()
        );

      setSubscribedEvents(filteredSubscribedEvents);

      if (selectedEvent) {
        const updatedEvent = eventsData.find(
          (event) => event.id === selectedEvent.id
        );
        if (updatedEvent && updatedEvent.id) {
          setSelectedEvent(updatedEvent);
          const response = await getEventJobByEvent(updatedEvent.id);
          setSelectedEventJobs(response.data);
        }
      }
    } catch (error) {
      setError(error as Error);
      console.error("Error fetching subscribed events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEvents = async () => {
    setLoading(true);
    try {
      const response = await getAllEvents();
      const eventsData = response.data as Event[];
      setEvents(eventsData);
      const coordinatesMap = await fetchCoordinatesForEvents(eventsData);
      setCoordinates(coordinatesMap);

      const listEventData: EventList[] = await Promise.all(
        eventsData.map((event) => convertEventToEventList(event))
      );

      setOriginalAvailableEvents(listEventData);

      const filteredAvailableEvents = listEventData
        .filter((event) =>
          [EventStatus.OPEN, EventStatus.INPROGRESS].includes(event.eventStatus)
        )
        .sort(
          (a, b) =>
            new Date(a.eventStartDateTime).getTime() -
            new Date(b.eventStartDateTime).getTime()
        );

      const filteredAvailableEventsByLocation = sortEventsByProximity(
        filteredAvailableEvents
      );
      setAvailableEvents(filteredAvailableEventsByLocation);

      if (selectedEvent) {
        const updatedEvent = eventsData.find(
          (event) => event.id === selectedEvent.id
        );
        if (updatedEvent && updatedEvent.id) {
          setSelectedEvent(updatedEvent);
          const response = await getEventJobByEvent(updatedEvent.id);
          setSelectedEventJobs(response.data);
        }
      }
    } catch (error) {
      setError(error as Error);
      console.error("Error fetching available events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventByOrganization = async (organizationId: string) => {
    setLoading(true);
    try {
      const response = await getEventsByOrganization(organizationId);
      const eventsData = response.data as Event[];
      setEvents(eventsData);

      const listEventData: EventList[] = await Promise.all(
        eventsData.map((event) => convertEventToEventList(event))
      );

      setOriginalAvailableEvents(listEventData);

      const filteredAvailableEvents = listEventData
        .filter((event) =>
          [EventStatus.OPEN, EventStatus.INPROGRESS].includes(event.eventStatus)
        )
        .sort(
          (a, b) =>
            new Date(a.eventStartDateTime).getTime() -
            new Date(b.eventStartDateTime).getTime()
        );

      setAvailableEvents(filteredAvailableEvents);

      if (selectedEvent) {
        const updatedEvent = eventsData.find(
          (event) => event.id === selectedEvent.id
        );
        if (updatedEvent && updatedEvent.id) {
          setSelectedEvent(updatedEvent);
          const response = await getEventJobByEvent(updatedEvent.id);
          setSelectedEventJobs(response.data);
        }
      }
    } catch (error) {
      setError(error as Error);
      console.error("Error fetching events by organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventJobs = async (eventId: string) => {
    try {
      const response = await getEventJobByEvent(eventId);
      const totalJobs = response.data.reduce(
        (sum: number, job: EventJob) => sum + job.maxVolunteers,
        0
      );
      const totalFilledJobs = response.data.reduce(
        (sum: number, job: EventJob) => sum + job.volunteersCount,
        0
      );
      return {
        totalJobs: totalJobs,
        totalFilledJobs: totalFilledJobs,
      };
    } catch (error) {
      console.error("LINKA-LOG: Error fetching event jobs:", error);
    }
  };

  const convertEventToEventList = async (event: Event) => {
    if (!event.id) {
      return {
        id: "",
        eventTitle: "",
        eventStartDateTime: "",
        eventEndDateTime: "",
        eventJobs: "0",
        eventFilledJobs: "0",
        eventImageUrl: "",
        eventStatus: EventStatus.OPEN,
      };
    }

    const eventJobsData = await fetchEventJobs(event.id);

    return {
      id: event.id,
      eventTitle: event.title,
      eventStartDateTime: event.startDateTime,
      eventEndDateTime: event.endDateTime,
      eventJobs: eventJobsData ? eventJobsData.totalJobs.toString() : "0",
      eventFilledJobs: eventJobsData
        ? eventJobsData.totalFilledJobs.toString()
        : "0",
      eventImageUrl: event.imageBase64,
      eventStatus: event.status,
    };
  };

  const openEventDetailsModal = async (eventId: string) => {
    const event = events.find((event) => event.id === eventId);
    if (event) {
      setSelectedEvent(event);

      const response = await getEventJobByEvent(eventId);
      setSelectedEventJobs(response.data);

      setEventDataisModalVisible(true);
    }
  };

  const closeEventDetailsModal = () => {
    setEventDataisModalVisible(false);
    setSelectedEvent(null);
  };

  const onChange = async () => {
    await fetchUserData();
  };

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  const fetchCoordinatesForEvents = async (events: Event[]) => {
    const coordinatesMap: {
      [eventId: string]: { latitude: number; longitude: number };
    } = {};

    for (const event of events) {
      if (!event.address?.cep) {
        console.warn(
          `LINKA-LOG: Event with id ${event.id} doesn't have a valid CEP.`
        );
        continue;
      }

      try {
        const response = await fetchCoordinatesByCep(
          event.address.cep,
          googleApiKey
        );

        const location = response;
        if (location) {
          coordinatesMap[event.id!] = {
            latitude: location.latitude,
            longitude: location.longitude,
          };
          console.log(
            `Coordenadas obtidas para o evento ${event.id}: Latitude ${location.latitude}, Longitude ${location.longitude}`
          );
        } else {
          console.warn(
            `LINKA-LOG: No result for CEP ${event.address.cep} about the event id ${event.id}`
          );
        }
      } catch (error) {
        console.error(
          `LINKA-LOG: Error loading cordanations for event id: ${event.id} (CEP: ${event.address.cep}):`,
          error
        );
      }
    }
    return coordinatesMap;
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  };

  const fetchVolunteerData = async (volunteerId: string) => {
    try {
      const response = await getVolunteer(volunteerId);
      setVolunteerData(response);
    } catch (error) {
      console.error("LINKA-LOG: Error fetching volunteer data", error);
      throw error;
    }
  };

  const fetchCoordinatesByCep = async (cep: string, apiKey: string) => {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: cep,
            key: apiKey,
          },
        }
      );

      if (response.data.status !== "OK") {
        if (hasFetchedLocation.current == false) {
          Alert.alert(
            "Ops, CEP não encontrado! Os eventos serão ordenados por data"
          );
        }
        return null;
      }

      const location = response.data.results[0]?.geometry.location;
      if (!location) {
        console.error("LINKA-LOG: No coordinates found for given address");
        return null;
      }

      return { latitude: location.lat, longitude: location.lng };
    } catch (error) {
      console.error("LINKA-LOG: Error fetching coordinates by CEP", error);
      throw error;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error(
        "LINKA-LOG: Error fetching current location via GPS",
        error
      );
      throw error;
    }
  };

  const fetchUserLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        console.warn("LINKA-LOG: Location permission not granted");

        return;
      }

      const gpsLocation = await getCurrentLocation();
      setUserLocation(gpsLocation);
    } catch (error) {
      console.error("LINKA-LOG: Error in fetchUserLocation", error);
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sortEventsByProximity = (events: EventList[]): EventList[] => {
    if (!userLocation) return events;

    return events
      .map((event) => {
        const eventCoords = coordinates[event.id];
        const distance = eventCoords
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              eventCoords.latitude,
              eventCoords.longitude
            )
          : Infinity;
        return { ...event, distance };
      })
      .sort((a, b) => a.distance - b.distance);
  };

  return (
    <View style={styles.pageColor}>
      <Header pageFrom="events" />
      <ScrollView
        key={refreshKey}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.orange, Colors.orange]}
          />
        }
      >
        <View style={styles.container}>
          {userType === UserType.VOLUNTEER && (
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Eventos Inscritos</Text>
                <TouchableOpacity onPress={toggleFilterModal}>
                  <Ionicons
                    name="filter-outline"
                    size={24}
                    color={filterModalVisible ? Colors.orange : Colors.black}
                  />
                </TouchableOpacity>
              </View>

              {loading ? (
                <Text style={styles.loadingText}>Carregando...</Text>
              ) : (
                <EventListComponent
                  cardShape="square"
                  events={subscribedEvents}
                  emptyMessage="Você não está inscrito em nenhum evento ainda"
                  onPress={(eventId: string) => openEventDetailsModal(eventId)}
                />
              )}
            </>
          )}

          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {userType === UserType.ORGANIZATION ? "Meus Eventos" : "Eventos"}
            </Text>

            {userType === UserType.ORGANIZATION ? (
              <TouchableOpacity onPress={toggleFilterModal}>
                <Ionicons
                  name="filter-outline"
                  size={24}
                  color={filterModalVisible ? Colors.orange : Colors.black}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={toggleTooltip}>
                <Ionicons
                  name="help-circle-outline"
                  size={22}
                  color={Colors.gray}
                />
              </TouchableOpacity>
            )}
          </View>
          {loading ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : (
            <EventListComponent
              cardShape="rectangular"
              events={availableEvents}
              emptyMessage="Nenhum evento disponível."
              onPress={(eventId: string) => openEventDetailsModal(eventId)}
            />
          )}
        </View>
      </ScrollView>

      {selectedEvent && (
        <EventDetailsModal
          visible={eventDatailsModalVisible}
          event={selectedEvent}
          eventJobs={selectedEventJobs}
          userType={userType}
          onClose={closeEventDetailsModal}
          volunteerId={orgVolId}
          onChange={() => onChange()}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={toggleFilterModal}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={toggleFilterModal}
          activeOpacity={1}
        >
          <View style={styles.modalContainer}>
            <Button
              title="Futuros"
              onPress={() => handleFilterOption(EventStatus.OPEN)}
              backgroundColor={
                filterSelected(EventStatus.OPEN) ? Colors.white : Colors.white
              }
              textColor={
                filterSelected(EventStatus.OPEN) ? Colors.orange : Colors.gray
              }
              borderColor={
                filterSelected(EventStatus.OPEN)
                  ? Colors.orange
                  : Colors.mediumGray
              }
              borderRadius={50}
              width={130}
              height={40}
              iconName={
                filterSelected(EventStatus.OPEN)
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              justifyContent="flex-start"
              padding={10}
            />
            <Button
              title="Acontecendo"
              onPress={() => handleFilterOption(EventStatus.INPROGRESS)}
              backgroundColor={
                filterSelected(EventStatus.INPROGRESS)
                  ? Colors.white
                  : Colors.white
              }
              textColor={
                filterSelected(EventStatus.INPROGRESS)
                  ? Colors.orange
                  : Colors.gray
              }
              borderColor={
                filterSelected(EventStatus.INPROGRESS)
                  ? Colors.orange
                  : Colors.mediumGray
              }
              borderRadius={50}
              width={130}
              height={40}
              iconName={
                filterSelected(EventStatus.INPROGRESS)
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              justifyContent="flex-start"
              padding={10}
            />
            <Button
              title="Concluídos"
              onPress={() => handleFilterOption(EventStatus.COMPLETED)}
              backgroundColor={
                filterSelected(EventStatus.COMPLETED)
                  ? Colors.white
                  : Colors.white
              }
              textColor={
                filterSelected(EventStatus.COMPLETED)
                  ? Colors.orange
                  : Colors.gray
              }
              borderColor={
                filterSelected(EventStatus.COMPLETED)
                  ? Colors.orange
                  : Colors.mediumGray
              }
              borderRadius={50}
              width={130}
              height={40}
              iconName={
                filterSelected(EventStatus.COMPLETED)
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              justifyContent="flex-start"
              padding={10}
            />
            <Button
              title="Cancelados"
              onPress={() => handleFilterOption(EventStatus.CANCELED)}
              backgroundColor={
                filterSelected(EventStatus.CANCELED)
                  ? Colors.white
                  : Colors.white
              }
              textColor={
                filterSelected(EventStatus.CANCELED)
                  ? Colors.orange
                  : Colors.gray
              }
              borderColor={
                filterSelected(EventStatus.CANCELED)
                  ? Colors.orange
                  : Colors.mediumGray
              }
              borderRadius={50}
              width={130}
              height={40}
              iconName={
                filterSelected(EventStatus.CANCELED)
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              justifyContent="flex-start"
              padding={10}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {showTooltip && (
        <Modal transparent={true} animationType="fade">
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => {
              toggleTooltip();
            }}
            activeOpacity={1}
          >
            <View style={styles.tooltip}>
              <View style={styles.closeButton}>
                <Text style={styles.title}>Ordenação de Eventos</Text>
                <TouchableOpacity onPress={() => toggleTooltip()}>
                  <Ionicons name="close" size={28} color={Colors.gray} />
                </TouchableOpacity>
              </View>
              <Text style={styles.tooltipText}>
                Ative a localização para ver os eventos ordenados pelos mais
                próximos de você. Caso contrário, eles serão exibidos em ordem
                de data.
              </Text>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingText: {
    marginBottom: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingEnd: 20,
    paddingTop: 160,
  },
  modalContainer: {
    width: 145,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 8,
    alignItems: "flex-start",
    gap: 5,
  },
  modalOption: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "flex-end",
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.black,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  tooltip: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    maxWidth: "80%",
  },
  tooltipText: {
    fontSize: 16,
    color: "black",
  },
  closeButton: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
});
