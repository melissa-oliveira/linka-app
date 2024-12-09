export interface PostCreate {
    description: string,
    associatedOrganizationId: string,
    imageBase64: string | null
}