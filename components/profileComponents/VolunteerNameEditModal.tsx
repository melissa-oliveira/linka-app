import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/baseComponets/Button";
import Input from "@/components/baseComponets/Input";
import { ViaCEPFind } from "@/services/cep.service";
import { validCep } from '@/utils/inputValidation';

type Props = {
    visible: boolean;
    name: string;
    surname: string;
    onSave: (fullname: any) => void;
    onClose: () => void;
};

export default function VolunteerNameEditModal(props: Props) {
    const [name, setName] = useState(props.name);
    const [surname, setSurname] = useState(props.surname);

    const [nameError, setNameError] = useState('');
    const [surnameError, setSurnameError] = useState('');

    useEffect(() => {
        setName(props.name);
        setSurname(props.surname);
    }, [props.name, props.surname]);


    const showErrorMessage = (errorMessage: string, setErrorFunction: (error: string) => void, validateFunction: () => boolean): boolean => {
        if (validateFunction()) {
            setErrorFunction(errorMessage);
            return false;
        } else {
            setErrorFunction('');
            return true;
        }
    };

    const validateFields = () => {
        let isValid = true;

        if (!showErrorMessage('O campo "Sobrenome" é obrigatório.', setSurnameError, () => !surname)) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Nome" é obrigatório.', setNameError, () => !name)) {
            isValid = false;
        }

        return isValid;
    };

    const handleSave = async () => {
        try {
            const fullName = {
                name: name,
                surname: surname,
            };

            if (validateFields()) {
                props.onSave(fullName);
                Alert.alert('Successo', 'Nome editado com sucesso!');
                props.onClose();
            }

        } catch (error) {
            Alert.alert('Erro', 'Opss... Erro ao editar nome');
            console.error('Error editing name:', error);
        }

    };

    return (
        <Modal visible={props.visible} animationType="fade" transparent={true} onRequestClose={props.onClose}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.closeButton}>
                        <Text style={styles.modalTitle}>Editar Nome</Text>
                        <TouchableOpacity onPress={props.onClose}>
                            <Ionicons name="close" size={30} color={Colors.gray} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>

                        <View style={styles.inputContainer}>
                            <Input label="Nome" value={name} onChangeText={setName} />
                            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input label="Sobrenome" value={surname} onChangeText={setSurname} />
                            {surnameError ? <Text style={styles.errorText}>{surnameError}</Text> : null}
                        </View>

                        <View style={styles.buttonContainer}>
                            <Button
                                title="Salvar"
                                onPress={handleSave}
                                backgroundColor={Colors.orange}
                                textColor={Colors.white}
                                borderColor={Colors.orange}
                                borderRadius={12}
                                height={35}
                                width={200} />
                            <Button
                                title="Cancelar"
                                onPress={props.onClose}
                                backgroundColor={Colors.white}
                                textColor={Colors.red}
                                borderColor={Colors.red}
                                borderRadius={12}
                                height={35}
                                width={200} />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    inputContainer: {
        marginBottom: 15,
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
        gap: 5,
    },
    buttonWrapper: {
        marginBottom: 10,
    },
    closeButton: {
        width: '100%',
        marginBottom: 20,
        paddingEnd: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    divider: {
        borderBottomColor: Colors.mediumGray,
        borderBottomWidth: 1,
        marginTop: 10,
        marginBottom: 30,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
});
