import { ApiManager } from "./managers/ApiManager";
import { PostCommentCreate } from "@/models/viewModels/PostCommentCreate";

export function addComment(comment: PostCommentCreate) {
    console.log('LINKA-LOG: addComment called with comment:', comment);
    return ApiManager.post('/Comment', JSON.stringify(comment));
}

export function getCommentsByPostId(postId: string) {
    console.log(`LINKA-LOG: getCommentsByPostId called with postId: ${postId}`);
    return ApiManager.get(`/Comment/posts/${postId}`);
}

export function deleteComment(id: string) {
    console.log('LINKA-LOG: deleteComment called with comment id:', id);
    return ApiManager.delete(`/Comment/${id}`);
}
