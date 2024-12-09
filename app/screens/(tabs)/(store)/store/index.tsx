import Header from "@/components/baseComponets/Header";
import RewardCard from "@/components/storeComponents/RewardCard";
import RewardCardsCarousel from "@/components/storeComponents/RewardCardsCarousel";
import { Colors } from "@/constants/Colors";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { getValidDecodedToken } from "@/services/managers/TokenManager";
import { UserType } from "@/enums/UserType";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Button from "@/components/baseComponets/Button";
import { Image } from "react-native";
import {
  deleteProductById,
  getAllStores,
  getProductsByOrganization,
  updateProduct,
} from "@/services/product.service";
import { Product } from "@/models/Product";
import { Store } from "@/models/Store";
import { MyProductsModal } from "@/components/storeComponents/MyProductsModal";
import { Volunteer } from "@/models/Volunteer";
import { getVolunteer } from "@/services/volunteer.service";

export default function Stores() {
  const [userType, setUserType] = useState<UserType>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stores, setStores] = useState<Store[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [volunteerData, setVolunteerData] = useState<Volunteer>();

  const [modalVisible, setModalVisible] = useState(false);
  const [myProductsModalVisible, setMyProductsModalVisible] = useState(false);
  const [modalFilterOption, setModalFilterOption] = useState<
    "withdraw" | "canceled" | "reserved"
  >("reserved");
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editedProduct, setEditedProduct] = useState({
    name: "",
    cost: "",
    availableQuantity: "",
  });

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUserAndProducts();
      setLoading(false);
    };
    loadData();
  }, [refreshKey]);

  const fetchVolunteerData = async (
    volunteerId: string
  ): Promise<Volunteer | undefined> => {
    try {
      const response = await getVolunteer(volunteerId);
      return response as Volunteer;
    } catch (error) {
      console.error("LINKA-LOG: Error fetching volunteer data:", error);
      throw error;
    }
  };

  const fetchUserAndProducts = async () => {
    try {
      const decodedToken = await getValidDecodedToken();
      console.log("Decoded Token:", decodedToken);

      if (decodedToken?.type === "organization") {
        setUserType(UserType.ORGANIZATION);

        const productsData = await getProductsByOrganization();
        console.log("LINKA-LOG: Products Data:", productsData);
        setProducts(productsData);
      } else {
        setUserType(UserType.VOLUNTEER);
        const response = await getAllStores();
        setStores(response.stores);

        if (decodedToken) {
          const volunteerResponse = await fetchVolunteerData(decodedToken?.id);
          console.log(volunteerResponse);
          setVolunteerData(volunteerResponse);
        }
      }
    } catch (error) {
      console.error("LINKA-LOG: Erro ao buscar usuário ou produtos:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserAndProducts();
    setRefreshing(false);
  };

  const handleOrgReward = (id: string) => {
    if (id) {
      router.push({
        pathname: `/screens/(tabs)/(store)/store/[id]`,
        params: { id: id },
      });
    } else {
      console.error("ID do usuário não encontrado");
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setEditedProduct({
      name: product.name,
      cost: product.cost.toString(),
      availableQuantity: product.availableQuantity.toString(),
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReward(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleRemove = () => {
    if (!selectedProduct) {
      console.error("Nenhum produto selecionado para remoção.");
      return;
    }
    Alert.alert(
      "Confirmar remoção",
      "Você tem certeza que deseja remover este produto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          onPress: async () => {
            try {
              await deleteProductById(selectedProduct.id);

              setProducts((prevProducts) =>
                prevProducts.filter(
                  (product) => product.id !== selectedProduct.id
                )
              );
              setModalVisible(false);

              console.log("Produto removido com sucesso!");
            } catch (error) {
              console.error("Erro ao remover o produto:", error);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!selectedProduct) {
      console.error("Nenhum produto selecionado para atualização.");
      return;
    }

    if (
      !editedProduct.name ||
      !editedProduct.cost ||
      !editedProduct.availableQuantity
    ) {
      console.error("Todos os campos são obrigatórios.");
      return;
    }

    try {
      const updateData = {
        id: selectedProduct.id,
        name: editedProduct.name,
        cost: parseFloat(editedProduct.cost),
        availableQuantity: parseInt(editedProduct.availableQuantity, 10),
      };

      console.log("Atualizando produto com dados:", updateData);

      await updateProduct(updateData);

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === selectedProduct.id
            ? { ...product, ...updateData }
            : product
        )
      );
      setIsEditing(false);
      setModalVisible(false);
      console.log("Produto atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar o produto:", error);
    }
  };

  const openReservationsModal = async (
    filter: "withdraw" | "canceled" | "reserved"
  ) => {
    setMyProductsModalVisible(true);
    setModalFilterOption(filter);
  };

  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <View style={styles.pageColor}>
      <Header pageFrom="store" />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.orange, Colors.orange]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.orange} />
          </View>
        ) : (
          <View style={styles.container}>
            {userType === UserType.ORGANIZATION && (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>Minha Loja</Text>

                  <TouchableOpacity onPress={toggleOptions}>
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color={Colors.black}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.rewardsContainer}>
                  {products.length === 0 ? (
                    <Text style={styles.noProductsText}>
                      Você não possui recompensas cadastradas no momento.
                    </Text>
                  ) : (
                    products.map((product) => (
                      <RewardCard
                        key={product.id}
                        rewardImageUrl={product.imageBase64}
                        rewardTitle={product.name}
                        rewardPoints={`${product.cost} pontos`}
                        rewardQtn={`${product.availableQuantity}`}
                        onPress={() => openModal(product)}
                      />
                    ))
                  )}
                </View>
              </>
            )}

            {userType === UserType.VOLUNTEER && (
              <>
                <View style={styles.header}>
                  <View>
                    <Text style={styles.title}>Loja de Recompensas</Text>
                    {userType == UserType.VOLUNTEER && (
                      <Text style={styles.avaiablePointsText}>
                        Pontos Disponíveis:{" "}
                        {(volunteerData && volunteerData.points) || 0}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity onPress={toggleOptions}>
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color={Colors.black}
                    />
                  </TouchableOpacity>
                </View>

                {stores.length === 0 ? (
                  <Text style={styles.noProductsText}>
                    Nenhuma organização possui produtos disponíveis no momento.
                  </Text>
                ) : (
                  stores.map((store) => (
                    <View key={store.organizationId}>
                      <TouchableOpacity
                        style={styles.orgButton}
                        onPress={() => handleOrgReward(store.organizationId)}
                      >
                        <Text style={styles.subTitle}>
                          {store.organizationName}
                        </Text>
                        <Ionicons
                          name="chevron-forward-outline"
                          size={18}
                          color={Colors.black}
                        />
                      </TouchableOpacity>
                      <RewardCardsCarousel products={store.products} />
                    </View>
                  ))
                )}
              </>
            )}

            <Modal
              visible={modalVisible}
              animationType="fade"
              onRequestClose={closeModal}
              transparent={true}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <TouchableOpacity onPress={closeModal} style={styles.close}>
                    <Ionicons
                      name="close-outline"
                      size={30}
                      color={Colors.gray}
                      style={styles.iconBack}
                    />
                  </TouchableOpacity>
                  {selectedProduct && (
                    <>
                      {selectedProduct.imageBase64 == "" ||
                      selectedProduct.imageBase64 == undefined ||
                      selectedProduct.imageBase64 == null ? (
                        <Image
                          source={require("@/assets/images/generalGraySquare.png")}
                          style={styles.modalImage}
                        />
                      ) : (
                        <Image
                          source={{
                            uri: `data:image/png;base64,${selectedProduct.imageBase64}`,
                          }}
                          style={styles.modalImage}
                        />
                      )}

                      <Text style={styles.modalTitle}>
                        {selectedProduct.name}
                      </Text>

                      <View style={styles.editableField}>
                        <Text style={styles.fieldLabel}>Pontos:</Text>
                        {isEditing ? (
                          <TextInput
                            style={styles.inputField}
                            value={editedProduct.cost}
                            onChangeText={(text) =>
                              setEditedProduct({
                                ...editedProduct,
                                cost: text,
                              })
                            }
                            keyboardType="numeric"
                          />
                        ) : (
                          <Text style={styles.modalText}>
                            {`${selectedProduct.cost} pontos`}
                          </Text>
                        )}
                      </View>

                      <View style={styles.editableField}>
                        <Text style={styles.fieldLabel}>Quantidade:</Text>
                        {isEditing ? (
                          <TextInput
                            style={styles.inputField}
                            value={editedProduct.availableQuantity}
                            onChangeText={(text) =>
                              setEditedProduct({
                                ...editedProduct,
                                availableQuantity: text,
                              })
                            }
                            keyboardType="numeric"
                          />
                        ) : (
                          <Text style={styles.modalText}>
                            {`${selectedProduct.availableQuantity} disponíveis`}
                          </Text>
                        )}
                      </View>

                      <View style={styles.row}>
                        <Button
                          title="Remover"
                          onPress={handleRemove}
                          backgroundColor={Colors.white}
                          textColor={Colors.red}
                          borderColor={Colors.red}
                          borderRadius={20}
                          height={30}
                          width={100}
                          iconName="trash-outline"
                        />

                        {isEditing ? (
                          <Button
                            title="Salvar"
                            onPress={handleSave}
                            backgroundColor={Colors.orange}
                            textColor={Colors.white}
                            borderColor={Colors.orange}
                            borderRadius={20}
                            height={30}
                            width={100}
                            iconName="checkmark-circle-outline"
                          />
                        ) : (
                          <Button
                            title="Editar"
                            onPress={handleEdit}
                            backgroundColor={Colors.white}
                            textColor={Colors.gray}
                            borderColor={Colors.gray}
                            borderRadius={20}
                            height={30}
                            width={100}
                            iconName="pencil-outline"
                          />
                        )}
                      </View>
                    </>
                  )}
                </View>
              </View>
            </Modal>

            <MyProductsModal
              visible={myProductsModalVisible}
              onClose={() => setMyProductsModalVisible(false)}
              userType={userType || UserType.VOLUNTEER}
              filter={modalFilterOption}
            />

            {showOptions && (
              <View style={styles.optionsMenu}>
                <Button
                  title="Reservados"
                  onPress={() => {
                    openReservationsModal("reserved");
                  }}
                  backgroundColor={Colors.white}
                  textColor={Colors.orange}
                  borderColor={Colors.orange}
                  borderRadius={20}
                  height={40}
                  width={130}
                  iconName="bag-outline"
                />

                <Button
                  title="Resgatados"
                  onPress={() => {
                    openReservationsModal("withdraw");
                  }}
                  backgroundColor={Colors.white}
                  textColor={Colors.green}
                  borderColor={Colors.green}
                  borderRadius={20}
                  height={40}
                  width={130}
                  iconName="checkmark-circle-outline"
                />
                <Button
                  title="Cancelados"
                  onPress={() => {
                    openReservationsModal("canceled");
                  }}
                  backgroundColor={Colors.white}
                  textColor={Colors.red}
                  borderColor={Colors.red}
                  borderRadius={20}
                  height={40}
                  width={130}
                  iconName="close-circle-outline"
                />
              </View>
            )}
          </View>
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
    padding: 30,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  rewardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  orgButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  subTitle: {
    fontSize: 16,
    color: Colors.black,
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalText1: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalText2: {
    fontSize: 16,
    marginBottom: 20,
  },
  iconBack: {
    marginEnd: 10,
  },
  close: {
    alignSelf: "flex-end",
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
    marginTop: 15,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    gap: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 15,
    marginTop: 5,
  },
  modalText: {
    fontSize: 16,
    marginLeft: 10,
  },
  inputField: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.lightGray,
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
    width: 60,
    textAlign: "center",
  },
  titleInput: {
    width: 150,
  },
  editableField: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  noProductsText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "left",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 230,
  },
  optionsMenu: {
    position: "absolute",
    top: 60,
    right: 35,
    gap: 5,
    backgroundColor: Colors.white,
    padding: 10,
    marginTop: 5,
    marginRight: 5,
    borderRadius: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avaiablePointsText: {
    marginTop: 5,
    fontSize: 16,
    fontStyle: "italic",
    color: Colors.gray,
  },
});
