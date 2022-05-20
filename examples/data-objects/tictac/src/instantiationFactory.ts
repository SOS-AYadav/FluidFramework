import { DataObjectFactory } from "@fluidframework/aqueduct";
import { SharedCell } from "@fluidframework/cell";
import { SharedMap } from "@fluidframework/map";
import { TicTac } from "./ticTacModel";

const ticTacName = "TicTac";

export const TicTacInstantiationFactory = new DataObjectFactory(
    ticTacName,
    TicTac,
    [
        SharedCell.getFactory(),
        SharedMap.getFactory(),
    ],
    {},
);
