/* eslint-disable no-null/no-null */
import { SyncedDataObject } from "@fluid-experimental/react";
import { defaultValue, ITicTacType } from "./TicTac.types";

export const currentTurnValue: string = "X";

export const gridValues: ITicTacType[] = [
    {
        index: "0",
        value: "#",
    },
    {
        index: "1",
        value: "#",
    },
    {
        index: "2",
        value: "#",
    },
    {
        index: "3",
        value: "#",
    },
    {
        index: "4",
        value: "#",
    },
    {
        index: "5",
        value: "#",
    },
    {
        index: "6",
        value: "#",
    },
    {
        index: "7",
        value: "#",
    },
    {
        index: "8",
        value: "#",
    },

];

// eslint-disable-next-line @typescript-eslint/no-shadow
export function calculateWinner(gridValues: defaultValue[]): boolean {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (const line of lines) {
        const [a, b, c] = line;
        if (gridValues[a] !== "#" && gridValues[a] === gridValues[b] && gridValues[a] === gridValues[c]) {
            return true;
        }
    }
    return false;
}

export function applyMixins(derivedCtor: any, constructors: any[]) {
    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
                Object.create(null),
            );
        });
    });
}

export function getAuthorName(syncedDataObject: SyncedDataObject) {
    const quorum = syncedDataObject.dataProps.runtime.getQuorum();
    const clientId = syncedDataObject.dataProps.runtime.clientId ?? "";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (quorum.getMember(clientId)?.client.user as any).name ?? "";
}
