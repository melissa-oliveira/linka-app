import { Address } from '@/models/Address';
import { ApiManager } from './managers/ApiManager';

export function getAllAddresses() {
    console.log('LINKA-LOG: getAllAddresss called');
    return ApiManager.get('/address');
}

export function getAddress(id: string) {
    console.log(`LINKA-LOG: getAddress called with id: ${id}`);
    return ApiManager.get('/address/' + id);
}

export function addAddress(address: Address) {
    console.log('LINKA-LOG: addAddress called with address:', address);
    return ApiManager.post('/address', JSON.stringify(address));
}