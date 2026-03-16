import { getContext, setContext } from 'svelte';

const POSTS_KEY = Symbol('posts');

let postsState = $state(null);

export function setPosts(posts: any) {
    postsState = posts;
    setContext(POSTS_KEY, postsState);
}

export function getPosts() {
    return getContext<any>(POSTS_KEY) ?? postsState;
}