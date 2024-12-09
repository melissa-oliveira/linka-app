import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Colors } from '@/constants/Colors';
import Button from './Button';
import { Ionicons } from '@expo/vector-icons';

type Option = {
    label: string;
    value: string;
};

type Props = {
    label: string;
    options: Option[];
    selectedValue: string;
    onValueChange: (value: Option) => void;
};

export default function Select(props: Props) {
    const [modalVisible, setModalVisible] = React.useState(false);

    const handleSelect = (value: Option) => {
        props.onValueChange(value);
        setModalVisible(false);
    };

    const clearOption = () => {
        props.onValueChange({
            label: '',
            value: '',
        });
        setModalVisible(false);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{props.label}</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.selectButton}>
                <Text style={styles.selectedText}>
                    {props.options.find(option => option.value === props.selectedValue)?.label || 'Selecione...'}
                </Text>
            </TouchableOpacity>

            <Modal
                transparent
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.closeButton}>
                            <Text style={styles.modalTitle}>Selecione uma opção:</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={30} color={Colors.gray} />
                            </TouchableOpacity>
                        </View>

                        {props.options.length > 0 ? <FlatList
                            data={props.options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleSelect(item)} style={styles.option}>
                                    <Text style={styles.optionText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        /> : <Text style={styles.modalText}>Ops... Parece não segue nenhuma organização ainda.</Text>}

                        <View style={styles.modalButtonContainer}>
                            <Button
                                title="Limpar"
                                onPress={clearOption}
                                backgroundColor={Colors.white}
                                textColor={Colors.red}
                                borderColor={Colors.red}
                                borderRadius={12}
                                height={40}
                                width={120}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        marginBottom: 3,
        fontSize: 16,
        color: Colors.black,
    },
    selectButton: {
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.lightGray,
        borderWidth: 1,
        borderColor: Colors.mediumGray,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    selectedText: {
        fontSize: 16,
        color: Colors.black,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        maxHeight: '60%',
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 20,
    },
    closeButton: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 25,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        marginTop: 15,
    },
    modalTitle: {
        fontSize: 18,
        color: Colors.black,
    },
    modalText: {
        fontSize: 14,
        marginBottom: 25,
        textAlign: 'center',
        color: Colors.black,
    },
    option: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: Colors.lightGray,
        borderColor: Colors.mediumGray,
        borderWidth: 1,
        marginBottom: 5,
    },
    optionText: {
        fontSize: 16,
        color: Colors.black,
    },
});
