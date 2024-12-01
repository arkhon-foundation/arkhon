import { getClipboard, setClipboard, wasCutOperation } from '$lib/stores/clipboard';
import {
    ActiveSelection,
    Canvas,
    controlsUtils,
    FabricObject,
    Group,
    Polygon,
    Polyline,
    type XY
} from 'fabric';
import { applyObjectPermissions } from './permissions';
import { mouseCoords } from '$lib/stores/mouseCoords';
import { get } from 'svelte/store';

export interface CanvasObject {
    object: FabricObject;
    name: string;
    nameReset: string;
    price?: number;
    typeTranslated: string;
    type: string;
    componentID?: number;
    children?: CanvasObject[];
}

export function calculateTotalPrice(objects: CanvasObject[]): number {
    return objects.reduce((total, obj) => {
        const currentPrice = obj.price || 0;
        const childrenPrice = obj.children ? calculateTotalPrice(obj.children) : 0;
        return total + currentPrice + childrenPrice;
    }, 0);
}

export function getCanvasObjects(canvas: Canvas, onlySelected: boolean = false): CanvasObject[] {
    function traverseObjects(objects: FabricObject[]): CanvasObject[] {
        return objects.map((object) => {
            let name = object.type;
            let typeTranslated = '';

            switch (name) {
                case 'rect':
                    name = 'Retângulo';
                    typeTranslated = 'Retângulo';
                    break;
                case 'circle':
                    name = 'Círculo';
                    typeTranslated = 'Círculo';
                    break;
                case 'path':
                    name = 'Desenho';
                    typeTranslated = 'Desenho';
                    break;
                case 'i-text':
                case 'textbox':
                    name = 'Texto sem conteúdo';
                    typeTranslated = 'Texto';
                    break;
                case 'group':
                    name = 'Grupo';
                    typeTranslated = 'Grupo';
                    break;
                case 'polygon':
                    name = `Polígono de ${object.get('points').length} pontos`;
                    typeTranslated = 'Polígono';
                    break;
                case 'polyline':
                    name = 'Linha';
                    typeTranslated = 'Linha';
                    break;
                default:
                    name = 'Objeto';
                    typeTranslated = 'Objeto';
                    break;
            }

            if ('text' in object) {
                name = object.text as string;
            }

            let nameReset = name;

            if ('name' in object) {
                name = object.name as string;
            }

            if ('id' in object) {
                typeTranslated = 'Componente';
            }

            return {
                object,
                name,
                nameReset,
                price: 'price' in object ? (object.price as number) : undefined,
                typeTranslated,
                type: object.type,
                componentID: 'id' in object ? (object.id as number) : undefined,
                children: object instanceof Group ? traverseObjects(object.getObjects()) : undefined
            };
        });
    }

    let objects: FabricObject[];

    if (onlySelected) {
        objects = canvas?.getActiveObjects().filter((x) => x.selectable && x.evented) ?? [];
    } else {
        objects = canvas?.getObjects().filter((x) => x.selectable && x.evented) ?? [];
    }

    return traverseObjects(objects);
}

export function copyObjectsToClipboard(canvas: Canvas) {
    const object = canvas.getActiveObject();

    object?.clone().then((cloned) => {
        setClipboard(cloned);
    });
}

export function cutObjects(canvas: Canvas) {
    const object = canvas.getActiveObject();

    object?.clone().then((cloned) => {
        setClipboard(cloned, true);
        canvas.remove(...canvas.getActiveObjects());
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    });
}

export async function pasteObjectsFromClipboard(canvas: Canvas, pasteAt?: XY) {
    const cloned = await getClipboard()?.clone();
    if (cloned === undefined) return;

    if (wasCutOperation()) {
        setClipboard(null, true);
    }

    canvas.discardActiveObject();

    const buffer = 10 * ~~!wasCutOperation();
    let left = cloned.left + buffer;
    let top = cloned.top + buffer;

    if (cloned instanceof Polyline || cloned instanceof Polygon) {
        cloned.controls = controlsUtils.createPolyControls(cloned);
    }

    if (pasteAt !== undefined || wasCutOperation()) {
        const bounds = cloned.getBoundingRect();

        left = (pasteAt ?? get(mouseCoords)).x - bounds.width / 2;
        top = (pasteAt ?? get(mouseCoords)).y - bounds.height / 2;
    }

    cloned.set({ left, top, evented: true });

    if (cloned instanceof ActiveSelection) {
        cloned.canvas = canvas;
        cloned.forEachObject((object) => canvas.add(object));

        cloned.setCoords();
    } else {
        canvas.add(cloned);
    }

    if (getClipboard() !== null) {
        getClipboard()!.top += buffer;
        getClipboard()!.left += buffer;
    }

    canvas.setActiveObject(cloned);
    canvas.requestRenderAll();
}

export function lockObject(canvas: Canvas, object: FabricObject, lock: boolean) {
    object.set('userlock', lock);

    applyObjectPermissions(canvas, object, {
        selectable: !lock,
        bordered: true
    });

    canvas.discardActiveObject();
    canvas.requestRenderAll();
}
