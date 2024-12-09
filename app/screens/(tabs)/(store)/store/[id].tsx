import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { getAllStores } from "@/services/product.service";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { Store } from "@/models/Store";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/baseComponets/Header";
import RewardCardsCarousel from "@/components/storeComponents/RewardCardsCarousel";

export default function StoreDetail() {
  const [storeData, setStoreData] = useState<Store | null>();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const params = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        await fetchStoreData();
        setLoading(false);
      };
      loadData();
    }, [params.id])
  );

  const fetchStoreData = async () => {
    try {
      const responseId = Array.isArray(params.id) ? params.id[0] : params.id;

      const storeProducts = await getAllStores();
      const filteredStore = storeProducts.stores.find(
        (store) => store.organizationId == responseId
      );

      if (filteredStore) {
        setStoreData(filteredStore);
      } else {
        console.error("LINKA-LOG: Store not founded with id: ", responseId);
      }
    } catch (error) {
      console.error("LINKA-LOG: Error loaging store datails: ", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStoreData();
    setRefreshing(false);
  };

  const handleReturn = () => {
    setLoading(true);
    setStoreData(null);
    router.push('/screens/(tabs)/(store)/store');
  }

  return (
    <View style={styles.pageColor}>
      <Header pageFrom='store' />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.orange, Colors.orange]}
          />
        }>
        {loading ?
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.orange} />
          </View> :
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.row}>
                <TouchableOpacity onPress={handleReturn} style={styles.backButton}>
                  <Ionicons
                    name="arrow-back-outline"
                    size={30}
                    color={Colors.orange}
                  />
                </TouchableOpacity>
                <Text style={styles.title}>{storeData?.organizationName}</Text>
              </View>
            </View>
            <View style={styles.rewardsContainer}>
              {storeData && storeData.products.length > 0 ? (
                <RewardCardsCarousel
                  products={storeData.products}
                />
              ) : (
                <Text style={styles.noProductsText}>
                  Nenhuma recompensa cadastrada por esta organização.
                </Text>
              )}
            </View>
          </View>
        }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    alignItems: 'flex-end'
  },
  rewardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flex: 1,
    alignItems: 'flex-start',
  },
  noProductsText: {
    fontSize: 14,
    color: Colors.gray,
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
    width: 150,
    height: 150,
    marginBottom: 10,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 15,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 230,
  },
});
