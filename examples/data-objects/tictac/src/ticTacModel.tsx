import { DataObject } from "@fluidframework/aqueduct";
import { SharedCell } from "@fluidframework/cell";
// import { IAudience } from "@fluidframework/container-definitions";
import { IFluidHandle } from "@fluidframework/core-interfaces";
import { ServiceAudience } from "@fluidframework/fluid-static";
import { SharedMap } from "@fluidframework/map";
import { IClient } from "@fluidframework/protocol-definitions";
import { bothPlayers, currentTurnValue, defaultPlayerValue, gridValues } from "./helpers";
import { IEnhancedTicTacAudience, ITicTacMemeber } from "./TicTac.types";

export class TicTac extends DataObject {
    private _currentPlayer: SharedCell<string> | undefined;
    private _currentTurn: SharedCell<string> | undefined;
    private _gridMap: SharedMap | undefined;
    private _players: SharedMap | undefined;

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

    public get currentPlayer() {
        if (!this._currentPlayer) {
            throw new Error("Not initialized");
        }
        return this._currentPlayer;
    }

    public get currentTurn() {
        if (!this._currentTurn) {
            throw new Error("Not initialized");
        }
        return this._currentTurn;
    }

    public async getPlayerDetails() {
        // eslint-disable-next-line no-useless-catch
        try {
            const quorum = this.runtime.getQuorum();
            const clientId = this.runtime.clientId ?? "";

            // eslint-disable-next-line @typescript-eslint/no-shadow
            this.runtime.getAudience().on("removeMember", (clientId, client) => {
                if (this._players?.get("0") === (client.user as any).name) {
                    this.players.set("0", "left");
                } else if (this._players?.get("1") === (client.user as any).name) {
                    this.players.set("1", "left");
                }
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await (quorum.getMember(clientId)?.client.user as any).name ?? "";
        } catch (error) {
            throw error;
        }
    }

    public get gridMap() {
        if (!this._gridMap) {
            throw new Error("Not initialized");
        }
        return this._gridMap;
    }

    public get players() {
        if (!this._players) {
            throw new Error("Not initialized");
        }
        return this._players;
    }

    private readonly currentPlayerId: string = "currentPlayer";
    private readonly currentTurnId: string = "currentTurn";
    private readonly gridId: string = "grid";
    private readonly playersId: string = "players";

    protected async initializingFirstTime(props?: never): Promise<void> {
        const currentPlayer = SharedCell.create(this.runtime);
        currentPlayer.set(defaultPlayerValue);
        this.root.set(this.currentPlayerId, currentPlayer.handle);

        const currentTurn = SharedCell.create(this.runtime);
        currentTurn.set(currentTurnValue);
        this.root.set(this.currentTurnId, currentTurn.handle);

        const grid = SharedMap.create(this.runtime);
        gridValues.forEach(({ index, value }) => grid.set(index, value));
        this.root.set(this.gridId, grid.handle);

        const players = SharedMap.create(this.runtime);
        bothPlayers.forEach(({ index, value }) => players.set(index, value));
        this.root.set(this.playersId, players.handle);
    }

    protected async hasInitialized(): Promise<void> {
        [this._currentPlayer, this._currentTurn, this._gridMap, this._players] = await Promise.all([
            this.root.get<IFluidHandle<SharedCell>>(this.currentPlayerId)?.get(),
            this.root.get<IFluidHandle<SharedCell>>(this.currentTurnId)?.get(),
            this.root.get<IFluidHandle<SharedMap>>(this.gridId)?.get(),
            this.root.get<IFluidHandle<SharedMap>>(this.playersId)?.get(),
        ]);
    }
}

export class TicTacAudience extends ServiceAudience<ITicTacMemeber> implements IEnhancedTicTacAudience {
    protected createServiceMember(audienceMember: IClient): ITicTacMemeber {
        return {
            userId: audienceMember.user.id,
            userName: (audienceMember.user as any).name,
            connections: [],
        };
    }
}

// // const enhancedTicTac = Object.assign(TicTac.prototype, TicTacAudience);

// // // export {TicTac};
// // const enhancedTicTacType = InstanceType<typeof enhancedTicTac>;
// // export {enhancedTicTac};

// interface IEnhancedticTac extends TicTac, TicTacAudience {}

// // eslint-disable-next-line @typescript-eslint/no-extraneous-class
// export class enhancedTicTac implements IEnhancedticTac {}

// applyMixins(enhancedTicTac, [TicTac, TicTacAudience]);
