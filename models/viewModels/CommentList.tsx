import { UserType } from "@/enums/UserType";

export interface CommentList {
    id: string,
    authorId: string,
    type: UserType,
    authorDisplayName: string,
    content: string,
    authorImageProfile?: string,
}