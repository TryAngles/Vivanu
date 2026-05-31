import Styles from "./firstPage.module.css"
import React, { useEffect, useMemo, useState } from "react"
import { Media } from "../../components/micro/media"
import CellLayoutEngine from "../../lib/layoutEngine"
import { useProduct } from "./ProductContextProvider"

const FirstPage = React.memo(() => {
    const [screen, setScreen] = useState({ 
        width: window.innerWidth, 
        height: window.innerHeight 
    });
    
    const { product, setIsExpanded, isExpanded } = useProduct();

    // 1. SAFE DATA EXTRACTION PIPELINE
    const activeWidgets = useMemo(() => {
        const attributes = product?.attributes || [];
        return attributes.map((attr) => {
            const definedCols = Number(attr.cols) || 2;
            const definedRatio = Number(attr.ratio) || 1;
            
            let calculatedRows = 2; 
            if (definedRatio === 2) calculatedRows = 1; 

            return {
                id: attr.id,
                label: attr.label,
                value: attr.value,
                media: attr.media || [],
                priority: Number(attr.priority) || 10,
                cols: definedCols,
                rows: calculatedRows
            };
        });
    }, [product]);

    // Gather adaptive column counts safely
    const [grid, reserve] = useMemo(() => 
        CalculateGrid(screen.width, screen.height), 
        [screen.width, screen.height]
    );

    // 2. STABLE PROCESSOR PASS
    const layout = useMemo(() => {
        if (!activeWidgets || activeWidgets.length === 0 || !grid) return null;
        return CalculateLayout(grid, reserve, activeWidgets);
    }, [grid, reserve, activeWidgets]);

    // Handle viewport changes cleanly
    useEffect(() => {
        let timer = null;
        const handleResize = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                setScreen({ width: window.innerWidth, height: window.innerHeight });
            }, 500);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const closeBox = () => setIsExpanded(false);

    // FIXED: Upgraded defensive validation check prevents virtual DOM runtime crashes
    if (!layout || !layout[0] || !layout[0].placed) return null;

    return (
        <>
            {/* Primary Page Canvas (Scatter Engine Layout Sheet View) */}
            <div className={`${Styles.Page} ${Styles.FirstPage} section`} onClick={closeBox}>
                <div className={Styles.wide} style={{ opacity: isExpanded ? 0.5 : 1 }}>
                    <Media src={product.media.wide.src} base={product.media.base} expandable={false} />
                </div>
                <WidgetGrid layoutItems={layout[0].placed} grid={grid} />
            </div>

            {/* Overflow Sheets tracking (Compact Engine Layout views) */}
            {layout.slice(1).map((lay, index) => {
                if (!lay || !lay.placed || lay.placed.length === 0) return null;
                return (
                    <div key={index} className={`${Styles.Page} section`} onClick={closeBox}>
                        <WidgetGrid layoutItems={lay.placed} grid={grid} />
                    </div>
                );
            })}
            
            {/* Fullscreen Portal Product Media Gallery section */}
            <div className={`${Styles.Page} ${Styles.GalleryPage} section`} onClick={closeBox}>
                <h2 className={Styles.GalleryTitle}>Product Gallery</h2>
                <div className={Styles.GalleryGrid}>
                    {product.data.media.gallery.map((image, index) => (
                        <div key={image.id || index} className={Styles.GalleryItem}>
                            <Media base={product.media.base} src={image.src} highResSrc={image.highRes} expandable={true} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
});

function CalculateGrid(width, height) {
    const ratio = width / height;
    // FIXED: Ensured that all device layout outputs consistently pass clean array tracks
    if (ratio < 0.9) return [{ rows: 8, cols: 4 }, [0, 0, 4, 8]];
    if (ratio < 1.4) return [{ rows: 8, cols: 8 }, [2, 0, 4, 8]];
    return [{ rows: 8, cols: 12 }, [4, 0, 4, 8]];
}

function CalculateLayout(grid, reserve, activeWidgets) {
    if (!grid || grid.rows === 0 || grid.cols === 0) return null;

    const pageLayouts = [];
    const validReserve = Array.isArray(reserve) ? reserve : []; // FIXED: Removed blank conditional compiler breaks

    // Page 1 Sheet Generator (Scatter Matrix Layout Pass)
    const scatterEngine = new CellLayoutEngine(grid.rows, grid.cols, "scatter");
    if (validReserve.length > 0) scatterEngine.reserve(...validReserve);
    
    let currentResult = scatterEngine.calculate(activeWidgets);
    pageLayouts.push(currentResult);
    
    // Pages 2-5 Sheet Generators (Sequential Compact Matrix Layout Passes)
    let safetyCounter = 0;
    while (currentResult.overflow && currentResult.overflow.length !== 0 && safetyCounter < 5) {
        const compactEngine = new CellLayoutEngine(grid.rows, grid.cols, "compact");
        currentResult = compactEngine.calculate(currentResult.overflow);
        pageLayouts.push(currentResult);
        safetyCounter++;
    }
    
    return pageLayouts;
}

function WidgetGrid({ layoutItems, grid }) {
    if (!layoutItems || layoutItems.length === 0) return null;
    
    return (
        <div className={Styles.wigits} style={{ "--rows": `${grid.rows}`, "--cols": `${grid.cols}` }}>
            {layoutItems.map((item) => (
                <div
                    key={item.id}
                    className={Styles.wigit}
                    style={{
                        gridRow: `${item.y + 1} / span ${item.reserveRows}`,
                        gridColumn: `${item.x + 1} / span ${item.reserveCols}`
                    }}
                >
                    <Widget widget={item} />
                </div>
            ))}
        </div>
    );
}

function Widget({ widget }) {
    const { product } = useProduct();
    const hasMedia = widget.media && widget.media.length > 0;

    return (
        <div className={`
            ${Styles.widget} 
            ${hasMedia ? Styles.widgetWithMedia : ""} 
            ${widget.isSplit ? Styles.widgetSplitLayout : Styles.widgetInternalLayout}
        `}>
            {hasMedia && (
                <div className={Styles.mediaLayerFrame} style={{ height: `calc((100% / ${widget.reserveRows}) * ${widget.widgetRows})` }}>
                    <Media media={widget.media} base={product.media.base} expandable={true} controls={false} />
                </div>
            )}

            <div className={Styles.widgetBody}>
                <span className={Styles.widgetMeta}>{widget.label}</span>
                <h4 className={Styles.widgetHeading}>{widget.value}</h4>
            </div>
        </div>
    );
}

export default FirstPage;
