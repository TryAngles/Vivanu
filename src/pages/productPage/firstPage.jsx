import Styles from "./firstPage.module.css"
import React, { useEffect, useMemo, useState } from "react"

import { Image } from "../../components/micro/media"
import CellLayoutEngine from "../../lib/layoutEngine"

import { useProduct } from "./ProductContextProvider"

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

const FirstPage = React.memo(() => {

    const [screen, setScreen] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    })

    // Responsive columns
    const [grid, reserve] = useMemo(() =>
        CalculateGrid(screen.width, screen.height),
        [screen.width, screen.height])

    // Layout Calculation
    const layout = useMemo(() =>
        CalculateLayout(grid, reserve),
        [grid, reserve])

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

    const { product, setIsExpanded, isExpanded } = useProduct();
    const closeBox = () => setIsExpanded(false);
    return (<>
        <div className={`${Styles.FirstPage} ${Styles.Page}`} onClick={closeBox}>
            <div className={Styles.wide}
                style={{
                    opacity: isExpanded ? 0.5 : 1
                }}>
                <Image src={product.media.wide.src} base={product.media.base} />
            </div>

            <WidgetGrid layoutItems={layout[0].placed} grid={grid} />
        </div>
        {
            layout.slice(1).map((lay) => {
                return (
                    <div className={Styles.Page} onClick={closeBox}>
                        <WidgetGrid layoutItems={lay.placed} grid={grid} />
                    </div>
                )
            })
        }
        
        {/* Render a single layout page container for the entire gallery collection */}
        <div className={`${Styles.Page} ${Styles.GalleryPage}`} onClick={closeBox}>
            <h2 className={Styles.GalleryTitle}>Product Gallery</h2>

            <div className={Styles.GalleryGrid}>
                {product.data.media.gallery.map((image, index) => {
                    return (
                        <div key={image.id || index} className={Styles.GalleryItem}>
                            <Image
                                base={product.data.media.base}
                                src={image.src}
                                highResSrc={image.highRes}
                                expandable={true}
                                alt={`Gallery preview ${index + 1}`}
                                style={{
                                    objectFit: "contain",
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    width: "auto",
                                    height: "auto"
                                }}
                            />
                        </div>
                    )
                })}
            </div>
        </div>

    </>
    )
})

function CalculateGrid(width, height) {
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

}


function CalculateLayout(grid, reserve) {
    if (grid.rows === 0 && grid.cols === 0) return null;

    // Instantiate with your configuration mode ("compact" or "scatter")
    const engine = new CellLayoutEngine(grid.rows, grid.cols, "scatter");
    engine.reserve(...reserve);
    
    const lay = [engine.calculate(WIDGETS)];
    let i = 0;
    
    // Fixed condition bug: changed from OR (||) to AND (&&) to avoid crashing tabs
    while (lay[i].overflow.length !== 0 && i < 5) {
        const overflowEngine = new CellLayoutEngine(grid.rows, grid.cols, "compact");
        lay.push(overflowEngine.calculate(lay[i].overflow));
        i++;
    }
    return lay;
}


// function CalculateLayout(grid, reserve) {
//     if (grid.rows == 0 && grid.cols == 0) return null;

//     const engine = new CellLayoutEngine(
//         grid.rows,
//         grid.cols
//     )
//     engine.reserve(...reserve)
//     const lay = [engine.calculate(WIDGETS)];
//     let i = 0;
//     while (lay[i].overflow.length !== 0 || i > 100) {
//         const engine = new CellLayoutEngine(
//             grid.rows,
//             grid.cols,
//             false
//         );
//         lay.push(engine.calculate(lay[i].overflow))
//         engine.printGrid();
//         i++
//     }
//     console.log(lay)
//     return lay

// }



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

export default FirstPage;