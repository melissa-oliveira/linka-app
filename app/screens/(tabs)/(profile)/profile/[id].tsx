import React, { useCallback, useState, useEffect } from "react";
import Button from "@/components/baseComponets/Button";
import { useFocusEffect } from "@react-navigation/native";
import ProfileInfo from "@/components/profileComponents/ProfileInfo";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfilePostList from "@/components/profileComponents/ProfilePostsList";
import {
  getValidDecodedToken,
  getOrgVolIdByToken,
  getUserTypeByToken,
} from "@/services/managers/TokenManager";
import {
  followOrganization,
  getFollowingOrganizations,
  getOrganization,
  unfollowOrganization,
} from "@/services/organization.service";
import { getVolunteer, getVolunteerEvents } from "@/services/volunteer.service";
import { Organization } from "@/models/Organization";
import { Volunteer } from "@/models/Volunteer";
import { EventJob } from "@/models/EventJob";
import { getEventJobByEvent } from "@/services/eventJobs.service";
import { UserType } from "@/enums/UserType";
import { EventList } from "@/models/viewModels/EventList";
import { EventStatus } from "@/enums/EventStatus";
import {
  getAllEvents,
  getEventsByOrganization,
} from "@/services/event.service";
import { Event } from "@/models/Event";
import EventListComponent from "@/components/eventComponents/EventsList";
import { EventDetailsModal } from "@/components/eventComponents/EventDataislModal";
import { PostList } from "@/models/viewModels/PostList";
import {
  getAllPostsByUser,
  likePost,
  sharePost,
  unlikePost,
  unsharePost,
} from "@/services/post.service";
import PostDetailsModal from "@/components/feedComponents/PostDetailsModal";
import { ConnectionRequestStatus } from "@/enums/ConnectionRequestStatus";
import {
  acceptConnection,
  breackUpConnection,
  checkConnection,
  checkPendingConnections,
  rejectConnection,
  requestConnection,
} from "@/services/connection.service";
import DoarModal from "@/components/profileComponents/ModalDonate";
import { MinPointsShieldLevels } from "@/enums/MinPointsShieldLevels";

export default function Profile() {
  const params = useLocalSearchParams();
  const [idParam, setIdParam] = useState<string>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("Não há descrição.");
  const [organizationData, setOrganizationData] = useState<Organization | null>(
    null
  );
  const [volunteerData, setVolunteerData] = useState<Volunteer | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventJobs, setSelectedEventJobs] = useState<EventJob[]>([]);
  const [eventDatailsModalVisible, setEventDataisModalVisible] =
    useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionRequestStatus | null>(null);
  const [isCurrentUserRequester, setIsCurrentUserRequester] =
    useState<boolean>(false);
  const [connectionRequestId, setConnectionRequestId] = useState<string | null>(
    null
  );

  const [volunteerId, setVolunteerId] = useState<string>("");
  const [userType, setUserType] = useState<UserType>(UserType.VOLUNTEER);
  const [loggedUserType, setLoggedUserType] = useState<UserType>(
    UserType.VOLUNTEER
  );
  const [originalAvailableEvents, setOriginalAvailableEvents] = useState<
    EventList[]
  >([]);
  const [originalSubscribedEvents, setOriginalSubscribedEvents] = useState<
    EventList[]
  >([]);
  const [subscribedEvents, setSubscribedEvents] = useState<EventList[]>([]);
  const [availableEvents, setAvailableEvents] = useState<EventList[]>([]);
  const [completedEvents, setCompletedEvents] = useState<EventList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [confirmUnfollowModalVisible, setConfirmUnfollowModalVisible] =
    useState(false);
  const [confirmBreackUpModalVisible, setConfirmBreackUpModalVisible] =
    useState(false);
  const [pendingModalVisible, setPendingModalVisible] = useState(false);

  const [posts, setPosts] = useState<PostList[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostList | null>(null);
  const [postDatailsModalVisible, setPostDataisModalVisible] = useState(false);
  const [donateModalVisible, setDonateModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prevKey) => prevKey + 1);
    }, [])
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchLogeedUserType();
      await fetchUserData();
      await fetchFollowing();
      setLoading(false);
    };
    fetchData();
  }, [refreshKey]);

  const fetchLogeedUserType = async () => {
    const response = await getUserTypeByToken();

    if (response) {
      if (response == "volunteer") {
        setLoggedUserType(UserType.VOLUNTEER);
      } else if (response == "organization") {
        setLoggedUserType(UserType.ORGANIZATION);
      }
    }
  };

  const fetchFollowing = async () => {
    const responseId = Array.isArray(params.id) ? params.id[0] : params.id;
    const followingOrganizations = (await getFollowingOrganizations()) || [];
    setIsFollowing(followingOrganizations.some((org) => org.id === responseId));
  };

  const fetchUserData = async () => {
    const responseId = Array.isArray(params.id) ? params.id[0] : params.id;
    setIdParam(responseId);

    const responseUserType = Array.isArray(params.userType)
      ? params.userType[0]
      : params.userType;

    if (responseUserType == "0") {
      setUserType(UserType.VOLUNTEER);
      const volData = await getVolunteer(responseId);
      volData && setVolunteerData(volData);

      setConnectionStatus(null);

      const responseCheckAcept = await checkConnection(responseId);
      responseCheckAcept.isConnected &&
        setConnectionStatus(ConnectionRequestStatus.ACCEPTED);

      if (connectionStatus == null) {
        const responseCheckPending = await checkPendingConnections(responseId);
        responseCheckPending.isPending &&
          setConnectionStatus(ConnectionRequestStatus.PENDING);
        responseCheckPending.isCurrentUserRequester &&
          setIsCurrentUserRequester(true);
        responseCheckPending.connectionRequestId &&
          setConnectionRequestId(responseCheckPending.connectionRequestId);
      }

      await fetchUserEvents(responseId);
      volData.userId && (await fetchUserPosts(volData.userId));
    } else if (responseUserType == "1") {
      setUserType(UserType.ORGANIZATION);
      const orgData = await getOrganization(responseId);
      if (orgData) {
        setOrganizationData(orgData);
        setEmail(orgData.email || "");
        setPhone(orgData.phone);
        orgData.about && setAbout(orgData.about);
      }

      await fetchUserEvents(responseId);
      orgData.userId && (await fetchUserPosts(orgData.userId));
    }
  };

  const fetchUserPosts = async (id: string) => {
    try {
      const response = await getAllPostsByUser(id);
      response && setPosts(response);
    } catch (error) {
      console.error("LINKA-LOG: Error loading posts");
    }
  };

  const fetchUserEvents = async (id: string) => {
    if (userType == UserType.VOLUNTEER) {
      try {
        await fetchSubscribedEvents(id);
      } catch (error) {
        console.error("LINKA-LOG: Error loagind volunteer events: " + error);
      }
    } else if (userType == UserType.ORGANIZATION) {
      try {
        await fetchEventByOrganization(id);
      } catch (error) {
        console.error("LINKA-LOG: Error loagind organization events: " + error);
      }
    }
  };

  const fetchSubscribedEvents = async (volunteerId: string) => {
    try {
      const response = await getVolunteerEvents(volunteerId);
      const eventsData = response.data as Event[];
      setEvents(eventsData);

      const listEventData: EventList[] = await Promise.all(
        eventsData.map((event) => convertEventToEventList(event))
      );

      setOriginalSubscribedEvents(listEventData);

      const filteredSubscribedEvents = listEventData
        .filter((event) => [EventStatus.COMPLETED].includes(event.eventStatus))
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

      const filteredCompletedEvents = listEventData
        .filter((event) => [EventStatus.COMPLETED].includes(event.eventStatus))
        .sort(
          (a, b) =>
            new Date(a.eventStartDateTime).getTime() -
            new Date(b.eventStartDateTime).getTime()
        );

      setCompletedEvents(filteredCompletedEvents);

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

  const openPostDatailsModal = (postId: string) => {
    const post = posts.find((post) => post.id == postId);
    if (post) {
      setSelectedPost(post);
      setPostDataisModalVisible(true);
    }
  };

  const closePostDetailsModal = () => {
    setPostDataisModalVisible(false);
    setSelectedPost(null);
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);

      setSelectedPost((prevPost) => {
        if (!prevPost || prevPost.id !== postId) return prevPost;

        return {
          ...prevPost,
          currentUserHasLiked: true,
          likeCount: prevPost.likeCount + 1,
        };
      });
    } catch (e) {
      Alert.alert("Ops...", "Ocorreu um erro. Tente curtir novamente.");
      console.error("LINKA-LOG: Error during like", e);
    }
  };

  const handleUnlike = async (postId: string) => {
    try {
      await unlikePost(postId);

      setSelectedPost((prevPost) => {
        if (!prevPost || prevPost.id !== postId) return prevPost;

        return {
          ...prevPost,
          currentUserHasLiked: false,
          likeCount: prevPost.likeCount > 0 ? prevPost.likeCount - 1 : 0,
        };
      });
    } catch (e) {
      Alert.alert(
        "Ops...",
        "Ocorreu um erro. Tente remover a curtida novamente."
      );
      console.error("LINKA-LOG: Error during unlike", e);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await sharePost(postId);

      setSelectedPost((prevPost) => {
        if (!prevPost || prevPost.id !== postId) return prevPost;

        return {
          ...prevPost,
          currentUserHasShared: true,
          shareCount: prevPost.shareCount + 1,
        };
      });
    } catch (e) {
      Alert.alert("Ops...", "Ocorreu um erro. Tente compartilhar novamente.");
      console.error("LINKA-LOG: Error during share", e);
    }
  };

  const handleUnshare = async (postId: string) => {
    try {
      await unsharePost(postId);
      setSelectedPost((prevPost) => {
        if (!prevPost) return null;

        return {
          ...prevPost,
          currentUserHasShared: false,
          shareCount: prevPost.shareCount > 0 ? prevPost.shareCount - 1 : 0,
        };
      });
    } catch (e) {
      Alert.alert(
        "Ops...",
        "Ocorreu um erro. Tente remover o compartilhamento novamente."
      );
      console.error("LINKA-LOG: Error during unshare", e);
    }
  };

  const onChange = async () => {
    await fetchUserData();
  };

  const handleSeeMore = () => {
    if (idParam) {
      router.push({
        pathname: `/screens/(tabs)/(profile)/profile/feed/[id]` as const,
        params: { id: idParam },
      });
    } else {
      console.error("ID do usuário não encontrado");
    }
  };

  const handleFollowOrganizaton = async () => {
    try {
      if (organizationData && userType == UserType.ORGANIZATION) {
        await followOrganization(idParam);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("LINKA-LOG: Error following organization");
      Alert.alert(
        "Ops...",
        "Algum erro aconteceu. Tente seguir a organização novamente."
      );
    }
  };

  const handleUnfollowOrganizaton = async () => {
    try {
      if (organizationData && userType == UserType.ORGANIZATION) {
        await unfollowOrganization(idParam);
        setIsFollowing(false);
        setConfirmUnfollowModalVisible(false);
      }
    } catch (error) {
      console.error("LINKA-LOG: Error unfollowing organization");
      Alert.alert(
        "Ops...",
        "Algum erro aconteceu. Tente parar de seguir a organização novamente."
      );
    }
  };

  const handleRequestConnection = async () => {
    try {
      if (volunteerData && userType == UserType.VOLUNTEER) {
        await requestConnection(idParam);
        setConnectionStatus(ConnectionRequestStatus.PENDING);
        setIsCurrentUserRequester(true);
      }
    } catch (error) {
      console.error("LINKA-LOG: Error requesting connection");
      Alert.alert(
        "Ops...",
        "Algum erro aconteceu. Tente solicitar conexão novamente."
      );
    }
  };

  const handleBreackUpConnection = async () => {
    try {
      if (volunteerData && userType == UserType.VOLUNTEER) {
        await breackUpConnection(idParam);
        setConnectionStatus(null);
        setConfirmBreackUpModalVisible(false);
      }
    } catch (error) {
      console.error("LINKA-LOG: Error breaking up connection");
      Alert.alert(
        "Ops...",
        "Algum erro aconteceu. Tente cancelar a conexão novamente."
      );
    }
  };

  const handleDonate = () => {
    setDonateModalVisible(true);
  };

  const handleAcceptConnection = async () => {
    try {
      connectionRequestId && (await acceptConnection(connectionRequestId));
      setConnectionStatus(ConnectionRequestStatus.ACCEPTED);
      setPendingModalVisible(false);
    } catch (error) {
      console.error("LINKA-LOG: Error accepting connection");
      Alert.alert(
        "Ops...",
        "Algum erro aconteceu. Tente aceitar a conexão novamente."
      );
    }
  };

  const handleRejectConnection = async () => {
    try {
      connectionRequestId && (await rejectConnection(connectionRequestId));
      setConnectionStatus(ConnectionRequestStatus.REJECTED);
      setPendingModalVisible(false);
    } catch (error) {
      console.error("LINKA-LOG: Error rejecting connection");
      Alert.alert(
        "Ops...",
        "Algum erro aconteceu. Tente rejeitar a conexão novamente."
      );
    }
  };

  const renderConnectionButton = () => {
    if (loggedUserType == UserType.VOLUNTEER) {
      switch (connectionStatus) {
        case null:
        case ConnectionRequestStatus.REJECTED:
          return (
            <Button
              title="Conectar"
              onPress={() => handleRequestConnection()}
              backgroundColor={Colors.orange}
              textColor={Colors.white}
              borderColor={Colors.orange}
              borderRadius={20}
              height={30}
              width={80}
            />
          );

        case ConnectionRequestStatus.PENDING:
          return isCurrentUserRequester ? (
            <Button
              title="Requisitado"
              onPress={() => {}}
              backgroundColor={Colors.orange}
              textColor={Colors.white}
              borderColor={Colors.orange}
              borderRadius={20}
              height={30}
              width={100}
              disabled={true}
            />
          ) : (
            <Button
              title="Pendente"
              onPress={() => {
                setPendingModalVisible(true);
              }}
              backgroundColor={Colors.orange}
              textColor={Colors.white}
              borderColor={Colors.orange}
              borderRadius={20}
              height={30}
              width={100}
            />
          );

        case ConnectionRequestStatus.ACCEPTED:
        default:
          return (
            <Button
              title="Conectado"
              onPress={() => {
                setConfirmBreackUpModalVisible(true);
              }}
              backgroundColor={Colors.white}
              textColor={Colors.orange}
              borderColor={Colors.orange}
              borderRadius={20}
              height={30}
              width={100}
            />
          );
      }
    }
  };

  const renderFollowButton = () => {
    return isFollowing ? (
      <Button
        title="Seguindo"
        onPress={() => setConfirmUnfollowModalVisible(true)}
        backgroundColor={Colors.white}
        textColor={Colors.gray}
        borderColor={Colors.gray}
        borderRadius={20}
        height={30}
        width={90}
      />
    ) : (
      <Button
        title="Seguir"
        onPress={() => handleFollowOrganizaton()}
        backgroundColor={Colors.orange}
        textColor={Colors.white}
        borderColor={Colors.orange}
        borderRadius={20}
        height={30}
        width={70}
      />
    );
  };

  const handleReturnPage = () => {
    setLoading(true);
    const pageFrom = Array.isArray(params.pageFrom)
      ? params.pageFrom[0]
      : params.pageFrom;
    switch (pageFrom) {
      case "feed":
      case undefined:
      case null:
        router.push("/screens/(tabs)/(feed)/feed");
        break;
      case "search":
        router.push("/screens/(header)/(search)/search");
        break;
      case "events":
        router.push("/screens/(tabs)/(event)/event");
        break;
      case "store":
        router.push("/screens/(tabs)/(store)/store");
        break;
    }
  };

  return (
    <View style={styles.pageColor}>
      <ScrollView>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.orange} />
          </View>
        ) : (
          <View style={styles.container}>
            <View style={styles.profileInfoContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => handleReturnPage()}
              >
                <Ionicons
                  name="arrow-back-outline"
                  size={28}
                  color={Colors.gray}
                />
              </TouchableOpacity>
              {userType === UserType.ORGANIZATION && organizationData && (
                <ProfileInfo
                  username={organizationData.username}
                  userFirstName={organizationData.tradingName}
                  userSurename={""}
                  userProfileImageUrl={
                    organizationData.profilePictureBase64
                      ? {
                          uri: `data:image/${organizationData.profilePictureExtension};base64,${organizationData.profilePictureBase64}`,
                        }
                      : require("@/assets/images/genericalProfilePhoto.jpg")
                  }
                  userType={"Organização"}
                  userFollowers={
                    organizationData.followersCount?.toString() || "0"
                  }
                />
              )}
              {userType === UserType.ORGANIZATION && (
                <View style={styles.locationContainer}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={Colors.gray}
                    style={styles.locationIcon}
                  />
                  <Text style={styles.addressText}>
                    {organizationData?.address.city},{" "}
                    {organizationData?.address.state}
                  </Text>
                </View>
              )}
            </View>

            {userType === UserType.VOLUNTEER && volunteerData && (
              <ProfileInfo
                username={volunteerData.username}
                userFirstName={volunteerData.name}
                userSurename={volunteerData.surname}
                userProfileImageUrl={
                  volunteerData.profilePictureBase64
                    ? {
                        uri: `data:image/${volunteerData.profilePictureExtension};base64,${volunteerData.profilePictureBase64}`,
                      }
                    : require("@/assets/images/genericalProfilePhoto.jpg")
                }
                userType="Voluntário"
                userFollowers={
                  volunteerData.connectionsCount?.toString() || "0"
                }
                userAllPoints={volunteerData.allTimePoints}
              />
            )}

            {userType === UserType.ORGANIZATION && organizationData && (
              <View style={styles.shareRow}>
                <View style={styles.buttonsContainer}>
                  {renderFollowButton()}
                  <View style={styles.buttonSpacing} />
                  <Button
                    title="Doar"
                    onPress={handleDonate}
                    backgroundColor={Colors.white}
                    textColor={Colors.orange}
                    borderColor={Colors.orange}
                    borderRadius={20}
                    height={30}
                    width={70}
                  />
                  <DoarModal
                    visible={donateModalVisible}
                    onClose={() => setDonateModalVisible(false)}
                    companyName={organizationData.companyName}
                    pixKey={organizationData.pixKey}
                  />
                </View>
              </View>
            )}

            {userType === UserType.VOLUNTEER && volunteerData && (
              <View style={styles.shareRow}>
                <View style={styles.buttonsContainer}>
                  {renderConnectionButton()}
                </View>
              </View>
            )}
            <View style={styles.divider} />

            {userType === UserType.ORGANIZATION && (
              <View style={styles.contactContainer}>
                <View style={styles.row}>
                  <Ionicons
                    name="mail-outline"
                    size={24}
                    color={Colors.black}
                    style={{ paddingBottom: 10 }}
                  />
                  <Text style={styles.contactText}>{email}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons
                    name="call-outline"
                    size={24}
                    color={Colors.black}
                    style={{ paddingBottom: 10 }}
                  />
                  <Text style={styles.contactText}>{phone}</Text>
                </View>
              </View>
            )}

            {userType === UserType.ORGANIZATION && (
              <View style={styles.aboutContainer}>
                <View style={styles.aboutHeader}>
                  <Text style={styles.aboutTitle}>Sobre</Text>
                </View>
                <Text style={styles.aboutText}>{about}</Text>
              </View>
            )}

            {userType === UserType.ORGANIZATION && (
              <View style={styles.eventsContainer}>
                <Text style={styles.eventsTitle}>Próximos eventos</Text>
                <View style={styles.eventCaroussel}>
                  <EventListComponent
                    cardShape="square"
                    events={availableEvents}
                    emptyMessage="Nenhum próximo evento disponível"
                    onPress={(eventId: string) =>
                      openEventDetailsModal(eventId)
                    }
                  />
                </View>
              </View>
            )}

            <View style={styles.postListContainer}>
              <Text style={styles.eventsTitle}>Últimas publicações</Text>
              <ProfilePostList
                posts={posts != undefined ? posts : []}
                onPress={(postId: string) => {
                  openPostDatailsModal(postId);
                }}
              />
              <View
                style={[styles.seeMoreButton, { alignItems: "flex-start" }]}
              >
                <Button
                  title="Ver mais"
                  onPress={() => handleSeeMore()}
                  backgroundColor={Colors.white}
                  textColor={Colors.orange}
                  borderColor={Colors.orange}
                  borderRadius={20}
                  height={30}
                  width={70}
                />
              </View>
            </View>

            {userType === UserType.VOLUNTEER && (
              <View style={styles.eventsContainer}>
                <Text style={styles.eventsTitle}>Eventos Participados</Text>
                <View style={styles.eventCaroussel}>
                  <EventListComponent
                    cardShape="square"
                    events={subscribedEvents}
                    emptyMessage="Nenhum evento participado"
                    onPress={(eventId: string) =>
                      openEventDetailsModal(eventId)
                    }
                  />
                </View>
              </View>
            )}

            {userType === UserType.ORGANIZATION && (
              <View style={styles.eventsContainer}>
                <Text style={styles.eventsTitle}>Eventos Realizados</Text>
                <View style={styles.eventCaroussel}>
                  <EventListComponent
                    cardShape="square"
                    events={completedEvents}
                    emptyMessage="Nenhum evento realizado"
                    onPress={(eventId: string) =>
                      openEventDetailsModal(eventId)
                    }
                  />
                </View>
              </View>
            )}
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

        {selectedPost && (
          <PostDetailsModal
            visible={postDatailsModalVisible}
            onClose={closePostDetailsModal}
            post={selectedPost}
            onPressLike={
              selectedPost.currentUserHasLiked
                ? () => handleUnlike(selectedPost.id)
                : () => handleLike(selectedPost.id)
            }
            onPressShare={
              selectedPost.currentUserHasShared
                ? () => handleUnshare(selectedPost.id)
                : () => handleShare(selectedPost.id)
            }
            myPost={false}
            onChange={() => onChange()}
          />
        )}

        <Modal
          animationType="fade"
          transparent={true}
          visible={confirmUnfollowModalVisible}
          onRequestClose={() => setConfirmUnfollowModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                Você realmente deseja parar de seguir esta organização?
              </Text>
              <View style={styles.modalButtonContainer}>
                <Button
                  title="Sim"
                  onPress={() => handleUnfollowOrganizaton()}
                  backgroundColor={Colors.red}
                  textColor={Colors.white}
                  borderColor={Colors.red}
                  borderRadius={15}
                  width={125}
                  height={35}
                />
                <Button
                  title="Não"
                  onPress={() => setConfirmUnfollowModalVisible(false)}
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
          visible={confirmBreackUpModalVisible}
          onRequestClose={() => setConfirmBreackUpModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                Você realmente deseja cancelar a conexão com este voluntário?
              </Text>
              <View style={styles.modalButtonContainer}>
                <Button
                  title="Sim"
                  onPress={() => handleBreackUpConnection()}
                  backgroundColor={Colors.red}
                  textColor={Colors.white}
                  borderColor={Colors.red}
                  borderRadius={15}
                  width={125}
                  height={35}
                />
                <Button
                  title="Não"
                  onPress={() => setConfirmBreackUpModalVisible(false)}
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
          visible={pendingModalVisible}
          onRequestClose={() => setPendingModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={[styles.modalContainer, { height: 125 }]}>
              <View style={styles.closeButton}>
                <Text style={[styles.modalTitle, { marginBottom: 0 }]}>
                  Aceitar está solicitação?
                </Text>
                <TouchableOpacity onPress={() => setPendingModalVisible(false)}>
                  <Ionicons name="close" size={30} color={Colors.gray} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonContainer}>
                <Button
                  title="Rejeitar"
                  onPress={() => handleRejectConnection()}
                  backgroundColor={Colors.white}
                  textColor={Colors.red}
                  borderColor={Colors.red}
                  borderRadius={15}
                  width={125}
                  height={35}
                />
                <Button
                  title="Aceitar"
                  onPress={() => handleAcceptConnection()}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageColor: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  container: {
    backgroundColor: Colors.white,
    padding: 20,
  },
  buttonContainer: {
    marginBottom: 20,
    alignItems: "center",
    alignSelf: "center",
  },
  contactContainer: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contactText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  contactTextInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  aboutContainer: {
    marginBottom: 20,
  },
  aboutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  aboutText: {
    fontSize: 14,
    marginTop: 10,
    color: "gray",
  },
  aboutTextInput: {
    fontSize: 14,
    marginTop: 10,
    color: "gray",
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    borderBottomColor: Colors.mediumGray,
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  eventsContainer: {
    marginTop: 10,
  },
  eventCaroussel: {
    marginTop: 10,
  },
  profileInfoContainer: {
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: 8,
  },
  locationIcon: {
    marginRight: 4,
  },
  addressText: {
    fontSize: 14,
    color: Colors.gray,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    padding: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonSpacing: {
    width: 5,
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
    height: 150,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
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
  postListContainer: {
    marginBottom: 20,
  },
  seeMoreButton: {
    flex: 1,
    alignItems: "flex-start",
    marginTop: 20,
    marginRight: 260,
  },
  closeButton: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 270,
  },
});
