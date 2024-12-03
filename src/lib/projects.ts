import axios from './server/axios';
import { UserProjectAllowList, UserProjectPermissions } from './user';
import { Pagination, PaginationOptions, Search } from './utils';

export type Project = {
    id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    name: string;
    description: string;
    budget: number;
    width: number;
    height: number;
    banner_url: string;
    is_public: boolean;
    fork: number | null;
    owner_id: number;
    owner_firstname: string;
    owner_lastname: string;
    owner_username: string;
    owner_pfp: string;
    owner_verified: boolean;
    allowed_users: UserProjectPermissions[];
    is_favorited: boolean;
    total_favorites: number;
    total_clones: number;
};

export type ProjectSearch = Search &
    Partial<{
        /** Projects with most favorites first */
        most_favorites: boolean;
        /** Projects with most clones first */
        most_clones: boolean;
        /** Minimum area to be queried */
        min_area: number;
        /** Maximum area to be queried */
        max_area: number;
        /** Minimum budget to be queried */
        min_budget: number;
        /** Maximum budget to be queried */
        max_budget: number;
    }>;

export async function createProject(
    token: string,
    data: FormData
): Promise<
    | {
          status: number;
          message: string;
          project: string;
          error?: undefined;
      }
    | {
          status: number;
          error: string | [string, string];
          message?: undefined;
          project?: undefined;
      }
> {
    try {
        const isPublic = data.get('public') === 'on' || false;

        const res = await axios.post(`/v1/projects${isPublic ? '?public=true' : ''}`, data, {
            headers: { Authorization: token }
        });

        return {
            status: res.status,
            message: res.data.message,
            project: res.data.project
        };
    } catch (e) {
        return {
            // @ts-ignore
            error: e.response.data.error,
            // @ts-ignore
            status: e.response.status
        };
    }
}

export async function updateProject(token: string, projectID: number, data: FormData) {
    try {
        const res = await axios.patch(`/v1/projects/${projectID}/update`, data, {
            headers: { Authorization: token }
        });

        return {
            status: res.status,
            message: res.data.message as string
        };
    } catch (e) {
        return {
            // @ts-ignore
            error: e.response.data.error as string | [string, string],
            // @ts-ignore
            status: e.response.status
        };
    }
}

export async function getPublicProjects(token: string, options: PaginationOptions = {}) {
    try {
        const page = options.page ?? 1;
        const limit = options.limit ?? 10;

        const res = await axios.get(`/v1/projects?page=${page}&perpage=${limit}`, {
            headers: { Authorization: token }
        });

        return res.data as Pagination<Project>;
    } catch (error) {
        return {
            data: [],
            next_page: -1,
            total_pages: 0,
            current_page: 0,
            previous_page: -1,
            total_records: 0
        } as Pagination<Project>;
    }
}

export async function getProjectsByUser(
    token: string,
    username: string,
    favorite: boolean = false,
    options: PaginationOptions = {}
): Promise<Pagination<Project>> {
    try {
        const isFavorite = favorite ? '/favorite' : '';
        const page = options.page ?? 1;
        const limit = options.limit ?? 10;

        const res = await axios.get(
            `/v1/projects/user/${username}${isFavorite}?page=${page}&perpage=${limit}`,
            { headers: { Authorization: token } }
        );

        return res.data as Pagination<Project>;
    } catch (error) {
        return {
            data: [],
            next_page: -1,
            total_pages: 0,
            current_page: 0,
            previous_page: -1,
            total_records: 0
        } as Pagination<Project>;
    }
}

export async function getProjectByID(
    token: string,
    id: number
): Promise<
    | {
          data: Project;
          status: number;
          error?: undefined;
      }
    | {
          error: string;
          status: number;
          data?: undefined;
      }
> {
    try {
        const res = await axios.get(`/v1/projects/${id}`, { headers: { Authorization: token } });

        return {
            data: res.data as Project,
            status: res.status
        };
    } catch (e) {
        return {
            // @ts-ignore
            error: e.response.data.error as string,
            // @ts-ignore
            status: e.response.status as number
        };
    }
}

export async function assignUserToProject(
    token: string,
    id: number,
    username: string,
    allowList: UserProjectAllowList
) {
    try {
        await axios.put(
            `/v1/projects/${id}/assign/${username}`,
            {
                ...allowList
            },
            { headers: { Authorization: token } }
        );
    } catch (e) {
        return {
            // @ts-ignore
            error: e.response.data.error as string,
            // @ts-ignore
            status: e.response.status as number
        };
    }
}

export async function unassignUserFromProject(token: string, id: number, username: string) {
    try {
        await axios.delete(`/v1/projects/${id}/assign/${username}`, {
            headers: { Authorization: token }
        });
    } catch (e) {
        return {
            // @ts-ignore
            error: e.response.data.error as string,
            // @ts-ignore
            status: e.response.status as number
        };
    }
}

export async function leaveProject(token: string, id: number) {
    try {
        await axios.delete(`/v1/projects/${id}/leave`, {
            headers: { Authorization: token }
        });
    } catch (e) {
        return {
            // @ts-ignore
            error: e.response.data.error as string,
            // @ts-ignore
            status: e.response.status as number
        };
    }
}

export async function favorite(token: string, projectID: number) {
    try {
        await axios.patch(
            `/v1/projects/${projectID}/favorite`,
            {},
            { headers: { Authorization: token } }
        );
    } catch (error) {
        console.error(error);
        // TODO: Add error handling
    }
}

export async function unfavorite(token: string, projectID: number) {
    try {
        await axios.delete(`/v1/projects/${projectID}/unfavorite`, {
            headers: { Authorization: token }
        });
    } catch (error) {
        console.error(error);
        // TODO: Add error handling
    }
}

export async function deleteProject(token: string, projectID: number) {
    try {
        await axios.delete(`/v1/projects/${projectID}/trash`, {
            headers: { Authorization: token }
        });
    } catch (error) {
        console.error(error);
        // TODO: Add error handling
    }
}

export async function unsafeDeleteProject(token: string, projectID: number) {
    try {
        await axios.delete(`/v1/projects/${projectID}/trash/force`, {
            headers: { Authorization: token }
        });
    } catch (error) {
        console.error(error);
        // TODO: Add error handling
    }
}

export async function restoreProject(token: string, projectID: number) {
    try {
        await axios.patch(
            `/v1/projects/${projectID}/trash/restore`,
            {},
            {
                headers: { Authorization: token }
            }
        );
    } catch (error) {
        console.error(error);
        // TODO: Add error handling
    }
}

export async function getTrashed(token: string, options: PaginationOptions = {}) {
    try {
        const page = options.page ?? 1;
        const limit = options.limit ?? 10;

        const res = await axios.get(`/v1/projects/trash?page=${page}&perpage=${limit}`, {
            headers: { Authorization: token }
        });

        return res.data as Pagination<Project>;
    } catch (error) {
        return {
            data: [],
            next_page: -1,
            total_pages: 0,
            current_page: 0,
            previous_page: -1,
            total_records: 0
        } as Pagination<Project>;
    }
}

export async function clearTrash(token: string) {
    try {
        await axios.delete(`/v1/projects/trash`, {
            headers: { Authorization: token }
        });
    } catch (error) {
        console.error(error);
        // TODO: Add error handling
    }
}

export async function publishProject(token: string, projectID: number) {
    try {
        const res = await axios.patch(
            `/v1/projects/${projectID}/publish`,
            {},
            {
                headers: { Authorization: token }
            }
        );

        if (res.data.error) {
            return {
                error: res.data.error as string
            };
        }
    } catch (e) {
        return {
            // @ts-ignore
            error: e.response.data.error as string
        };
    }
}

export async function unpublishProject(token: string, projectID: number) {
    try {
        await axios.delete(`/v1/projects/${projectID}/unpublish`, {
            headers: { Authorization: token }
        });
    } catch (error) {
        console.error(error);
        // TODO: Add error handling
    }
}

export async function forkProject(token: string, projectID: number) {
    try {
        const res = await axios.post(
            `/v1/projects/${projectID}/fork`,
            {},
            {
                headers: { Authorization: token }
            }
        );

        return res.data as { message: string; project: number };
    } catch (error) {
        console.error(error);
        // TODO: Add error handling
    }
}

export async function unlinkProject(token: string, projectID: number) {
    try {
        await axios.delete(`/v1/projects/${projectID}/fork`, {
            headers: { Authorization: token }
        });
    } catch (error) {
        console.error(error);
        // TODO: Add error handling
    }
}

export async function getContentByProjectId(token: string, id: number) {
    try {
        const res = await axios.get(`/v1/projects/${id}/content`, {
            headers: { Authorization: token }
        });

        return res.data;
    } catch (error) {
        return console.error(error);
    }
}

export async function saveProjectContent(token: string, id: number, json: any) {
    try {
        await axios.put(`/v1/projects/${id}/content`, json, {
            headers: { Authorization: token }
        });
    } catch (error) {
        return {
            // @ts-ignore
            error: e.response.data.error as string,
            // @ts-ignore
            status: e.response.status as number
        };
    }
}

export async function searchProjects(
    token: string,
    search: ProjectSearch,
    options: PaginationOptions
) {
    try {
        const page = options.page ?? 1;
        const limit = options.limit ?? 10;

        const res = await axios.post(`/v1/search/project?page=${page}&perpage=${limit}`, search, {
            headers: { Authorization: token }
        });

        return {
            search: res.data as Pagination<Project>,
            status: res.status
        };
    } catch (e) {
        return {
            // @ts-ignore
            error: e.response.data.error,
            // @ts-ignore
            status: e.response.status
        };
    }
}
