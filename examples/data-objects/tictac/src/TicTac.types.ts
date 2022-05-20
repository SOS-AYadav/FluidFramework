import { SharedCell } from "@fluidframework/cell";
import { IMember, IServiceAudience } from "@fluidframework/fluid-static";
import { SharedMap } from "@fluidframework/map";
import { IClient } from "@fluidframework/protocol-definitions";

export type defaultValue = "#" | string;

type handleClick = (index: string) => void;

type handleChange = (
    clientId: string,
    current: string,
    index: string) => void;

type updatePlayersName = (value: string) => void;

export interface ITicTacType {
    index: string;
    value: defaultValue;
}

export interface ITicTacModel {
    AudienceDetails: Map<string, IClient>;
    clientId: string
    currentPlayer: SharedCell<string>
    currentTurn: SharedCell<string>
    getPlayerDetails: () => string;
    gridMap: SharedMap;
    players: SharedMap;
}

export interface ITicTacClientProps {
    model: ITicTacModel
}

export interface ITicTacViewProps {
    clientId: string,
    current: string;
    currentPlayer: string;
    gridValues: defaultValue[];
    handleChange: handleChange;
    players: defaultValue[]
    playerName: string;
    updatePlayersName: updatePlayersName
}

export interface ITicTacBoardProps {
    gridValues: defaultValue[];
    handleClick: handleClick;

}

export interface ISquare {
    value: defaultValue;
    handleClick: handleClick;
    position: string;
}

export interface ITicTacMemeber extends IMember {
    userName: string;
}

export type IEnhancedTicTacAudience = IServiceAudience<ITicTacMemeber>;
