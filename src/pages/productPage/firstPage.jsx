import Styles from "./firstPage.module.css"
import { useEffect, useMemo, useState } from "react"

import { Image } from "../../components/micro/media"
import CellLayoutEngine from "../../lib/layoutEngine"

const WIDGETS = [
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
        ratio: 1,
        cols: 2
    }
]

export default function FirstPage() {

    const [screen, setScreen] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    })

    // Responsive columns
    const [grid, reserve] = useMemo(() => {

        const width = screen.width
        const height = screen.height
        const ratio = width / height

        // Mobile Portrait
        if (ratio < 0.9) {

            return [
                {
                    rows: 8,
                    cols: 4
                },

                [0, 0, 4, 8]
            ]
        }

        // Tablet / Square
        if (ratio < 1.4) {

            return [
                {
                    rows: 8,
                    cols: 8
                },

                [2, 0, 4, 8]
            ]

        }

        // Desktop Wide
        if (ratio < 2.0) {

            return [
                {
                    rows: 8,
                    cols: 12
                },

                [4, 0, 4, 8]
            ]

        }

        // Ultrawide
        return [
            {
                rows: 8,
                cols: 12
            },

            [4, 0, 4, 8]
        ]

    }, [screen.width, screen.height])



    // Layout Calculation
    const layout = useMemo(() => {
        if (grid.rows == 0 && grid.cols == 0) return null;

        const engine = new CellLayoutEngine(
            grid.rows,
            grid.cols
        )
        engine.reserve(...reserve)
        const lay = [engine.calculate(WIDGETS)];
        let i = 0;
        while (lay[i].overflow.length !== 0 || i > 100) {
            const engine = new CellLayoutEngine(
                grid.rows,
                grid.cols,
                false
            );
            lay.push(engine.calculate(lay[i].overflow))
            engine.printGrid();
            i++
        }
        console.log(lay)
        return lay

    }, [grid, reserve])

    // Resize Listener
    useEffect(() => {
        let i = null;

        const handleResize = () => {
            clearTimeout(i);
            i = setTimeout(() => {
                setScreen({
                    width: window.innerWidth,
                    height: window.innerHeight
                })
            }, 500)
        }

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }

    }, [])



    return (<>
        <div className={`${Styles.FirstPage} ${Styles.Page}`}>
            <div className={Styles.wide}>
                <Image src="/wide.jpg" />
            </div>

            <WidgetGrid layoutItems={layout[0].placed} grid={grid} />
        </div>
        {
            layout.slice(1).map((lay)=>{
                return (
                <div className={Styles.Page}>
                    <WidgetGrid layoutItems={lay.placed} grid={grid} />
                </div>
                )
            })
        }
        </>
    )
}



function WidgetGrid({ layoutItems, grid }) {

    return (
        <div className={Styles.wigits} style={{
            "--rows": `${grid.rows}`,
            "--cols": `${grid.cols}`
        }}>
            {
                layoutItems.map((item) => {

                    return (
                        <div
                            key={item.id}
                            className={Styles.wigit}
                            style={{
                                gridRow: `${item.y + 1} / span ${item.widgetRows}`,
                                gridColumn: `${item.x + 1} / span ${item.widgetCols}`
                            }}
                        >
                            <Widget widget={item} />
                        </div>
                    )

                })
            }

        </div>
    )
}



function Widget({ widget }) {

    return (
        <div className={Styles.widget}>
            <div className={Styles.title}>
                {widget.id}
            </div>
        </div>
    )

}
