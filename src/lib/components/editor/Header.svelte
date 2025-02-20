<script lang="ts">
    import { Canvas } from 'fabric';
    import Icon from '@iconify/svelte';
    import { tool } from '$lib/stores/tool';
    import type { User } from '$lib/user';
    import type { Project } from '$lib/projects';
    import { hasPermissions } from '$lib/utils';
    import ToolSelector from './ToolSelector.svelte';
    import { centerView } from '$lib/editor/camera';
    import { enhance } from '$app/forms';
    import { spawn } from '$lib/toast';
    import { totalPrice } from '$lib/stores/objects';
    import { saveJPEG, savePNG, saveSVG } from '$lib/editor/export';

    export let element: HTMLDivElement;
    export let project: Project;
    export let canvas: Canvas;
    export let user: User;

    let exportModal: HTMLDialogElement;

    let loadingSave = false;

    function centralizeCanvas() {
        centerView(canvas, project);
    }
</script>

<div bind:this={element} class="flex items-center pb-4 border-b border-base-200">
    {#if hasPermissions(user, project, ['allow_edit'])}
        <ToolSelector currentTool={$tool} />

        <div class="divider divider-horizontal" />
    {/if}

    <section>
        <span class="text-primary font-semibold">{project.name}</span>

        <div>
            <article class="badge badge-sm gap-1">
                <Icon icon="material-symbols:favorite" class="text-error" />
                {project.total_favorites.toLocaleString('pt-br', {
                    style: 'decimal',
                    notation: 'compact',
                    compactDisplay: 'long'
                })}
            </article>

            <article class="badge badge-sm gap-1">
                <Icon icon="fa-solid:clone" class="text-secondary" />
                {project.total_clones.toLocaleString('pt-br', {
                    style: 'decimal',
                    notation: 'compact',
                    compactDisplay: 'long'
                })}
            </article>

            <article class="badge badge-sm">
                <Icon icon="mdi:dollar" class="text-success" />
                <span class:text-error={$totalPrice > project.budget}>
                    {$totalPrice.toLocaleString('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    })}/{project.budget.toLocaleString('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    })}
                </span>
            </article>
        </div>
    </section>

    <div class="grow" />

    <section>
        <button class="btn btn-ghost btn-sm" on:click={centralizeCanvas}>
            <Icon icon="material-symbols:camera" />
            Centralizar
        </button>

        {#if hasPermissions(user, project, ['allow_edit'])}
            <button type="button" class="btn btn-ghost btn-sm" on:click={() => exportModal.show()}>
                <Icon icon="ic:sharp-save-alt" />
                Exportar
            </button>

            <dialog bind:this={exportModal} class="modal">
                <div class="modal-box shadow-none space-y-4">
                    <span class="text-xl font-bold text-center">
                        Como você deseja exportar o projeto?
                    </span>

                    <div class="divider" />

                    <div class="flex gap-2 justify-evenly p-2">
                        <button
                            class="transition hover:scale-110"
                            on:click={() =>
                                saveJPEG(
                                    canvas,
                                    project.width * 100,
                                    project.height * 100,
                                    canvas.viewportTransform.slice()[4],
                                    canvas.viewportTransform.slice()[5]
                                )}
                        >
                            <Icon icon="teenyicons:jpg-solid" class="size-20" />
                        </button>

                        <button
                            class="transition hover:scale-110"
                            on:click={() =>
                                savePNG(
                                    canvas,
                                    project.width * 100,
                                    project.height * 100,
                                    canvas.viewportTransform.slice()[4],
                                    canvas.viewportTransform.slice()[5]
                                )}
                        >
                            <Icon icon="teenyicons:png-solid" class="size-20" />
                        </button>

                        <button class="transition hover:scale-110" on:click={() => saveSVG(canvas)}>
                            <Icon icon="teenyicons:svg-solid" class="size-20" />
                        </button>
                    </div>

                    <form method="dialog">
                        <button class="btn btn-sm btn-error w-full">
                            <Icon icon="material-symbols:close" />
                            Cancelar
                        </button>
                    </form>
                </div>
                <form
                    method="dialog"
                    class="modal-backdrop backdrop-grayscale bg-black/60 backdrop:transition-all"
                >
                    <button class="cursor-default">close</button>
                </form>
            </dialog>

            <form
                method="POST"
                action="/community/projects/{project.id}/edit?/save"
                id="save-project-form"
                class="inline"
                use:enhance={function ({ formData }) {
                    loadingSave = true;
                    formData.set(
                        'json',
                        JSON.stringify(
                            canvas.toObject(['id', 'name', 'userlock', 'price', 'priceWall'])
                        )
                    );

                    return function ({ update, result }) {
                        loadingSave = false;

                        // @ts-ignore
                        if (result.data && result.data.error !== undefined) {
                            spawn({
                                // @ts-ignore
                                message: result.data.error,
                                status: 'error'
                            });

                            return update();
                        }

                        spawn({ message: 'Projeto salvo com sucesso.' });

                        return update();
                    };
                }}
            >
                <button class="btn items-center btn-secondary btn-sm" disabled={loadingSave}>
                    {#if loadingSave}
                        <Icon icon="mingcute:loading-line" class="animate-spin" />
                        Salvando...
                    {:else}
                        <Icon icon="material-symbols:save-sharp" />
                        Salvar
                    {/if}
                </button>
            </form>
        {/if}
    </section>
</div>
