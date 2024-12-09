import { Organization } from '@/models/Organization';
import { ApiManager } from './managers/ApiManager';

export async function getAllOrganizations(): Promise<Organization[]> {
    console.log('LINKA-LOG: getAllOrganizations called');
    const response = await ApiManager.get('/organization');
    return response.data as Organization[];
}

export async function getOrganization(id: string): Promise<Organization> {
    console.log(`LINKA-LOG: getOrganization called with id: ${id}`);
    const response = await ApiManager.get('/organization/' + id);
    return response.data as Organization;
}

export async function addOrganization(organization: Organization): Promise<Organization> {
    console.log('LINKA-LOG: addOrganization called with organization:', organization);
    const response = await ApiManager.post('/organization', JSON.stringify(organization));
    return response.data as Organization;
}

export async function getFollowingOrganizations(): Promise<Organization[]> {
    console.log('LINKA-LOG: getFollowingOrganizations called');
    const response = await ApiManager.get('/organization/following');
    return response.data as Organization[];
}

export async function followOrganization(organizationId: string) {
    console.log('LINKA-LOG: followOrganization called with id: ', organizationId);
    return await ApiManager.post('/organization/' + organizationId + '/follow');
}

export async function unfollowOrganization(organizationId: string) {
    console.log('LINKA-LOG: followOrganization calledwith id: ', organizationId);
    return await ApiManager.post('/organization/' + organizationId + '/unfollow');
}

export async function updateOrganization(updateData: Partial<Organization>): Promise<Organization> {
    console.log('LINKA-LOG: updateOrganization called with updateData:', updateData);
    const response = await ApiManager.patch('/organization/update', JSON.stringify(updateData));
    return response.data as Organization;
}

export async function removeProfilePictureOrganization() {
    console.log('LINKA-LOG: removeProfilePictureOrganization called');
    return await ApiManager.post('/organization/remove-avatar');
}