import { ContainerViewRuntimeFactory } from "@fluid-example/example-utils";
import * as React from "react";
import { TicTacInstantiationFactory } from "./instantiationFactory";
import { ITicTacModel } from "./TicTac.types";
import { TicTacClient } from "./ticTacClient";
// import { TicTacAudience } from "./ticTacModel";

const TicTacViewCallback = (ticTac: ITicTacModel) => React.createElement(TicTacClient, { model: ticTac });

export const fluidExport = new ContainerViewRuntimeFactory<ITicTacModel>(
    TicTacInstantiationFactory, TicTacViewCallback,
);

// const aud = new TicTacAudience(fluidExport.IRuntimeFactory);
// export const getObject = async () => {
//     const defaultObject = await getDefaultObjectFromContainer(currentContainer);
//     console.log(defaultObject);
// };
