import { Volunteer } from '@/models/Volunteer';
import { ApiManager } from './managers/ApiManager';

export async function getAllVolunteers(): Promise<Volunteer[]> {
    console.log('LINKA-LOG: getAllVolunteers called');
    const response = await ApiManager.get('/volunteer');
    return response.data as Volunteer[];
}

export async function getVolunteer(id: string): Promise<Volunteer> {
    console.log(`LINKA-LOG: getVolunteer called with id: ${id}`);
    const response = await ApiManager.get('/volunteer/' + id);
    return response.data as Volunteer;
}

export async function addVolunteer(volunteer: Volunteer): Promise<Volunteer> {
    console.log('LINKA-LOG: addVolunteer called with volunteer:', volunteer);
    const response = await ApiManager.post('/volunteer', JSON.stringify(volunteer));
    return response.data as Volunteer;
}

export async function getVolunteerEvents(volunteerId: string) {
    console.log(`LINKA-LOG: getVolunteerEvents called`);
    return await ApiManager.get(`/volunteer/${volunteerId}/events`);
}

export async function updateVolunteer(updateData: Partial<Volunteer>): Promise<Volunteer> {
    console.log('LINKA-LOG: updateVolunteer called with updateData:', updateData);
    const response = await ApiManager.patch('/volunteer/update', JSON.stringify(updateData));
    return response.data as Volunteer;
}

export async function removeProfilePictureVolunteer() {
    console.log('LINKA-LOG: removeProfilePictureVolunteer called');
    return await ApiManager.post('/volunteer/remove-avatar');
}