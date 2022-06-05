import * as React from "react";
import { ITicTacClientProps } from "./TicTac.types";
import { TicTacView } from "./ticTacView";

export const TicTacClient: React.FC<ITicTacClientProps> = ({ model }: ITicTacClientProps) => {

    const getCurrentTurn = () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return model.currentTurn.get()!;
    };
    const getGridValues = () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return [...model.gridMap.values()];
    };

    const [gridValues, setGrid] = React.useState(getGridValues());

    React.useEffect(() => {
        model.gridMap.on("valueChanged", () => {
            setGrid(getGridValues());
        });
        return () => {
            model.gridMap.off("valueChanged", () => {
                setGrid(getGridValues());
            });
        };
    }, [model.gridMap]);


    // const handlePlayerNameAsync = () => {
    //     void (async () => {
    //         // eslint-disable-next-line @typescript-eslint/await-thenable
    //         const localPlayerName = await model.getPlayerDetails();
    //         setPlayerName(localPlayerName);
    //     })();
    // };

    // setTimeout(() => {
    //     handlePlayerNameAsync();
    //     updatePlayersName(playerName);
    //     const aud = model.AudienceDetails.entries();
    //     console.log(aud.next());
    //   (model.clientId);
    // }, 5000);

    const updateGrid = (index: number) => {
        const nextValue = getCurrentTurn() === "X" ? "O" : "X";
        model.gridMap.set(`${index}`, getCurrentTurn());
        console.log("current", gridValues);
        model.currentTurn.set(nextValue);
    };



    return (
        <TicTacView
            handleChange={updateGrid}
            gridValues={gridValues}
        />
    );
};
