import React, { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  getOrgVolIdByToken,
  getValidDecodedToken,
} from "@/services/managers/TokenManager";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Input from "@/components/baseComponets/Input";
import Button from "@/components/baseComponets/Button";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import ImageInput from "@/components/baseComponets/ImageInput";
import { router } from "expo-router";
import { PostCreate } from "@/models/viewModels/PostCreate";
import { addPost } from "@/services/post.service";
import { UserType } from "@/enums/UserType";
import Select from "@/components/baseComponets/Select";
import { getFollowingOrganizations } from "@/services/organization.service";

type Option = {
  label: string;
  value: string;
};

export default function NewPost() {
  const [orgVolId, setOrgVolId] = useState("");

  const [description, setDescription] = useState("");
  const [orgAssociadaId, setOrgAssociadaId] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const [errorDescription, setErrorDescription] = useState("");
  const [errorOrgAssociada, setErrorOrgAssociada] = useState("");
  const [userType, setUserType] = useState<UserType>();
  const [refreshKey, setRefreshKey] = useState(0);

  const [followedOrganizationsOptions, setFollowedOrganizationsOptions] =
    useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option>({
    label: "",
    value: "",
  });

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prevKey) => prevKey + 1);
    }, [setRefreshKey])
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await fetchUserType();
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, [refreshKey]);

  const fetchUserType = async () => {
    const decodedToken = await getValidDecodedToken();

    if (decodedToken && decodedToken.type) {
      const userType = decodedToken.type;
      const orgVolId = decodedToken.id;
      setOrgVolId(orgVolId);

      if (userType === "volunteer") {
        setUserType(UserType.VOLUNTEER);
        await fetchOrganizationsFollowedByVolunteer();
      } else if (userType === "organization" && orgVolId) {
        setUserType(UserType.ORGANIZATION);
        setOrgAssociadaId(orgVolId);
      }
    }
  };

  const fetchOrganizationsFollowedByVolunteer = async () => {
    try {
      const allOrganizations = await getFollowingOrganizations();

      const organizationOptions: Option[] = allOrganizations
        .filter((organization) => organization.tradingName !== undefined)
        .map((organization) => ({
          label: organization.tradingName,
          value: organization.id as string,
        }));

      console.log(organizationOptions);

      setFollowedOrganizationsOptions(organizationOptions);
    } catch (error) {
      console.error("LINKA-LOG: Error loading followed organizations.", error);
    }
  };

  const handleImageSelect = (base64: string) => {
    setImageUri(base64);
  };

  const handleEditPress = () => {
    setImageUri(undefined);
  };

  const publishPost = async () => {
    try {
      let valid = true;

      if (!description) {
        setErrorDescription("Por favor, insira uma descrição.");
        valid = false;
      } else {
        setErrorDescription("");
      }

      if (userType == UserType.VOLUNTEER && !orgAssociadaId) {
        setErrorOrgAssociada("Por favor, insira uma organização associada.");
        valid = false;
      } else {
        setErrorOrgAssociada("");
      }

      if (!valid) return;

      const post: PostCreate = {
        description: description,
        associatedOrganizationId: orgAssociadaId,
        imageBase64: imageUri ? imageUri : null,
      };

      await addPost(post);
      Alert.alert("Sucesso", "Post criado com sucesso!");
      clearPost();
      router.push({ pathname: "/screens/feed" });
    } catch (error) {
      Alert.alert("Erro", "Opss... Erro ao cadastrar evento");
      console.error("Erro ao publicar post:", error);
    }

    console.log(orgAssociadaId);
  };

  const cancelPost = () => {
    clearPost();
    router.push({ pathname: "/screens/(tabs)/(feed)/feed" });
  };

  const clearPost = () => {
    setDescription("");
    setImageUri("");
    setOrgAssociadaId("");
    setSelectedOption({
      label: "",
      value: "",
    });
  };

  return (
    <View style={styles.pageColor}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Nova Publicação</Text>
            <TouchableOpacity onPress={cancelPost}>
              <Ionicons
                name="close-outline"
                size={30}
                color={Colors.gray}
                style={styles.iconBack}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <ImageInput
              imageUri={imageUri}
              onImageSelect={handleImageSelect}
              onEditPress={handleEditPress}
              onPress={() => {}}
              resolutionHeight={1080}
              resolutionWidth={1080}
              inputHeight={300}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label="Descrição"
              value={description}
              onChangeText={setDescription}
              keyboardType="default"
            />
            {errorDescription ? (
              <Text style={styles.error}>{errorDescription}</Text>
            ) : null}
          </View>

          {userType == UserType.VOLUNTEER && (
            <View style={styles.inputContainer}>
              <Select
                label="Organização Associada"
                options={followedOrganizationsOptions}
                onValueChange={(option: Option) => {
                  setSelectedOption(option);
                  setOrgAssociadaId(option.value);
                }}
                selectedValue={selectedOption.value}
              />
              {errorOrgAssociada ? (
                <Text style={styles.error}>{errorOrgAssociada}</Text>
              ) : null}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Publicar"
              onPress={publishPost}
              backgroundColor={Colors.orange}
              textColor={Colors.white}
              borderColor={Colors.orange}
              borderRadius={12}
              height={40}
              width={335}
            />
          </View>
        </View>
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
    padding: 20,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  iconBack: {
    marginEnd: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: "center",
    gap: 7,
  },
  error: {
    color: Colors.red,
  },
});
