import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import RewardCard from './RewardCard';
import { Colors } from '@/constants/Colors';
import Button from "@/components/baseComponets/Button";
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addProductReservation } from '@/services/productReservation.service';
import { Product } from '@/models/Product';

type Props = {
  products: Product[];
  onPress?: () => void,
  onChange?: () => void,
};

export default function RewardCardsCarousel(props: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Product | null>(null);

  const openModal = (reward: Product) => {
    setSelectedReward(reward);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReward(null);
  };

  const handleReward = async (product: Product) => {
    try {
      await addProductReservation({ "id": product.id, "quantity": 1 });
      closeModal();
      props.onChange && props.onChange();
    } catch (error) {
      console.error("LINK-LOG: Error during reservation");
    }
  }

  return (
    <View style={styles.carouselContainer}>
      {props.products.length > 0 ? <FlatList
        data={props.products}
        renderItem={({ item }) => (
          <RewardCard
            rewardImageUrl={item.imageBase64}
            rewardTitle={item.description}
            rewardPoints={item.cost.toString()}
            rewardQtn={item.availableQuantity.toString()}
            onPress={() => openModal(item)}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
      /> :
        <Text style={styles.observationText}>Nenhuma recompensa cadastrada por esta organização.</Text>}

      {selectedReward && (
        <Modal
          visible={modalVisible}
          animationType="fade"
          onRequestClose={closeModal}
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={closeModal} style={styles.close}>
                <Ionicons name="close-outline" size={30} color={Colors.gray} style={styles.iconBack} />
              </TouchableOpacity>
              {selectedReward && (
                <>

                  {selectedReward.imageBase64 == '' || selectedReward.imageBase64 == undefined || selectedReward.imageBase64 == null ? (
                    <Image source={require('@/assets/images/generalGraySquare.png')} style={styles.modalImage} />
                  ) : (
                    <Image source={{ uri: `data:image/png;base64,${selectedReward.imageBase64}`, }} style={styles.modalImage} />
                  )}

                  <Text style={styles.modalTitle}>{selectedReward.description}</Text>
                  <Text style={styles.modalText1}>Custo em Pontos: {selectedReward.cost.toString()}</Text>
                  <Text style={styles.modalText2}>Quantidade disponível: {selectedReward.availableQuantity.toString()}</Text>

                  <Button
                    title="Reservar"
                    onPress={() => handleReward(selectedReward)}
                    backgroundColor={Colors.orange}
                    textColor={Colors.white}
                    borderColor={Colors.orange}
                    borderRadius={12}
                    height={35}
                    width={120}
                    iconName='bag-outline'
                    fontSize={16}
                  />
                </>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    paddingBottom: 10,
  },
  carouselContent: {
    // paddingHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 5,
  },
  modalText1: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalText2: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.orange,
    padding: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
  },
  iconBack: {
    marginEnd: 10,
  },
  close: {
    alignSelf: 'flex-end'
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
    marginTop: 15,
    borderRadius: 8,
  },
  observationText: {
    color: Colors.gray,
    marginBottom: 10,
  }
});
