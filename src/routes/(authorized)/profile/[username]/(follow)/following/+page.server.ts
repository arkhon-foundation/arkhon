import { JWT_TOKEN_COOKIE_NAME } from '$env/static/private';
import { getFollowing } from '$lib/user';
import { userPageActions } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async function ({ cookies, params, url }) {
    let page = 1;
    let limit = 9;

    url.searchParams.forEach((value, key) => {
        if (key === 'page') {
            page = parseInt(value);
        } else if (key === 'limit') {
            limit = parseInt(value);
        }
    });

    const following = await getFollowing(cookies.get(JWT_TOKEN_COOKIE_NAME)!, params.username, {
        page,
        limit
    });

    return {
        following: following!
    };
};

export const actions: Actions = userPageActions;