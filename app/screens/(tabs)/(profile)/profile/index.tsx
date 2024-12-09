import React, { useCallback, useState, useEffect } from "react";
import Button from "@/components/baseComponets/Button";
import { useFocusEffect } from "@react-navigation/native";
import ProfileInfo from "@/components/profileComponents/ProfileInfo";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthProvider";
import { router } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfilePostList from "@/components/profileComponents/ProfilePostsList";
import {
  getValidDecodedToken,
  getOrgVolIdByToken,
} from "@/services/managers/TokenManager";
import {
  getOrganization,
  removeProfilePictureOrganization,
  updateOrganization,
} from "@/services/organization.service";
import {
  getVolunteer,
  getVolunteerEvents,
  removeProfilePictureVolunteer,
  updateVolunteer,
} from "@/services/volunteer.service";
import { Organization } from "@/models/Organization";
import { Volunteer } from "@/models/Volunteer";
import { EventJob } from "@/models/EventJob";
import { getEventJobByEvent } from "@/services/eventJobs.service";
import { UserType } from "@/enums/UserType";
import { EventList } from "@/models/viewModels/EventList";
import { EventStatus } from "@/enums/EventStatus";
import { getEventsByOrganization } from "@/services/event.service";
import { Event } from "@/models/Event";
import EventListComponent from "@/components/eventComponents/EventsList";
import { EventDetailsModal } from "@/components/eventComponents/EventDataislModal";
import {
  getAllPostsByUser,
  likePost,
  sharePost,
  unlikePost,
  unsharePost,
} from "@/services/post.service";
import { PostList } from "@/models/viewModels/PostList";
import PostDetailsModal from "@/components/feedComponents/PostDetailsModal";
import Input from "@/components/baseComponets/Input";
import AddressEditModal from "@/components/profileComponents/AddressEditModal";
import { Address } from "@/models/Address";
import ImageInput from "@/components/baseComponets/ImageInput";
import VolunteerNameEditModal from "@/components/profileComponents/VolunteerNameEditModal";
import EditEmailModal from "@/components/profileComponents/EditEmailModal";
import ModalDonation from "@/components/profileComponents/ModalDonation";
import { MinPointsShieldLevels } from "@/enums/MinPointsShieldLevels";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);
  const [isEditingTradingName, setIsEditingTradingName] =
    useState<boolean>(false);
  const [isEditingVolunteerName, setIsEditingVolunteerName] =
    useState<boolean>(false);
  const [isEditingVolunteerEmail, setIsEditingVolunteerEmail] =
    useState<boolean>(false);
  const [idParam, setIdParam] = useState<string>("");

  const [tempEmail, setTempEmail] = useState<string>("");
  const [tempPhone, setTempPhone] = useState<string>("");
  const [tempAbout, setTempAbout] = useState<string>("");
  const [tempTradingName, setTempTradingName] = useState<string>("");
  const [tempPixKey, setTempPixKey] = useState<string>("");

  const [about, setAbout] = useState("Não há descrição");
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

  const [userType, setUserType] = useState<UserType>(UserType.ORGANIZATION);
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

  const [posts, setPosts] = useState<PostList[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostList | null>(null);
  const [postDatailsModalVisible, setPostDataisModalVisible] = useState(false);
  const [donateModalVisible, setDonateModalVisible] = useState(false);

  const [orgVolId, setOrgVolId] = useState<string>("");
  const [showTooltip, setShowTooltip] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prevKey) => prevKey + 1);
    }, [])
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchUserData();
      setLoading(false);
    };

    fetchData();
  }, [refreshKey]);

  const { onLogout } = useAuth();

  const logout = async () => {
    try {
      const result = await onLogout!();
      setIsEditing(false);
      setIsEditingEmail(false);
      setIsEditingPhone(false);
      setIsEditingAbout(false);
      setIsEditingAddress(false);
      setIsEditingTradingName(false);
      setIsEditingVolunteerName(false);
      setIsEditingVolunteerEmail(false);

      if (result?.error) {
        Alert.alert(result.msg);
      } else {
        router.push("/screens/(auth)/(login)/login");
      }
    } catch (error) {
      console.error("LINKA-LOG: Error during logout:", error);
      throw error;
    }
  };

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  const fetchUserData = async () => {
    const decodedToken = await getValidDecodedToken();

    if (decodedToken) {
      const responseUserType = decodedToken.type;
      const responseId = decodedToken.id;
      setOrgVolId(responseId);

      if (responseUserType == "volunteer") {
        setUserType(UserType.VOLUNTEER);
        const volData = await getVolunteer(responseId);
        volData && setVolunteerData(volData);

        await fetchUserEvents(responseId);
        volData.userId && (await fetchUserPosts(volData.userId));
      } else if (responseUserType == "organization") {
        setUserType(UserType.ORGANIZATION);
        const orgData = await getOrganization(responseId);
        if (orgData) {
          setOrganizationData(orgData);
          setTempEmail(orgData.email);
          setTempPhone(orgData.phone);
          setTempTradingName(orgData.tradingName);
          orgData.about && setTempAbout(orgData.about);
        }

        await fetchUserEvents(responseId);
        orgData.userId && (await fetchUserPosts(orgData.userId));
      }
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

  const updateOrganizationField = async (
    field: keyof Organization,
    value: any
  ) => {
    try {
      const updateData = { [field]: value };

      if (field === "address") {
        const { cep, city, street, number, neighborhood, state } = value;
        if (
          !cep ||
          !city ||
          !street ||
          number === undefined ||
          !neighborhood ||
          !state
        ) {
          throw new Error(
            "Todos os campos do endereço são obrigatórios quando 'address' é atualizado."
          );
        }
      }

      await updateOrganization(updateData);

      setOrganizationData((prevOrganization) => {
        if (!prevOrganization) return null;

        return {
          ...prevOrganization,
          [field]: value,
        };
      });
    } catch (error) {
      console.error(`LINKA-LOG: Error updating organization ${field}`, error);
    }
  };

  const removeOrganizationProfileImage = async () => {
    await removeProfilePictureOrganization();

    setOrganizationData((prevOrganization) => {
      if (!prevOrganization) return null;

      return {
        ...prevOrganization,
        profilePictureBase64: "",
      };
    });
  };

  const updateVolunteerField = async (field: keyof Volunteer, value: any) => {
    try {
      const updateData = { [field]: value };

      if (field === "address") {
        const { cep, city, street, number, neighborhood, state } = value;
        if (
          !cep ||
          !city ||
          !street ||
          number === undefined ||
          !neighborhood ||
          !state
        ) {
          throw new Error(
            "Todos os campos do endereço são obrigatórios quando 'address' é atualizado."
          );
        }
      }

      await updateVolunteer(updateData);

      setVolunteerData((prevVolunteer) => {
        if (!prevVolunteer) return null;

        return {
          ...prevVolunteer,
          [field]: value,
        };
      });
    } catch (error) {
      console.error(`LINKA-LOG: Error updating volunteer ${field}`, error);
    }
  };

  const removeVolunteerProfileImage = async () => {
    await removeProfilePictureVolunteer();

    setVolunteerData((prevVolunteer) => {
      if (!prevVolunteer) return null;

      return {
        ...prevVolunteer,
        profilePictureBase64: "",
      };
    });
  };

  const handleSaveEmail = () => {
    updateOrganizationField("email", tempEmail);
    setIsEditingEmail(false);
  };

  const handleSavePhone = () => {
    updateOrganizationField("phone", tempPhone);
    setIsEditingPhone(false);
  };

  const handleSaveAbout = () => {
    updateOrganizationField("about", tempAbout);
    setIsEditingAbout(false);
  };

  const handleAddressOrganizationSave = (updatedAddress: any) => {
    updateOrganizationField("address", updatedAddress);
    setIsEditingAddress(false);
  };

  const handleAddressVoluntterSave = (updatedAddress: any) => {
    updateVolunteerField("address", updatedAddress);
    setIsEditingAddress(false);
  };

  const handleSaveTradingName = () => {
    updateOrganizationField("tradingName", tempTradingName);
    setIsEditingTradingName(false);
  };

  const handleSavePixKey = (newPixKey: string) => {
    updateOrganizationField("pixKey", newPixKey);
    console.log(newPixKey);
  };

  const handleVolunteerNameSave = (updatedFullName: {
    name: string;
    surname: string;
  }) => {
    updateVolunteerField("name", updatedFullName.name);
    updateVolunteerField("surname", updatedFullName.surname);
    setIsEditingAddress(false);
  };

  const handleVolunteerEmailSave = (updatedAddress: any) => {
    updateVolunteerField("email", updatedAddress);
    setIsEditingAddress(false);
  };

  const onChange = async () => {
    await fetchUserEvents(orgVolId);
    await fetchUserPosts(orgVolId);
  };

  const handleSeeMore = () => {
    if (orgVolId) {
      router.push({
        pathname: `/screens/(tabs)/(profile)/profile/feed/[id]` as const,
        params: { id: orgVolId },
      });
    } else {
      console.error("ID do usuário não encontrado");
    }
  };

  const handleDonate = () => {
    setDonateModalVisible(true);
  };

  const returnShieldColor = (points: number): string => {
    if (points >= MinPointsShieldLevels.DIAMOND) {
      return Colors.diamond;
    } else if (points >= MinPointsShieldLevels.GOLD) {
      return Colors.gold;
    } else if (points >= MinPointsShieldLevels.SILVER) {
      return Colors.silver;
    } else {
      return Colors.bronze;
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
          <>
            <View style={styles.container}>
              <View style={styles.profileInfoContainer}>
                {userType === UserType.ORGANIZATION && organizationData && (
                  <View style={styles.headerContainer}>
                    <View style={styles.header}>
                      {isEditing ? (
                        <ImageInput
                          imageUri={organizationData.profilePictureBase64 || ""}
                          onImageSelect={(imageUri) =>
                            updateOrganizationField(
                              "profilePictureBase64",
                              imageUri
                            )
                          }
                          onEditPress={removeOrganizationProfileImage}
                          onPress={() => {}}
                          shape="rounded"
                          inputHeight={125}
                          inputWidth={125}
                        />
                      ) : (
                        <Image
                          source={
                            organizationData.profilePictureBase64
                              ? {
                                  uri: `data:image/${organizationData.profilePictureExtension};base64,${organizationData.profilePictureBase64}`,
                                }
                              : require("@/assets/images/genericalProfilePhoto.jpg")
                          }
                          style={styles.profileImage}
                        />
                      )}

                      <View style={styles.userInfo}>
                        <Text style={styles.userType}>Organização</Text>
                        <Text style={styles.username}>
                          @{organizationData.username}
                        </Text>

                        <View style={styles.row}>
                          {isEditingTradingName ? (
                            <Input
                              value={tempTradingName}
                              onChangeText={(text) => setTempTradingName(text)}
                              width={140}
                            />
                          ) : (
                            <Text style={styles.userFullName}>
                              {organizationData.tradingName}
                            </Text>
                          )}

                          {isEditing && (
                            <TouchableOpacity
                              onPress={
                                isEditingTradingName
                                  ? handleSaveTradingName
                                  : () => setIsEditingTradingName(true)
                              }
                            >
                              <Ionicons
                                name={
                                  isEditingTradingName ? "checkmark" : "pencil"
                                }
                                size={isEditingTradingName ? 24 : 18}
                                color={Colors.gray}
                                style={{ marginLeft: 8 }}
                              />
                            </TouchableOpacity>
                          )}
                        </View>

                        <Text style={styles.userFollowers}>
                          {organizationData.followersCount?.toString() || "0"}{" "}
                          Seguidores
                        </Text>

                        <View style={styles.locationContainer}>
                          <Ionicons
                            name="location-outline"
                            size={16}
                            color={Colors.gray}
                          />
                          <Text style={styles.addressText}>
                            {organizationData.address.city},{" "}
                            {organizationData.address.state}
                          </Text>
                          {isEditing && (
                            <TouchableOpacity
                              onPress={() => setIsEditingAddress(true)}
                            >
                              <Ionicons
                                name="pencil"
                                size={18}
                                color={Colors.gray}
                                style={{ paddingStart: 7 }}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.row,
                        { marginTop: 20, justifyContent: "flex-start" },
                      ]}
                    >
                      <View style={[{ marginRight: 10 }]}>
                        <Button
                          title={isEditing ? "Feito" : "Editar"}
                          iconName={isEditing ? "checkmark" : "pencil"}
                          onPress={
                            isEditing
                              ? () => setIsEditing(false)
                              : () => setIsEditing(true)
                          }
                          backgroundColor={Colors.white}
                          textColor={Colors.gray}
                          borderColor={Colors.gray}
                          borderRadius={12}
                          height={30}
                          width={80}
                        />
                      </View>
                      <View style={[{ marginRight: 10 }]}>
                        <Button
                          title="Doação"
                          onPress={handleDonate}
                          backgroundColor={Colors.white}
                          textColor={Colors.orange}
                          borderColor={Colors.orange}
                          borderRadius={12}
                          height={30}
                          width={80}
                        />
                        <ModalDonation
                          visible={donateModalVisible}
                          onClose={() => setDonateModalVisible(false)}
                          companyName={organizationData.companyName}
                          pixKey={organizationData.pixKey}
                          handleSavePixKey={handleSavePixKey}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {userType === UserType.VOLUNTEER && volunteerData && (
                  <View style={styles.headerContainer}>
                    <View style={styles.header}>
                      {isEditing ? (
                        <ImageInput
                          imageUri={volunteerData.profilePictureBase64 || ""}
                          onImageSelect={(imageUri) =>
                            updateVolunteerField(
                              "profilePictureBase64",
                              imageUri
                            )
                          }
                          onEditPress={removeVolunteerProfileImage}
                          onPress={() => {}}
                          shape="rounded"
                          inputHeight={125}
                          inputWidth={125}
                        />
                      ) : (
                        <>
                          <Image
                            source={
                              volunteerData.profilePictureBase64
                                ? {
                                    uri: `data:image/${volunteerData.profilePictureExtension};base64,${volunteerData.profilePictureBase64}`,
                                  }
                                : require("@/assets/images/genericalProfilePhoto.jpg")
                            }
                            style={styles.profileImage}
                          />
                          <TouchableOpacity
                            style={styles.volunteerShield}
                            onPress={toggleTooltip}
                          >
                            <Ionicons
                              name="shield"
                              size={45}
                              color={returnShieldColor(
                                volunteerData.allTimePoints || 0
                              )}
                            />
                          </TouchableOpacity>
                        </>
                      )}
                      <View style={styles.userInfo}>
                        <View style={[styles.row, { marginBottom: 15 }]}>
                          <Button
                            title={isEditing ? "Feito" : "Editar"}
                            iconName={isEditing ? "checkmark" : "pencil"}
                            onPress={
                              isEditing
                                ? () => setIsEditing(false)
                                : () => setIsEditing(true)
                            }
                            backgroundColor={Colors.white}
                            textColor={Colors.gray}
                            borderColor={Colors.gray}
                            borderRadius={12}
                            height={30}
                            width={100}
                          />
                        </View>

                        <Text style={styles.userType}>Voluntário</Text>
                        <Text style={styles.username}>
                          @{volunteerData.username}
                        </Text>

                        <View style={styles.row}>
                          <Text
                            style={styles.userFullName}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {volunteerData.name} {volunteerData.surname}
                          </Text>

                          {isEditing && (
                            <TouchableOpacity
                              onPress={() => setIsEditingVolunteerName(true)}
                            >
                              <Ionicons
                                name={
                                  isEditingTradingName ? "checkmark" : "pencil"
                                }
                                size={isEditingTradingName ? 24 : 18}
                                color={Colors.gray}
                                style={{ marginLeft: 8 }}
                              />
                            </TouchableOpacity>
                          )}
                        </View>

                        <Text style={styles.userFollowers}>
                          {volunteerData.connectionsCount?.toString() || "0"}{" "}
                          Conexões
                        </Text>

                        <Text style={styles.userPoints}>
                          {volunteerData.allTimePoints || 0} pontos
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.divider} />

              {userType === UserType.ORGANIZATION && organizationData && (
                <View style={styles.contactContainer}>
                  <View style={[styles.row, { marginBottom: 10 }]}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={Colors.black}
                      style={{ paddingEnd: 5 }}
                    />
                    {isEditingEmail ? (
                      <Input
                        value={tempEmail}
                        onChangeText={(text) => setTempEmail(text)}
                        width={250}
                      />
                    ) : (
                      <Text style={styles.contactText}>
                        {organizationData.email}
                      </Text>
                    )}

                    {isEditing && (
                      <TouchableOpacity
                        onPress={
                          isEditingEmail
                            ? handleSaveEmail
                            : () => setIsEditingEmail(true)
                        }
                      >
                        <Ionicons
                          name={isEditingEmail ? "checkmark" : "pencil"}
                          size={isEditingEmail ? 24 : 18}
                          color={Colors.gray}
                          style={{ marginLeft: 8 }}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={[styles.row, { marginBottom: 15 }]}>
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={Colors.black}
                      style={{ paddingEnd: 5 }}
                    />
                    {isEditingPhone ? (
                      <Input
                        value={tempPhone}
                        onChangeText={(text) => setTempPhone(text)}
                        maskType="phone"
                        width={250}
                      />
                    ) : (
                      <Text style={styles.contactText}>
                        {organizationData.phone}
                      </Text>
                    )}

                    {isEditing && (
                      <TouchableOpacity
                        onPress={
                          isEditingPhone
                            ? handleSavePhone
                            : () => setIsEditingPhone(true)
                        }
                      >
                        <Ionicons
                          name={isEditingPhone ? "checkmark" : "pencil"}
                          size={isEditingPhone ? 24 : 18}
                          color={Colors.gray}
                          style={{ marginLeft: 8 }}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.aboutContainer}>
                    <View style={styles.aboutHeader}>
                      <Text style={styles.aboutTitle}>Sobre</Text>

                      {isEditing && (
                        <TouchableOpacity
                          onPress={
                            isEditingAbout
                              ? handleSaveAbout
                              : () => setIsEditingAbout(true)
                          }
                        >
                          <Ionicons
                            name={isEditingAbout ? "checkmark" : "pencil"}
                            size={isEditingAbout ? 24 : 18}
                            color={Colors.gray}
                            style={{ marginLeft: 8 }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {isEditingAbout ? (
                      <Input
                        value={tempAbout}
                        onChangeText={(text) => setTempAbout(text)}
                      />
                    ) : (
                      <Text style={styles.aboutText}>
                        {organizationData.about}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {userType === UserType.VOLUNTEER && isEditing && (
                <View
                  style={[
                    styles.row,
                    { marginHorizontal: 10, marginBottom: 20 },
                  ]}
                >
                  <Button
                    title="Editar Endereço"
                    iconName="pencil"
                    onPress={() => setIsEditingAddress(true)}
                    backgroundColor={Colors.white}
                    textColor={Colors.gray}
                    borderColor={Colors.gray}
                    borderRadius={12}
                    height={30}
                    width={150}
                  />

                  <Button
                    title="Editar Email"
                    iconName="pencil"
                    onPress={() => setIsEditingVolunteerEmail(true)}
                    backgroundColor={Colors.white}
                    textColor={Colors.gray}
                    borderColor={Colors.gray}
                    borderRadius={12}
                    height={30}
                    width={150}
                  />
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
                  style={[styles.seeMoreButton, { alignItems: "flex-end" }]}
                >
                  <TouchableOpacity onPress={() => handleSeeMore()}>
                    <Text style={styles.readMore}>Ver todos</Text>
                  </TouchableOpacity>
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

            <View style={styles.buttonContainer}>
              <Button
                title="Sair da Conta"
                onPress={logout}
                backgroundColor={Colors.white}
                textColor={Colors.red}
                borderColor={Colors.red}
                borderRadius={12}
                height={30}
                width={200}
                iconName="log-out-outline"
              />
            </View>

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
                myPost={true}
                onChange={() => onChange()}
              />
            )}

            {organizationData && organizationData.address && (
              <AddressEditModal
                visible={isEditingAddress}
                address={organizationData.address}
                onSave={(adress: Address) =>
                  handleAddressOrganizationSave(adress)
                }
                onClose={() => setIsEditingAddress(false)}
              />
            )}

            {volunteerData && volunteerData.address && (
              <AddressEditModal
                visible={isEditingAddress}
                address={volunteerData.address}
                onSave={(adress: Address) => handleAddressVoluntterSave(adress)}
                onClose={() => setIsEditingAddress(false)}
              />
            )}

            {volunteerData && (
              <VolunteerNameEditModal
                visible={isEditingVolunteerName}
                name={volunteerData.name}
                surname={volunteerData.surname}
                onSave={(fullname: { name: string; surname: string }) =>
                  handleVolunteerNameSave(fullname)
                }
                onClose={() => setIsEditingVolunteerName(false)}
              />
            )}

            {volunteerData && (
              <EditEmailModal
                visible={isEditingVolunteerEmail}
                email={volunteerData.email}
                onSave={(email) => handleVolunteerEmailSave(email)}
                onClose={() => setIsEditingVolunteerEmail(false)}
              />
            )}

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
                      <Text style={styles.aboutTitle}>O que é o escudo?</Text>
                      <TouchableOpacity onPress={() => toggleTooltip()}>
                        <Ionicons name="close" size={28} color={Colors.gray} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.tooltipText}>
                      O escudo é o símbolo do seu nível de engajamento!
                      {"\n\n"}
                      Ele muda de cor conforme você acumula pontos:
                      {"\n\n"}
                      <Text style={{ fontWeight: "bold" }}>• Bronze:</Text> 0-10
                      pontos
                      {"\n"}
                      <Text style={{ fontWeight: "bold" }}>• Prata:</Text> 11-30
                      pontos
                      {"\n"}
                      <Text style={{ fontWeight: "bold" }}>• Ouro:</Text> 31-70
                      pontos
                      {"\n"}
                      <Text style={{ fontWeight: "bold" }}>
                        • Diamante:
                      </Text>{" "}
                      71+ pontos
                      {"\n\n"}
                      Cada cor destaca sua jornada e conquista. Continue
                      avançando!
                    </Text>
                  </View>
                </TouchableOpacity>
              </Modal>
            )}
          </>
        )}
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
    marginTop: 20,
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
    marginBottom: 30,
    marginTop: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventsContainer: {
    marginTop: 10,
  },
  eventCaroussel: {
    marginTop: 10,
  },
  profileInfoContainer: {
    marginBottom: 0,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonSpacing: {
    width: 10,
  },
  postListContainer: {
    marginBottom: 20,
  },
  headerContainer: {
    padding: 10,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileImage: {
    width: 125,
    height: 125,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    marginRight: 10,
  },
  userInfo: {
    width: "50%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: 5,
  },
  username: {
    marginBottom: 13,
    fontSize: 12,
  },
  userFollowers: {
    fontWeight: "bold",
    fontSize: 16,
  },
  userFullName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 5,
  },
  userType: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 3,
  },
  locationIcon: {
    marginRight: 4,
  },
  addressText: {
    fontSize: 14,
    color: Colors.gray,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: 8,
    marginTop: 10,
  },
  seeMoreButton: {
    flex: 1,
    alignItems: "flex-end",
    marginTop: 20,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 270,
  },
  volunteerShield: {
    marginLeft: -45,
    marginRight: 5,
    marginTop: 70,
  },
  userPoints: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 5,
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
  readMore: {
    color: Colors.orange,
    fontSize: 12,
    alignSelf: "flex-end",
    textDecorationLine: "underline",
    marginBottom: 10,
  },
});
