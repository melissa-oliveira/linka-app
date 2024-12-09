import { UserType } from "@/enums/UserType";

export interface PostList {
    id: string,
    description: string,
    associatedOrganizationId: string,
    authorId: string,
    authorType: UserType,
    authorDisplayName: string,
    imageBase64: string;
    shareCount: number,
    likeCount: number,
    commentCount: number,
    authorImageProfile?:string,
    associatedOrganizationDisplayName?:string,
    currentUserHasLiked: boolean,
    currentUserHasShared: boolean,
}