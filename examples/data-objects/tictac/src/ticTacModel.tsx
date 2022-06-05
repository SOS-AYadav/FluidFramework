import { DataObject } from "@fluidframework/aqueduct";
import { SharedCell } from "@fluidframework/cell";
// import { IAudience } from "@fluidframework/container-definitions";
import { IFluidHandle } from "@fluidframework/core-interfaces";
// import { ServiceAudience } from "@fluidframework/fluid-static";
import { SharedMap } from "@fluidframework/map";
// import { IClient } from "@fluidframework/protocol-definitions";
import { currentTurnValue, gridValues } from "./helpers";
// import { IEnhancedTicTacAudience, ITicTacMemeber } from "./TicTac.types";

export class TicTac extends DataObject {
    private _currentTurn: SharedCell<string> | undefined;
    private _gridMap: SharedMap | undefined;

    public get AudienceDetails() {
        const audMap = this.runtime.getAudience();
        return audMap.getMembers();
    }

    public get clientId() {
        if (!this.runtime.clientId) {
            throw new Error("Unable to get clientId");
        }
        return this.runtime.clientId;
    }

    public get currentTurn() {
        if (!this._currentTurn) {
            throw new Error("Not initialized");
        }
        return this._currentTurn;
    }

    public get gridMap() {
        if (!this._gridMap) {
            throw new Error("Not initialized");
        }
        return this._gridMap;
    }

    private readonly currentTurnId: string = "currentTurn";
    private readonly gridId: string = "grid";

    protected async initializingFirstTime(props?: never): Promise<void> {
        const currentTurn = SharedCell.create(this.runtime);
        currentTurn.set(currentTurnValue);
        this.root.set(this.currentTurnId, currentTurn.handle);

        const grid = SharedMap.create(this.runtime);
        gridValues.forEach(({ index, value }) => grid.set(index, value));
        this.root.set(this.gridId, grid.handle);
    }

    protected async hasInitialized(): Promise<void> {
        [this._currentTurn, this._gridMap] = await Promise.all([
            this.root.get<IFluidHandle<SharedCell>>(this.currentTurnId)?.get(),
            this.root.get<IFluidHandle<SharedMap>>(this.gridId)?.get(),
        ]);
    }
}

// export class TicTacAudience extends ServiceAudience<ITicTacMemeber> implements IEnhancedTicTacAudience {
//     protected createServiceMember(audienceMember: IClient): ITicTacMemeber {
//         return {
//             userId: audienceMember.user.id,
//             userName: (audienceMember.user as any).name,
//             connections: [],
//         };
//     }
// }

// // const enhancedTicTac = Object.assign(TicTac.prototype, TicTacAudience);

// // // export {TicTac};
// // const enhancedTicTacType = InstanceType<typeof enhancedTicTac>;
// // export {enhancedTicTac};

// interface IEnhancedticTac extends TicTac, TicTacAudience {}

// // eslint-disable-next-line @typescript-eslint/no-extraneous-class
// export class enhancedTicTac implements IEnhancedticTac {}

// applyMixins(enhancedTicTac, [TicTac, TicTacAudience]);
