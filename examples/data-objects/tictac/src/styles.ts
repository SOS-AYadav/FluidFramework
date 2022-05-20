const styleSquare = {
    background: "lightblue",
    border: "2px solid darkblue",
    fontSize: "30px",
    fontWeight: "800",
    cursor: "pointer",
    outline: "none",
};

const styleBoard = {
    border: "4px solid darkblue",
    borderRadius: "10px",
    padding: "20px",
    margin: "20px",
    width: "250px",
    height: "250px",
    display: "grid",
    gridTemplate: "repeat(3, 1fr) / repeat(3, 1fr)",
};

export { styleBoard, styleSquare };
