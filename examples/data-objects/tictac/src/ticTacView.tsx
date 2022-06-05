import * as React from "react";
// import { SyncedDataObject } from "@fluid-experimental/react";
import { ITicTacViewProps } from "./TicTac.types";
import { styleBoard } from "./styles";
import { calculateWinner } from "./helpers";

// interface IAuthorsData {
//     syncedDataObject: SyncedDataObject;
// }

export const TicTacView: React.FC<ITicTacViewProps> = (props: ITicTacViewProps) => {
    const {
        gridValues,
        handleChange,
    } = props;

    const winner = calculateWinner(gridValues)

    const handleClick = (index: number) => {
        console.log(index, winner);
        if (winner || gridValues[index] !== "#") { return; }
        else {
            handleChange(index);
        }
        console.log(gridValues)
    };

    return (
        <div style={styleBoard}>
            {gridValues.map((value, index) => {
                return <button id={`square-${index}`} onClick={() => handleClick(index)}>{value === "#" ? "" : value}</button>;
            })}
        </div>
    );
};
