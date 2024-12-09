import { Post } from "./Post";
import { User } from "./User";

export interface PostLike {
    id?: string,
    user: User,
    post: Post
}