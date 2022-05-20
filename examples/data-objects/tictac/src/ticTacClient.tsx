import * as React from "react";
import { ITicTacClientProps } from "./TicTac.types";
import { TicTacView } from "./ticTacView";

export const TicTacClient: React.FC<ITicTacClientProps> = ({ model }: ITicTacClientProps) => {
    const getCurrentPlayer = () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return model.currentPlayer.get()!;
    };
    const getCurrentTurn = () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return model.currentTurn.get()!;
    };
    const getGridValues = () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return [...model.gridMap.values()];
    };
    const getPlayers = () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return [...model.players.values()];
    };

    const [clientId] = React.useState("");
    const [currentPlayer, setCurrentPlayer] = React.useState(getCurrentPlayer());
    const [currentTurn, setCurrentTurn] = React.useState(getCurrentTurn());
    const [gridValues, setGrid] = React.useState(getGridValues());
    const [playerName] = React.useState("");
    const [players, setPlayers] = React.useState(getPlayers());

    React.useEffect(() => {
        model.currentPlayer.on("valueChanged", () => {
            setCurrentPlayer(getCurrentPlayer());
        });
    }, [model.currentPlayer]);
    React.useEffect(() => {
        model.currentTurn.on("valueChanged", () => {
            setCurrentTurn(getCurrentTurn());
        });
    }, [model.currentTurn]);
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
    React.useEffect(() => {
        model.players.on("valueChanged", () => {
            setPlayers(getPlayers());
        });
    }, [model.players]);

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

    const updateGrid = (index: string, currentValue: string, client: string) => {
        const nextValue = currentValue === "X" ? "O" : "X";
        model.gridMap.set(index, currentValue);
        console.log("current", nextValue);
        model.currentTurn.set(nextValue);
        model.currentPlayer.set(client);
        console.log(model.getPlayerDetails());
    };

    const updatePlayersName = (value: string) => {
        console.log("playername", value, players[0] === "#");
        if (value) {
            if (players[0] === "#") {
                model.players.set("0", value);
            } else if (players[1] === "#") {
                model.players.set("1", value);
            }
        }
        console.log("players", players);
        // if (players.includes("#") && !players.includes(value)) {

        // }
    };

    return (
        <TicTacView
            clientId={clientId}
            current={currentTurn}
            currentPlayer={currentPlayer}
            handleChange={updateGrid}
            gridValues={gridValues}
            players={players}
            playerName={playerName}
            updatePlayersName={updatePlayersName} />
    );
};
