import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/baseComponets/Button";
import Input from "@/components/baseComponets/Input";
import { ViaCEPFind } from "@/services/cep.service";
import { Address } from '@/models/Address';
import { validCep } from '@/utils/inputValidation';

type AddressEditModalProps = {
    visible: boolean;
    address: Address;
    onSave: (address: any) => void;
    onClose: () => void;
};

export default function AddressEditModal(props: AddressEditModalProps) {
    const [cep, setCep] = useState(props.address.cep);
    const [street, setStreet] = useState(props.address.street);
    const [number, setNumber] = useState(props.address.number.toString());
    const [state, setState] = useState(props.address.state);
    const [city, setCity] = useState(props.address.city);
    const [neighbourhood, setNeighbourhood] = useState(props.address.neighborhood);

    const [cepError, setCepError] = useState('');
    const [streetError, setStreetError] = useState('');
    const [numberError, setNumberError] = useState('');
    const [stateError, setStateError] = useState('');
    const [cityError, setCityError] = useState('');
    const [neighbourError, setNeighbourError] = useState('');

    useEffect(() => {
        setCep(props.address.cep);
        setStreet(props.address.street);
        setNumber(props.address.number.toString());
        setState(props.address.state);
        setCity(props.address.city);
        setNeighbourhood(props.address.neighborhood);
    }, [props.address]);

    const removeMask = (text: string, type: string | null) => {
        if (type === 'phone') {
            return text.replace(/[^\d+]/g, '');
        } else {
            return text.replace(/\D/g, '');
        }
    };

    const findCep = async (cep: string) => {
        try {
            setCep(cep)
            if (cep.length === 9) {
                const resultado = await ViaCEPFind(cep.replace(/\D/g, ''));
                setStreet(resultado.logradouro);
                setNeighbourhood(resultado.bairro);
                setCity(resultado.localidade);
                setState(resultado.estado);
            }
        } catch (error) {
            console.error("Erro ao buscar o CEP:", error);
            Alert.alert("Erro", "Não foi possível buscar o endereço pelo CEP.");
        }
    };

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

        if (!showErrorMessage('O campo "CEP" é obrigatório.', setCepError, () => !cep)) {
            isValid = false;
        } else if (!showErrorMessage('Digite um CEP válido.', setCepError, () => !validCep(cep))) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Rua" é obrigatório.', setStreetError, () => !street)) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Número" é obrigatório.', setNumberError, () => !number)) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Estado" é obrigatório.', setStateError, () => !state)) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Cidade" é obrigatório.', setCityError, () => !city)) {
            isValid = false;
        }

        if (!showErrorMessage('O campo "Bairro" é obrigatório.', setNeighbourError, () => !neighbourhood)) {
            isValid = false;
        }

        return isValid;
    };

    const handleSave = async () => {
        try {
            const address = {
                nickname: '',
                cep: removeMask(cep, null),
                street: street,
                neighborhood: neighbourhood,
                state: state,
                city: city,
                number: Number(number),
            };

            if (validateFields()) {
                props.onSave(address);
                Alert.alert('Successo', 'Endereço editado com sucesso!');
                props.onClose();
            }

        } catch (error) {
            Alert.alert('Erro', 'Opss... Erro ao editar endereço');
            console.error('Error editing address:', error);
        }

    };

    return (
        <Modal visible={props.visible} animationType="fade" transparent={true} onRequestClose={props.onClose}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.closeButton}>
                        <Text style={styles.modalTitle}>Editar Endereço</Text>
                        <TouchableOpacity onPress={props.onClose}>
                            <Ionicons name="close" size={30} color={Colors.gray} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>

                        <View style={styles.inputContainer}>
                            <Input label="CEP" value={cep} onChangeText={findCep} keyboardType="numeric" maskType='cep' />
                            {cepError ? <Text style={styles.errorText}>{cepError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input label="Rua" value={street} onChangeText={setStreet} />
                            {streetError ? <Text style={styles.errorText}>{streetError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input label="Número" value={number.toString()} onChangeText={setNumber} keyboardType="numeric" />
                            {numberError ? <Text style={styles.errorText}>{numberError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input label="Estado" value={state} onChangeText={setState} />
                            {stateError ? <Text style={styles.errorText}>{stateError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input label="Cidade" value={city} onChangeText={setCity} />
                            {cityError ? <Text style={styles.errorText}>{cityError}</Text> : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Input label="Bairro" value={neighbourhood} onChangeText={setNeighbourhood} />
                            {neighbourError ? <Text style={styles.errorText}>{neighbourError}</Text> : null}
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
