// ============================================================
// UPGRADED CELL LAYOUT ENGINE V3.2 (PRODUCTION SANITIZED)
// ============================================================

export default class CellLayoutEngine {
    constructor(rows, cols, mode = "compact") {
        this.rows = rows;
        this.cols = cols;
        this.mode = mode; // "compact" or "scatter"

        this.grid = [];
        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) {
                row.push(0);
            }
            this.grid.push(row);
        }

        this.placed = [];
        this.overflow = [];
    }

    reserve(x, y, w, h) {
        for (let yy = y; yy < y + h; yy++) {
            for (let xx = x; xx < x + w; xx++) {
                if (yy >= 0 && yy < this.rows && xx >= 0 && xx < this.cols) {
                    this.grid[yy][xx] = -1;
                }
            }
        }
    }

    canFit(x, y, w, h) {
        if (x + w > this.cols || y + h > this.rows) {
            return false;
        }

        for (let yy = y; yy < y + h; yy++) {
            for (let xx = x; xx < x + w; xx++) {
                if (this.grid[yy][xx] !== 0) {
                    return false;
                }
            }
        }
        return true;
    }

    occupy(x, y, w, h, id) {
        for (let yy = y; yy < y + h; yy++) {
            for (let xx = x; xx < x + w; xx++) {
                this.grid[yy][xx] = id;
            }
        }
    }

    findPosition(w, h) {
        const positions = [];

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.canFit(x, y, w, h)) {
                    if (this.mode === "compact") {
                        return { x, y };
                    }
                    positions.push({ x, y });
                }
            }
        }

        if (positions.length === 0) return null;
        return positions[Math.floor(Math.random() * positions.length)];
    }

    buildStructure(widget) {
        let targetCols = widget.cols || 2;
        let targetRows = widget.rows || 2;
        
        if (targetCols > this.cols) targetCols = this.cols;

        const hasMedia = widget.media && widget.media.length > 0;

        if (hasMedia) {
            return {
                reserveCols: targetCols,
                reserveRows: targetRows + 1, // Split padding block allocation track
                widgetCols: targetCols,
                widgetRows: targetRows,      
                isSplit: true
            };
        }

        return {
            reserveCols: targetCols,
            reserveRows: targetRows,
            widgetCols: targetCols,
            widgetRows: targetRows,
            isSplit: false
        };
    }

    placeWidget(widget) {
        const structure = this.buildStructure(widget);
        const pos = this.findPosition(structure.reserveCols, structure.reserveRows);

        if (!pos) {
            this.overflow.push(widget);
            return;
        }

        this.occupy(pos.x, pos.y, structure.reserveCols, structure.reserveRows, widget.id);

        // FIXED: Removed the empty array loop maps that caused calculations to crash and fail
        this.placed.push({
            ...widget,
            x: pos.x,
            y: pos.y,
            reserveCols: structure.reserveCols,
            reserveRows: structure.reserveRows,
            widgetCols: structure.widgetCols,
            widgetRows: structure.widgetRows,
            isSplit: structure.isSplit
        });
    }

    calculate(widgets) {
        if (!widgets || widgets.length === 0) {
            return { placed: this.placed, overflow: this.overflow, grid: this.grid };
        }
        
        const sortedWidgets = [...widgets].sort((a, b) => b.priority - a.priority);

        for (const widget of sortedWidgets) {
            this.placeWidget(widget);
        }

        return {
            placed: this.placed,
            overflow: this.overflow,
            grid: this.grid
        };
    }
}
