import { Post } from "./Post";
import { User } from "./User";

export interface PostComment {
    id?:string,
    content: string,
    author: User,
    post: Post
}