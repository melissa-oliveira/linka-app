import { ApiManager } from './managers/ApiManager';

export function getAllEventJobs() {
    return ApiManager.get('/eventJob');
}

export function getEventJob(id: string) {
    return ApiManager.get('/eventJob/' + id);
}

export function getEventJobByEvent(id: string) {
    return ApiManager.get('/eventJob/event/' + id);
}

export function subscribeToEventJob(eventJobId: string) {
    console.log(`LINKA-LOG: subscribeToEventJob called with eventJobId: ${eventJobId}`);
    return ApiManager.post(`/eventJob/${eventJobId}/subscribe`);
}

export function unsubscribeFromEventJob(eventJobId: string) {
    console.log(`LINKA-LOG: unsubscribeFromEventJob called with eventJobId: ${eventJobId}`);
    return ApiManager.post(`/eventJob/${eventJobId}/unsubscribe`);
}