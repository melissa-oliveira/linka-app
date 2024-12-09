import { PostCreate } from "@/models/viewModels/PostCreate";
import { ApiManager } from "./managers/ApiManager";
import { PostList } from "@/models/viewModels/PostList";

export function getAllPosts() {
    console.log(`LINKA-LOG: getAllPosts called with `);
    return ApiManager.get('/post');
}

export function addPost(post: PostCreate) {
    console.log('LINKA-LOG: addPost called with post:', post);
    return ApiManager.post('/post', JSON.stringify(post));
}

export function deletePost(id: string) {
    console.log('LINKA-LOG: deletePost called with post id:', id);
    return ApiManager.delete('/post/' + id);
}

export function likePost(id: string) {
    console.log('LINKA-LOG: likePost called with post id:', id);
    return ApiManager.post(`/post/${id}/like`);
}

export function unlikePost(id: string) {
    console.log('LINKA-LOG: unlikePost called with post id:', id);
    return ApiManager.post(`/post/${id}/unlike`);
}

export function sharePost(id: string) {
    console.log('LINKA-LOG: sharePost called with post id:', id);
    return ApiManager.post(`/post/${id}/share`);
}

export function unsharePost(id: string) {
    console.log('LINKA-LOG: unsharePost called with post id:', id);
    return ApiManager.post(`/post/${id}/unshare`);
}

export async function getAllPostsByUser(userId: string): Promise<PostList[]> {
    console.log(`LINKA-LOG: getAllPostsByUser called with userId: `, userId);
    const response = await ApiManager.get(`/post/user/${userId}`);
    return response.data as PostList[];
}