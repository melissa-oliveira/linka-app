import { Organization } from "./Organization";
import { PostComment } from "./PostComment";
import { PostLike } from "./PostLike";
import { PostShare } from "./PostShare";
import { User } from "./User";

export interface Post {
    id?: string,
    description: string,
    author: User,
    associatedOrganization: Organization,
    comments?: PostComment[],
    likes?: PostLike[],
    shares?: PostShare[],
    imageBytes?: string,
}