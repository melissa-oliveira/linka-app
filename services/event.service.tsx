import { Event } from '@/models/Event';
import { ApiManager } from './managers/ApiManager';
import { EventCreate } from '@/models/viewModels/EventCreate';
import { EventUpdate } from '@/models/viewModels/EventUpdate';

export function getAllEvents() {
    console.log('LINKA-LOG: getAllEvents called');
    return ApiManager.get('/event');
}

export function getEvent(id: string) {
    console.log(`LINKA-LOG: getEvent called with id: ${id}`);
    return ApiManager.get('/event/' + id);
}

export function addEvent(event: EventCreate) {
    console.log('LINKA-LOG: addEvent called with event:', event);
    return ApiManager.post('/event', JSON.stringify(event));
}

export function updateEvent(id: string, event: EventUpdate) {
    console.log(`LINKA-LOG: updateEvent called with id: ${id}, event:`, event);
    return ApiManager.put('/event/' + id, JSON.stringify(event));
}

export function getEventsByOrganization(organizationId: string) {
    console.log(`LINKA-LOG: getEventsByOrganization called with organizationId: ${organizationId}`);
    return ApiManager.get(`/event/organization/${organizationId}`);
}

export function cancelEvent(eventId: string) {
    console.log(`LINKA-LOG: cancelEvent called with eventId: ${eventId}`);
    return ApiManager.post(`/event/${eventId}/cancel`);
}

export function openEvent(eventId: string) {
    console.log(`LINKA-LOG: openEvent called with eventId: ${eventId}`);
    return ApiManager.post(`/event/${eventId}/start`);
}

export function closeEvent(eventId: string) {
    console.log(`LINKA-LOG: closeEvent called with eventId: ${eventId}`);
    return ApiManager.post(`/event/${eventId}/end`);
}

export function checkInEvent(eventId: string, volunteerId: string) {
    console.log('LINKA-LOG: checkInEvent called with eventId:', eventId);
    return ApiManager.post('/event/' + eventId + '/check-in/' + volunteerId);
}

export function checkOutEvent(eventId: string, volunteerId: string) {
    console.log('LINKA-LOG: checkOutEvent called with eventId:', eventId);
    return ApiManager.post('/event/' + eventId + '/check-out/' + volunteerId);
}