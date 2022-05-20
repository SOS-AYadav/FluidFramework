import * as React from "react";
// import { SyncedDataObject } from "@fluid-experimental/react";
import { ISquare, ITicTacBoardProps, ITicTacViewProps } from "./TicTac.types";
import { styleBoard } from "./styles";
import { calculateWinner } from "./helpers";

// interface IAuthorsData {
//     syncedDataObject: SyncedDataObject;
// }

const Square: React.FC<ISquare> = ({ value, handleClick, position }: ISquare) => {
    return (
        <button style={{ pointerEvents: 'none' }} id={`square-${position}`} onClick={() => handleClick(position)}>{value === "#" ? "" : value}</button>
    );
};

const Board: React.FC<ITicTacBoardProps> = (props: ITicTacBoardProps) => {
    const { gridValues, handleClick } = props;
    return (<>
        {gridValues.map((value, index) => {
            return <Square value={value} handleClick={handleClick} position={`${index}`} key={index} />;
        })}
    </>);
};

export const TicTacView: React.FC<ITicTacViewProps> = (props: ITicTacViewProps) => {
    const {
        clientId,
        current,
        currentPlayer,
        gridValues,
        handleChange,
        players,
        playerName,
        updatePlayersName,
    } = props;

    React.useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        playerName ? updatePlayersName(playerName) : () => { };
    }, [playerName]);

    const getNextPlayer = () => {
        if (!playerName || players.includes("#")) { return ""; }
        return players[0] === playerName ? players[1] : players[1] === playerName ? players[0] : "";
    };

    const handleClick = (index: string) => {
        const winner = calculateWinner(gridValues);
        console.log(index, winner);
        if (winner || gridValues[parseInt(index, 10)] !== "#") { return; }
        if (currentPlayer && currentPlayer === clientId) { return; }
        handleChange(index, current, clientId);
    };

    return (
        <>
            <div style={styleBoard}>
                {<Board gridValues={gridValues} handleClick={handleClick} />}
            </div>
            <div>
                <div>Player 1: {playerName} (You)</div>
                <div>Player 2: {getNextPlayer()}</div>
            </div>
        </>
    );
};
