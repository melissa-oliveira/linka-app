import axios from 'axios';

const apiUrl = 'https://viacep.com.br/ws';

export const ViaCEPFind = async (cep: string) => {
    try {
        const response = await axios.get(`${apiUrl}/${cep}/json/`);
        return response.data;
    } catch (error) {
        console.error('LINKA-API: CEP Error: ', error);
        throw error;
    }
};
