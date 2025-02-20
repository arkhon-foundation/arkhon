<script lang="ts">
    import Icon from '@iconify/svelte';
    import Pagination from '$lib/components/Pagination.svelte';
    import type { Pagination as PaginationType } from '$lib/utils';
    import UserProfileCard from '$lib/components/UserProfileCard.svelte';
    import type { User } from '$lib/user';
    import type { PageServerData } from './$types';
    import Input from '$lib/components/Input.svelte';
    import { enhance } from '$app/forms';

    export let data: PageServerData & { user: User };

    $: pagination = data.users;
    $: users = pagination.data;

    $: ascending = false;

    let orderBy: string = 'order_created';

    $: userSearch = undefined as PaginationType<User> | undefined;
</script>

<svelte:head>
    <title>Comunidade - Swibly Arkhon</title>
</svelte:head>

<div class="flex max-sm:flex-col max-sm:items-center gap-4">
    <aside
        class="sm:pr-4 sm:border-r border-r-base-200 w-full max-w-96 sm:sticky sm:h-full sm:top-32"
    >
        <form
            method="POST"
            action="?/search"
            class="space-y-2 block sm:hidden"
            use:enhance={function () {
                return function ({ result, update }) {
                    // @ts-ignore
                    userSearch = result.data.users;
                    return update({ reset: false });
                };
            }}
        >
            <div class="collapse collapse-arrow">
                <input type="checkbox" />
                <div class="collapse-title text-xl font-medium">
                    <h1 class="text-3xl font-bold">Filtrar</h1>
                </div>
                <div class="collapse-content">
                    <article class="grid-cols-2">
                        <input
                            type="checkbox"
                            name="ascending"
                            class="hidden"
                            bind:checked={ascending}
                        />

                        <button
                            type="button"
                            class="border-b-2 border-base-200"
                            class:border-primary={ascending}
                            class:text-base-200={!ascending}
                            on:click={() => (ascending = true)}
                        >
                            Crescente
                        </button>

                        <button
                            type="button"
                            class="border-b-2 border-base-200"
                            class:border-primary={!ascending}
                            class:text-base-200={ascending}
                            on:click={() => (ascending = false)}
                        >
                            Decrescente
                        </button>
                    </article>

                    <Input
                        name="name"
                        icon="fa6-solid:magnifying-glass"
                        placeholder="Procurar usuário"
                        labels={{ topLeft: 'Procurar' }}
                        disableDefaultLabels
                    />

                    <label class="form-control w-full">
                        <div class="label">
                            <span class="label-text">Ordenar por</span>
                        </div>
                        <select name="order" class="select select-sm select-bordered w-full">
                            <option value="alphabetic">Ordem Alfabética</option>
                            <option value="order_created" selected>Data de criação</option>
                        </select>
                        <div class="label" />
                    </label>

                    <Input name="verified" element="checkbox" size="xs"
                        >Apenas usuários verificados</Input
                    >

                    <div class="divider divider-start divider-end" />

                    <button class="btn btn-sm btn-primary w-full">
                        <Icon icon="fa6-solid:magnifying-glass" />
                        Pesquisar
                    </button>
                </div>
            </div>
        </form>

        <form
            method="POST"
            action="?/search"
            class="space-y-2 hidden sm:block"
            use:enhance={function () {
                return function ({ result, update }) {
                    // @ts-ignore
                    userSearch = result.data.users;
                    return update({ reset: false });
                };
            }}
        >
            <h1 class="text-3xl font-bold">Filtrar</h1>

            <article class="grid grid-cols-2">
                <input type="checkbox" name="ascending" class="hidden" bind:checked={ascending} />

                <button
                    type="button"
                    class="border-b-2 text-sm border-base-200"
                    class:border-primary={ascending}
                    on:click={() => (ascending = true)}
                >
                    {#if orderBy === 'order_created'}
                        Mais antigo ao mais novo
                    {:else if orderBy === 'alphabetic'}
                        A - Z
                    {:else}
                        Menor para o maior
                    {/if}
                </button>

                <button
                    type="button"
                    class="border-b-2 text-sm border-base-200"
                    class:border-primary={!ascending}
                    on:click={() => (ascending = false)}
                >
                    {#if orderBy === 'order_created'}
                        Mais novo ao mais antigo
                    {:else if orderBy === 'alphabetic'}
                        Z - A
                    {:else}
                        Maior para o menor
                    {/if}
                </button>
            </article>

            <Input
                name="name"
                icon="fa6-solid:magnifying-glass"
                placeholder="Procurar usuário"
                labels={{ topLeft: 'Procurar' }}
                disableDefaultLabels
            />

            <label class="form-control w-full">
                <div class="label">
                    <span class="label-text">Ordenar por</span>
                </div>
                <select
                    name="order"
                    bind:value={orderBy}
                    class="select select-sm select-bordered w-full"
                >
                    <option value="alphabetic">Ordem Alfabética</option>
                    <option value="order_created" selected>Data de criação</option>
                </select>
                <div class="label" />
            </label>

            <Input name="verified" element="checkbox" size="xs">Apenas usuários verificados</Input>

            <div class="divider divider-start divider-end" />

            <button class="btn btn-sm btn-primary w-full">
                <Icon icon="fa6-solid:magnifying-glass" />
                Pesquisar
            </button>
        </form>
    </aside>

    <section class="w-full max-sm:w-fit">
        {#if userSearch !== undefined}
            {#if userSearch.data.length !== 0}
                <div class="mx-auto w-fit mb-4">
                    <Pagination pagination={userSearch} />
                </div>

                <ul class="grid grid-cols-[repeat(auto-fit,minmax(384px,1fr))] gap-4">
                    {#each userSearch.data as user}
                        <li>
                            <UserProfileCard
                                id={user.id}
                                pfp={user.pfp}
                                lastname={user.lastname}
                                username={user.username}
                                verified={user.verified}
                                firstname={user.firstname}
                                selfID={data.user.id}
                            >
                                <a
                                    href="/profile/{user.username}"
                                    class="btn btn-sm btn-outline btn-primary w-full"
                                >
                                    <Icon icon="fa6-solid:magnifying-glass" />
                                    Ver perfil
                                </a>
                            </UserProfileCard>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="italic opacity-50 text-center">Nenhum usuário encontrado.</p>
            {/if}
        {:else if users.length !== 0}
            <div class="mx-auto w-fit mb-4">
                <Pagination {pagination} />
            </div>

            <ul
                class="grid grid-cols-[repeat(auto-fit,minmax(384px,1fr))] gap-4 max-md:flex max-md:flex-col"
            >
                {#each users as user}
                    <li>
                        <UserProfileCard
                            id={user.id}
                            pfp={user.pfp}
                            lastname={user.lastname}
                            username={user.username}
                            verified={user.verified}
                            firstname={user.firstname}
                            selfID={data.user.id}
                        >
                            <a
                                href="/profile/{user.username}"
                                class="btn btn-sm btn-outline btn-primary w-full"
                            >
                                <Icon icon="fa6-solid:magnifying-glass" />
                                Ver perfil
                            </a>
                        </UserProfileCard>
                    </li>
                {/each}
            </ul>
        {:else}
            <p class="italic opacity-50 text-center">Nenhum usuário encontrado.</p>
        {/if}
    </section>
</div>
