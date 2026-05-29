// ============================================================
// CELL LAYOUT ENGINE V1
// ------------------------------------------------------------
// RULE-BASED GRID SYSTEM
// ------------------------------------------------------------
// FEATURES
// ------------------------------------------------------------
// ✓ rows / cols map
// ✓ reserved regions
// ✓ priority sorting
// ✓ structured widget rules
// ✓ random side placement for low priority square widgets
// ✓ overflow handling
// ✓ pure cell logic
// ✓ no px calculations
// ============================================================

export default class CellLayoutEngine {

    constructor(rows, cols, scatter = true) {

        this.rows = rows
        this.cols = cols

        // ====================================================
        // GRID MAP
        // ====================================================

        this.grid = []

        for (let y = 0; y < rows; y++) {

            const row = []

            for (let x = 0; x < cols; x++) {

                row.push(0)
            }

            this.grid.push(row)
        }

        this.placed = []
        this.overflow = []
        this.scatter = scatter
    }



    // ========================================================
    // PRINT GRID
    // ========================================================

    printGrid() {

        console.table(this.grid)
    }



    // ========================================================
    // RESERVE CELLS
    // ========================================================

    reserve(x, y, w, h) {

        for (
            let yy = y;
            yy < y + h;
            yy++
        ) {

            for (
                let xx = x;
                xx < x + w;
                xx++
            ) {

                if (
                    yy >= 0 &&
                    yy < this.rows &&

                    xx >= 0 &&
                    xx < this.cols
                ) {

                    this.grid[yy][xx] = -1
                }
            }
        }
    }



    // ========================================================
    // CHECK FIT
    // ========================================================

    canFit(x, y, w, h) {

        if (
            x + w > this.cols ||
            y + h > this.rows
        ) {

            return false
        }

        for (
            let yy = y;
            yy < y + h;
            yy++
        ) {

            for (
                let xx = x;
                xx < x + w;
                xx++
            ) {

                if (
                    this.grid[yy][xx] !== 0
                ) {

                    return false
                }
            }
        }

        return true
    }



    // ========================================================
    // OCCUPY
    // ========================================================

    occupy(x, y, w, h, id) {

        for (
            let yy = y;
            yy < y + h;
            yy++
        ) {

            for (
                let xx = x;
                xx < x + w;
                xx++
            ) {

                this.grid[yy][xx] = id
            }
        }
    }



    // ========================================================
    // FIND FREE SPACE
    // ========================================================

    findPosition(w, h) {

        const positions = []

        for (let y = 0;y < this.rows;y++) {
            for (let x = 0;x < this.cols;x++) {
                if (this.canFit(x, y, w, h)) {
                    if (!this.scatter) return {x,y}
                    positions.push({x,y})
                }
            }
        }

        if (!positions.length) return null
        
        // random free space
        return positions[Math.floor(Math.random() *positions.length)]
    }



    // ========================================================
    // BUILD WIDGET STRUCTURE
    // ========================================================

    buildStructure(widget) {

        const high = widget.priority >= 70

        const ratio = widget.ratio

        const cols = widget.cols || 2

        // ====================================================
        // HIGH PRIORITY SQUARE
        // ====================================================

        if (high &&ratio === 1) {

            return {

                reserveCols: 2,
                reserveRows: 3,

                widgetCols: 2,
                widgetRows: 2,

                textCols: 2,
                textRows: 1,

                widgetCells: [

                    [0, 0],
                    [1, 0],

                    [0, 1],
                    [1, 1]
                ],

                textCells: [

                    [0, 2],
                    [1, 2]
                ]
            }
        }



        // ====================================================
        // HIGH PRIORITY NON-SQUARE
        // ====================================================

        if (high && ratio !== 1) {
            return {

                reserveCols: cols,
                reserveRows: 2,

                widgetCols: cols,
                widgetRows: 1,

                textCols: cols,
                textRows: 1,

                widgetCells:
                    Array.from(
                        { length: cols },
                        (_, i) => [i, 0]
                    ),

                textCells:
                    Array.from(
                        { length: cols },
                        (_, i) => [i, 1]
                    )
            }
        }

        // ====================================================
        // LOW PRIORITY SQUARE
        // ====================================================

        if (!high &&ratio === 1) {

            const side = Math.random() > 0.5 ? "left" : "right"

            // LEFT SIDE
            if (side === "left") {

                return {

                    reserveCols: 2,
                    reserveRows: 2,

                    widgetCols: 1,
                    widgetRows: 1,

                    textCols: 1,
                    textRows: 1,

                    widgetCells: [

                        [0, 0]
                    ],

                    textCells: [

                        [0, 1]
                    ]
                }
            }

            // RIGHT SIDE
            return {

                reserveCols: 2,
                reserveRows: 2,

                widgetCols: 1,
                widgetRows: 1,

                textCols: 1,
                textRows: 1,

                widgetCells: [

                    [1, 0]
                ],

                textCells: [

                    [1, 1]
                ]
            }
        }



        // ====================================================
        // LOW PRIORITY NON-SQUARE
        // ====================================================

        return {

            reserveCols: cols,
            reserveRows: 2,

            widgetCols: cols,
            widgetRows: 1,

            textCols: cols,
            textRows: 1,

            widgetCells:
                Array.from(
                    { length: cols },
                    (_, i) => [i, 0]
                ),

            textCells:
                Array.from(
                    { length: cols },
                    (_, i) => [i, 1]
                )
        }
    }



    // ========================================================
    // PLACE SINGLE WIDGET
    // ========================================================

    placeWidget(widget) {

        const structure =
            this.buildStructure(widget)

        const pos =
            this.findPosition(

                structure.reserveCols,
                structure.reserveRows
            )

        if (!pos) {

            this.overflow.push(widget)

            return
        }

        // ====================================================
        // RESERVE WHOLE STRUCTURE
        // ====================================================

        this.occupy(

            pos.x,
            pos.y,

            structure.reserveCols,
            structure.reserveRows,

            widget.id
        )

        this.placed.push({

            id: widget.id,

            priority:
                widget.priority,

            ratio:
                widget.ratio,

            x: pos.x,
            y: pos.y,

            reserveCols:
                structure.reserveCols,

            reserveRows:
                structure.reserveRows,

            widgetCols:
                structure.widgetCols,

            widgetRows:
                structure.widgetRows,

            textCols:
                structure.textCols,

            textRows:
                structure.textRows,

            Rows:
                structure.widgetRows + structure.textRows,
            Columns:
                structure.widgetCols,

            widgetCells:
                structure.widgetCells.map(
                    cell => ({

                        x:
                            pos.x + cell[0],

                        y:
                            pos.y + cell[1]
                    })
                ),

            textCells:
                structure.textCells.map(
                    cell => ({

                        x:
                            pos.x + cell[0],

                        y:
                            pos.y + cell[1]
                    })
                )
        })
    }

    // ========================================================
    // MAIN CALCULATE
    // ========================================================

    calculate(widgets) {

        // ====================================================
        // SORT BY PRIORITY
        // ====================================================

        widgets.sort(

            (a, b) =>
                b.priority -
                a.priority
        )

        // ====================================================
        // PLACE
        // ====================================================

        for (const widget of widgets) {

            this.placeWidget(widget)
        }

        return {

            placed: this.placed,

            overflow: this.overflow,

            grid: this.grid
        }
    }
}



// ============================================================
// EXAMPLE
// ============================================================

const engine =
    new CellLayoutEngine(
        10,
        12
    )



// ============================================================
// RESERVED AREA
// ============================================================

engine.reserve(
    4, 1,
    4, 6
)



// ============================================================
// WIDGETS
// ============================================================

const widgets = [

    {
        id: "camera",

        priority: 100,

        ratio: 1,

        cols: 2
    },

    {
        id: "materials",

        priority: 90,

        ratio: 1.5,

        cols: 3
    },

    {
        id: "battery",

        priority: 80,

        ratio: 2,

        cols: 2
    },

    {
        id: "shipping",

        priority: 40,

        ratio: 1,

        cols: 2
    },

    {
        id: "reviews",

        priority: 30,

        ratio: 3,

        cols: 3
    }
]



// ============================================================
// RUN
// ============================================================

const result =
    engine.calculate(widgets)

console.log(result)

engine.printGrid()