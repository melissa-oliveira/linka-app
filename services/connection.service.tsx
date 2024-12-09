import { CheckPendingConnectionResponse } from '@/models/viewModels/CheckPendingConnectionResponse';
import { ApiManager } from './managers/ApiManager';
import { ConnectionRequestList } from '@/models/viewModels/ConnectionRequestList';

export async function requestConnection(volunteerId: string) {
    console.log(`LINKA-LOG: requestConnection called with volunteer id: ${volunteerId}`);
    return await ApiManager.post('/connection/request/', JSON.stringify({ targetVolunteerId: volunteerId }));
}

export async function acceptConnection(volunteerId: string) {
    console.log(`LINKA-LOG: acceptConnection called with volunteer id: ${volunteerId}`);
    return await ApiManager.post('/connection/accept/', JSON.stringify({ connectionRequestId: volunteerId }));
}

export async function rejectConnection(volunteerId: string) {
    console.log(`LINKA-LOG: rejectConnection called with volunteer id: ${volunteerId}`);
    return await ApiManager.post('/connection/reject/', JSON.stringify({ connectionRequestId: volunteerId }));
}

export async function breackUpConnection(volunteerId: string) {
    console.log(`LINKA-LOG: breackUpConnection called with volunteer id: ${volunteerId}`);
    return await ApiManager.post('/connection/break-up/', JSON.stringify({ targetVolunteerId: volunteerId }));
}

export async function getPendingConnections() {
    console.log(`LINKA-LOG: getPendingConnections called`);
    return await ApiManager.get('/connection/pending/');
}

export async function checkPendingConnections(volunteerId: string): Promise<CheckPendingConnectionResponse> {
    console.log(`LINKA-LOG: checkPendingConnections called with volunteer id: `, volunteerId);
    const response = await ApiManager.get('/connection/check-pending/' + volunteerId);
    return response.data as CheckPendingConnectionResponse;
}

export async function checkConnection(volunteerId: string): Promise<{ isConnected: BlobOptions }> {
    console.log(`LINKA-LOG: checkConnection called with volunteer id: `, volunteerId);
    const response = await ApiManager.get('/connection/check/' + volunteerId);
    return response.data as { isConnected: BlobOptions };
}