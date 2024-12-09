import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Input from "@/components/baseComponets/Input";
import { router, useLocalSearchParams } from "expo-router";
import { SearchResponse } from "@/models/viewModels/SearchResponse";
import { getSearch } from "@/services/research.service";
import { SearchCard } from "@/components/headerComponents/SearchCard";
import { getVolunteer } from "@/services/volunteer.service";
import { getOrganization } from "@/services/organization.service";
import { getEvent } from "@/services/event.service";
import { Event } from "@/models/Event";
import { EventDetailsModal } from "@/components/eventComponents/EventDataislModal";
import { EventJob } from "@/models/EventJob";
import { getOrgVolIdByToken, getUserTypeByToken } from "@/services/managers/TokenManager";
import { UserType } from "@/enums/UserType";
import { getEventJobByEvent } from "@/services/eventJobs.service";

type FilterType = "Volunteer" | "Organization" | "Event";

export default function SearchScreen() {
    const params = useLocalSearchParams();
    const [pageFrom, setPageFrom] = useState<'feed' | 'store' | 'events'>('feed');

    const [userType, setUserType] = useState<UserType>(UserType.VOLUNTEER);
    const [volunteerId, setVolunteerId] = useState<string>('');

    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        Volunteer: true,
        Organization: true,
        Event: true,
    });

    const [results, setResults] = useState<{ data: SearchResponse, imageURL: string | null, idParam: string | null }[]>([]);
    const [filteredResults, setFilteredResults] = useState<{ data: SearchResponse, imageURL: string | null, idParam: string | null }[]>([]);

    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [selectedEventJobs, setSelectedEventJobs] = useState<EventJob[]>([]);
    const [eventDatailsModalVisible, setEventDataisModalVisible] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const responsePageFrom = Array.isArray(params.pageFrom) ? params.pageFrom[0] : params.pageFrom;
            if (responsePageFrom == 'feed' || responsePageFrom == 'events' || responsePageFrom == 'store') setPageFrom(responsePageFrom);
            await fetchUserType();
        };
        fetchData();
    }, []);

    const fetchUserType = async () => {
        const userType = await getUserTypeByToken();

        if (userType) {
            try {
                if (userType == 'volunteer') {
                    setUserType(UserType.VOLUNTEER);
                    const respondeVolunteerId = await getOrgVolIdByToken();
                    respondeVolunteerId && setVolunteerId(respondeVolunteerId);
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

    const fetchVolunteerDetails = async (id: string): Promise<{ imageURL: string | null, idParam: string | null }> => {
        try {
            const volunteer = await getVolunteer(id);
            return { imageURL: volunteer.profilePictureBase64 || null, idParam: volunteer.userId || null };
        } catch (e) {
            console.error('Error loading volunteer');
            return { imageURL: null, idParam: null };
        }
    };

    const fetchOrganizationDetails = async (id: string): Promise<{ imageURL: string | null, idParam: string | null }> => {
        try {
            const organization = await getOrganization(id);
            return { imageURL: organization.profilePictureBase64 || null, idParam: organization.userId || null };
        } catch (e) {
            console.error('Error loading organization');
            return { imageURL: null, idParam: null };
        }
    };

    const fetchEventDetails = async (id: string): Promise<{ imageURL: string | null, idParam: string | null }> => {
        try {
            const response = await getEvent(id);
            const event = response.data as Event;
            return { imageURL: event.imageBase64 || null, idParam: event.id || null };
        } catch (e) {
            console.error('Error loading event');
            return { imageURL: null, idParam: null };
        }
    };

    const handleFilterChange = (filterName: FilterType) => {
        setFilters(prevFilters => {
            const updatedFilters = {
                ...prevFilters,
                [filterName]: !prevFilters[filterName],
            };

            const filtered = results.filter(result => {
                if (result.data.type === "Volunteer" && updatedFilters.Volunteer) return true;
                if (result.data.type === "Organization" && updatedFilters.Organization) return true;
                if (result.data.type === "Event" && updatedFilters.Event) return true;
                return false;
            });

            setFilteredResults(filtered);
            return updatedFilters;
        });
    };

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            if (searchQuery) {
                fetchSearchResponse();
            }
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [searchQuery]);

    const fetchSearchResponse = async () => {
        setLoading(true);
        try {
            const result = await getSearch(searchQuery);
            const normalizedResult = await Promise.all(result.map(async (element) => {
                let imageAndId = null;

                if (element.type === "Volunteer") {
                    imageAndId = await fetchVolunteerDetails(element.id);
                } else if (element.type === "Organization") {
                    imageAndId = await fetchOrganizationDetails(element.id);
                } else if (element.type === "Event") {
                    imageAndId = await fetchEventDetails(element.id);
                }

                return imageAndId
                    ? { data: element, imageURL: imageAndId.imageURL, idParam: imageAndId.idParam }
                    : { data: element, imageURL: null, idParam: null };
            }));

            setResults(normalizedResult);
            setFilteredResults(normalizedResult);
        } catch (error) {
            console.error('Error searching results');
        } finally {
            setLoading(false);
        }
    };

    const handleReturnPage = () => {
        switch (pageFrom) {
            case "feed":
            case undefined:
            case null:
                router.push('/screens/(tabs)/(feed)/feed');
                break;
            case "store":
                router.push('/screens/(tabs)/(store)/store');
                break;
            case "events":
                router.push('/screens/(tabs)/(event)/event');
                break;
        }
    };

    const openEventDetailsModal = async (eventId: string) => {
        const result = await getEvent(eventId);
        const event = result.data as Event;

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
        if (selectedEvent && selectedEvent.id) {
            const result = await getEvent(selectedEvent.id);
            const event = result.data as Event;

            if (event) {
                setSelectedEvent(event);
                const response = await getEventJobByEvent(selectedEvent.id);
                setSelectedEventJobs(response.data);
            }
        }
    }

    return (
        <View style={styles.pageColor}>
            <View style={styles.searchContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={() => handleReturnPage()}>
                    <Ionicons name="arrow-back-outline" size={28} color={Colors.gray} />
                </TouchableOpacity>
                <Input
                    label=""
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    keyboardType="default"
                    width={300}
                />
            </View >

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filters.Volunteer && styles.activeFilterButton,
                    ]}
                    onPress={() => handleFilterChange("Volunteer")}
                >
                    <Text
                        style={[
                            styles.filterText,
                            filters.Volunteer && styles.activeFilterText,
                        ]}
                    >
                        Voluntários
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filters.Organization && styles.activeFilterButton,
                    ]}
                    onPress={() => handleFilterChange("Organization")}
                >
                    <Text
                        style={[
                            styles.filterText,
                            filters.Organization && styles.activeFilterText,
                        ]}
                    >
                        Organizações
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filters.Event && styles.activeFilterButton,
                    ]}
                    onPress={() => handleFilterChange("Event")}
                >
                    <Text
                        style={[
                            styles.filterText,
                            filters.Event && styles.activeFilterText,
                        ]}
                    >
                        Eventos
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.orange} />
                </View>
            ) : (
                <View style={styles.resultContainer}>
                    <FlatList
                        style={{ marginBottom: 160 }}
                        data={filteredResults}
                        keyExtractor={(item, index) => item.idParam ? item.idParam : index.toString()}
                        renderItem={({ item }) => (
                            <SearchCard
                                id={item.data.id}
                                displayName={item.data.displayName}
                                type={item.data.type}
                                imageUrl={item.imageURL ? item.imageURL : undefined}
                                pageFrom='search'
                                openEvent={() => openEventDetailsModal(item.data.id)}
                            />
                        )}
                    />
                </View>
            )}

            {!loading && filteredResults.length < 1 && (
                <View style={{ marginTop: -120, alignItems: "center" }}>
                    <Text>Nenhum resultado encontrado</Text>
                </View>
            )}

            {selectedEvent && (
                <EventDetailsModal
                    visible={eventDatailsModalVisible}
                    event={selectedEvent}
                    eventJobs={selectedEventJobs}
                    userType={userType}
                    onClose={closeEventDetailsModal}
                    volunteerId={volunteerId}
                    onChange={() => onChange()}
                />
            )}

        </View >
    );
}

const styles = StyleSheet.create({
    pageColor: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        paddingHorizontal: 10,
    },
    searchButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "orange",
        marginLeft: 10,
    },
    searchText: {
        color: Colors.white,
        fontWeight: "bold",
        marginLeft: 5,
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 30,
        marginBottom: 20,
    },
    resultContainer: {
        paddingHorizontal: 10,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: Colors.white,
        borderColor: Colors.gray,
        borderWidth: 1,
    },
    activeFilterButton: {
        backgroundColor: Colors.white,
        borderColor: Colors.orange,
        borderWidth: 1,
    },
    filterText: {
        color: Colors.gray,
        fontWeight: "bold",
    },
    activeFilterText: {
        color: Colors.orange,
    },
    resultsText: {
        margin: 20,
        fontSize: 20,
        fontWeight: "bold",
    },
    closeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    divider: {
        borderBottomColor: Colors.mediumGray,
        borderBottomWidth: 1,
        marginTop: 10,
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 20
    },
    text: {
        marginTop: 10,
        color: Colors.orange,
        fontSize: 16,
    },
});
