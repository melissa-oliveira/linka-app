import { Post } from "./Post";
import { User } from "./User";

export interface PostShare {
    id?: string,
    user: User,
    post: Post
}