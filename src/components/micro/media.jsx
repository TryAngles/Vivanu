import React, { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useDOM } from "../domProvider";
import Styles from "./media.module.css";

/* ==========================================
   1. ISOLATED PURE UTILITY FUNCTIONS
   ========================================== */
const joinPath = (...parts) => {
    parts = parts.flat().filter(v => v != null).map(v => String(v).trim()).filter(Boolean);
    if (!parts.length) return "";

    const last = parts.at(-1);
    if (/^(https?:|data:|blob:)/i.test(last)) return last;

    let protocol = "";
    parts = parts.map((p, i) => {
        if (/^[a-z]+:\/\//i.test(p)) {
            const url = new URL(p);
            protocol = url.protocol + "//" + url.host;
            p = url.pathname;
        }
        if (i === 0 && p === "/") return "/";
        if (i === 0) return p.replace(/\/+$/g, "");
        return p.replace(/^\/+/g, "").replace(/\/+$/g, "");
    });

    let path = parts.join("/");
    path = path.replace(/(?<!:)\/{2,}/g, "/");
    return protocol ? protocol + path : path;
};

const isVideoFile = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov|m4v)(?:\?.*)?$/i.test(url);
};

/* ==========================================
   2. MAIN COMPONENT ENTRY POINT
   ========================================== */
export const Media = React.memo(({
    src,
    media,
    highResSrc,
    fallback = "/placeholder.webp",
    style,
    alt = "",
    base = "/",
    expandable = false,
    controls = true,
    interval = 0,
    ...props
}) => {
    const mediaList = useMemo(() => {
        const rawList = media || (Array.isArray(src) ? src : src ? [{ src, alt }] : []);
        return rawList.map(item => ({
            ...item,
            resolved: joinPath(base, item.src),
            resolvedHighRes: item.highRes ? joinPath(base, item.highRes) : joinPath(base, item.src)
        }));
    }, [src, media, base, alt]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const activeAsset = mediaList[activeIndex] || null;
    const [displaySrc, setDisplaySrc] = useState(activeAsset ? activeAsset.resolved : fallback);
    const [isFading, setIsFading] = useState(false);

    const nextMedia = () => setActiveIndex((prev) => (prev + 1) % mediaList.length);
    const prevMedia = () => setActiveIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);

    // Touch Swipe reference mapping hook data vectors for standard layout cards
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const swipeThreshold = 40;

    const handleTouchStart = (e) => {
        if (mediaList.length <= 1) return;
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        if (mediaList.length <= 1) return;
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (mediaList.length <= 1) return;
        const distance = touchStartX.current - touchEndX.current;
        if (Math.abs(distance) > swipeThreshold) {
            if (distance > 0) nextMedia();
            else prevMedia();
        }
    };

    useEffect(() => {
        if (!activeAsset) return;
        setIsFading(true);
        const timer = setTimeout(() => {
            setDisplaySrc(activeAsset.resolved);
            setIsFading(false);
        }, 150);
        return () => clearTimeout(timer);
    }, [activeIndex, activeAsset]);

    useEffect(() => {
        if (!interval || interval <= 0 || mediaList.length <= 1 || isExpanded) return;
        if (isVideoFile(displaySrc)) return;

        const autoCycle = setInterval(() => {
            nextMedia();
        }, interval);

        return () => clearInterval(autoCycle);
    }, [interval, mediaList.length, displaySrc, isExpanded]);

    if (mediaList.length === 0) return null;

    const handleContainerClick = (e) => {
        if (e.target.tagName === "BUTTON" || e.target.closest("button")) return;
        if (expandable) setIsExpanded(true);
        if (props.onClick) props.onClick(e);
    };

    return (
        <>
            <div
                onClick={handleContainerClick}
                className={Styles.mediaTrackContainer}
                style={{ cursor: expandable ? "zoom-in" : "default" }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <RenderAsset
                    src={displaySrc}
                    alt={activeAsset?.alt || alt}
                    className={`${Styles.baseAsset} ${isFading ? Styles.fading : ""}`}
                    style={style}
                    videoControls={controls}
                    fallback={fallback}
                    onFallbackTrigger={setDisplaySrc}
                    props={props}
                />

                {controls && mediaList.length > 1 && (
                    <CarouselDots
                        list={mediaList}
                        currentIndex={activeIndex}
                        onDotSelect={setActiveIndex}
                    />
                )}
            </div>

            {/* EXPANDED FULLSCREEN PORTAL LIGHTBOX OVERLAY TRACK */}
            {expandable && isExpanded && (
                <LightboxPortal
                    mediaList={mediaList}
                    initialIndex={activeIndex}
                    globalAlt={alt}
                    highResOverride={highResSrc}
                    basePath={base}
                    videoControls={true}
                    onClose={() => setIsExpanded(false)}
                />
            )}
        </>
    );
});

/* ==========================================
   3. ISOLATED MEMOIZED SUB-COMPONENTS
   ========================================== */

const RenderAsset = React.memo(({ src, alt, className, style, videoControls, fallback, onFallbackTrigger, props }) => {
    if (isVideoFile(src)) {
        return (
            <video
                {...props}
                src={src}
                muted={!videoControls}
                autoPlay
                loop
                playsInline
                controls={videoControls}
                className={className}
                style={style}
            />
        );
    }

    return (
        <img
            {...props}
            src={src}
            alt={alt}
            className={className}
            style={style}
            onError={() => {
                if (src !== fallback) onFallbackTrigger(fallback);
            }}
        />
    );
});

const CarouselDots = React.memo(({ list, currentIndex, onDotSelect, isLightbox = false }) => {
    return (
        <div
            className={`${Styles.carouselDotsZone} ${isLightbox ? Styles.lightboxDots : ""}`}
            onClick={e => e.stopPropagation()}
        >
            {list.map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => onDotSelect(idx)}
                    className={`${Styles.dotTrigger} ${currentIndex === idx ? Styles.dotActive : ""}`}
                    aria-label={`Go to slide ${idx + 1}`}
                />
            ))}
        </div>
    );
});

/* ==========================================
   4. NEW HIGH-PERFORMANCE SNAP-SWIPE PORTAL LIGHTBOX
   ========================================== */
const LightboxPortal = React.memo(({ mediaList, initialIndex, globalAlt, highResOverride, basePath, videoControls, onClose }) => {
    const { AppRef } = useDOM();
    const scrollContainerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const portalTarget = AppRef?.current || document.body;

    // Synchronize initial scrolling layout position matching indices on mount
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const targetWidth = container.clientWidth;
        container.scrollLeft = initialIndex * targetWidth;
    }, [initialIndex]);

    // Track scroll completion vectors to update active indices on dots dynamically
    const handleScrollEnd = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollPosition = container.scrollLeft;
        const width = container.clientWidth;
        const nextIndex = Math.round(scrollPosition / width);

        if (nextIndex >= 0 && nextIndex < mediaList.length) {
            setCurrentIndex(nextIndex);
        }
    };

    // Button Driven Navigation Logic handlers
    const navigateTo = (index) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const width = container.clientWidth;
        container.scrollTo({
            left: index * width,
            behavior: "smooth"
        });
        setCurrentIndex(index);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        if (currentIndex > 0) navigateTo(currentIndex - 1);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        if (currentIndex < mediaList.length - 1) navigateTo(currentIndex + 1);
    };

    return createPortal(
        <div className={Styles.lightboxOverlay} onClick={onClose}>
            <button className={Styles.closeBtn} onClick={onClose} aria-label="Close lightbox">&times;</button>

            {/* LEFT OVERLAY ARROW BUTTON */}
            {mediaList.length > 1 && currentIndex > 0 && (
                <button className={`${Styles.navArrow} ${Styles.arrowLeft}`} onClick={handlePrev} aria-label="Previous image">
                    &#8249;
                </button>
            )}

            {/* RIGHT OVERLAY ARROW BUTTON */}
            {mediaList.length > 1 && currentIndex < mediaList.length - 1 && (
                <button className={`${Styles.navArrow} ${Styles.arrowRight}`} onClick={handleNext} aria-label="Next image">
                    &#8250;
                </button>
            )}

            <div className={Styles.lightboxContentFrame} onClick={e => e.stopPropagation()}>

                {/* HORIZONTAL SNAP SCROLL PLAYER CANVASES */}
                <div
                    ref={scrollContainerRef}
                    className={Styles.snapScrollContainer}
                    onScroll={handleScrollEnd}
                >
                    {mediaList.map((asset, index) => {
                        const finalHighRes = highResOverride ? joinPath(basePath, highResOverride) : asset.resolvedHighRes;
                        return (
                            <div key={index} className={Styles.snapSlideItem}>
                                {isVideoFile(finalHighRes) ? (
                                    <video
                                        src={finalHighRes}
                                        controls={videoControls}
                                        autoPlay={currentIndex === index}
                                        loop
                                        className={Styles.expandedAssetVideo}
                                    />
                                ) : (
                                    <img
                                        src={finalHighRes}
                                        alt={asset.alt || globalAlt}
                                        className={Styles.expandedAssetImg}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* FORCED BOTTOM DIRECTORY NAVIGATION INDICATOR DOTS */}
                {mediaList.length > 1 && (
                    <CarouselDots
                        list={mediaList}
                        currentIndex={currentIndex}
                        onDotSelect={navigateTo}
                        isLightbox={true}
                    />
                )}

                {/* DYNAMIC METADATA TEXT CAPTIONS BAR */}
                {(mediaList[currentIndex]?.alt || globalAlt) && (
                    <div className={Styles.captionBar}>
                        {mediaList[currentIndex]?.alt || globalAlt}
                    </div>
                )}
            </div>
        </div>,
        portalTarget
    );
})























// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { createPortal } from "react-dom";
// import { useDOM } from "../domProvider";
// import Styles from "./media.module.css";

// /* ==========================================
//    1. ISOLATED PURE UTILITY FUNCTIONS
//    ========================================== */
// const joinPath = (...parts) => {
//     parts = parts.flat().filter(v => v != null).map(v => String(v).trim()).filter(Boolean);
//     if (!parts.length) return "";

//     const last = parts.at(-1);
//     if (/^(https?:|data:|blob:)/i.test(last)) return last;

//     let protocol = "";
//     parts = parts.map((p, i) => {
//         if (/^[a-z]+:\/\//i.test(p)) {
//             const url = new URL(p);
//             protocol = url.protocol + "//" + url.host;
//             p = url.pathname;
//         }
//         if (i === 0 && p === "/") return "/";
//         if (i === 0) return p.replace(/\/+$/g, "");
//         return p.replace(/^\/+/g, "").replace(/\/+$/g, "");
//     });

//     let path = parts.join("/");
//     path = path.replace(/(?<!:)\/{2,}/g, "/");
//     return protocol ? protocol + path : path;
// };

// const isVideoFile = (url) => {
//     if (!url) return false;
//     return /\.(mp4|webm|ogg|mov|m4v)(?:\?.*)?$/i.test(url);
// };

// /* ==========================================
//    2. MAIN COMPONENT ENTRY POINT
//    ========================================== */
// export const Media = React.memo(({
//     src,
//     media,
//     highResSrc,
//     fallback = "/fallback.png",
//     style,
//     alt = "",
//     base = "/",
//     expandable = false,
//     controls = true,
//     interval = 0,
//     ...props
// }) => {
//     const mediaList = useMemo(() => {
//         const rawList = media || (Array.isArray(src) ? src : src ? [{ src, alt }] : []);
//         return rawList.map(item => ({
//             ...item,
//             resolved: joinPath(base, item.src),
//             resolvedHighRes: item.highRes ? joinPath(base, item.highRes) : joinPath(base, item.src)
//         }));
//     }, [src, media, base, alt]);

//     const [activeIndex, setActiveIndex] = useState(0);
//     const [isExpanded, setIsExpanded] = useState(false);

//     const activeAsset = mediaList[activeIndex] || null;
//     const [displaySrc, setDisplaySrc] = useState(activeAsset ? activeAsset.resolved : fallback);
//     const [isFading, setIsFading] = useState(false);

//     const nextMedia = () => setActiveIndex((prev) => (prev + 1) % mediaList.length);
//     const prevMedia = () => setActiveIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);

//     // Native Touch-Swipe Gesture Mechanics
//     const touchStartX = useRef(0);
//     const touchEndX = useRef(0);
//     const swipeThreshold = 40;

//     const handleTouchStart = (e) => {
//         if (mediaList.length <= 1) return;
//         touchStartX.current = e.touches[0].clientX;
//         touchEndX.current = e.touches[0].clientX;
//     };

//     const handleTouchMove = (e) => {
//         if (mediaList.length <= 1) return;
//         touchEndX.current = e.touches[0].clientX;
//     };

//     const handleTouchEnd = () => {
//         if (mediaList.length <= 1) return;
//         const distance = touchStartX.current - touchEndX.current;
//         if (Math.abs(distance) > swipeThreshold) {
//             if (distance > 0) nextMedia();
//             else prevMedia();
//         }
//     };

//     // Hardware-Accelerated Cross-Fade Transition Effects Loop
//     useEffect(() => {
//         if (!activeAsset) return;
//         setIsFading(true);
//         const timer = setTimeout(() => {
//             setDisplaySrc(activeAsset.resolved);
//             setIsFading(false);
//         }, 150);
//         return () => clearTimeout(timer);
//     }, [activeIndex, activeAsset]);

//     // Automatic Background Interval Autoplay Loop
//     useEffect(() => {
//         if (!interval || interval <= 0 || mediaList.length <= 1 || isExpanded) return;
//         if (isVideoFile(displaySrc)) return;

//         const autoCycle = setInterval(() => {
//             nextMedia();
//         }, interval);

//         return () => clearInterval(autoCycle);
//     }, [interval, mediaList.length, displaySrc, isExpanded]);

//     if (mediaList.length === 0) return null;

//     const handleContainerClick = (e) => {
//         if (e.target.tagName === "BUTTON") return;
//         if (expandable) setIsExpanded(true);
//         if (props.onClick) props.onClick(e);
//     };

//     return (
//         <>
//             <div
//                 onClick={handleContainerClick}
//                 className={Styles.mediaTrackContainer}
//                 style={{ cursor: expandable ? "zoom-in" : "default" }}
//                 onTouchStart={handleTouchStart}
//                 onTouchMove={handleTouchMove}
//                 onTouchEnd={handleTouchEnd}
//             >
//                 <RenderAsset
//                     src={displaySrc}
//                     alt={activeAsset?.alt || alt}
//                     className={`${Styles.baseAsset} ${isFading ? Styles.fading : ""}`}
//                     style={style}
//                     videoControls={controls}
//                     fallback={fallback}
//                     onFallbackTrigger={setDisplaySrc}
//                     props={props}
//                 />

//                 {controls && mediaList.length > 1 && (
//                     <CarouselDots
//                         list={mediaList}
//                         currentIndex={activeIndex}
//                         onDotSelect={setActiveIndex}
//                     />
//                 )}
//             </div>

//             {/* EXPANDED FULLSCREEN PORTAL LIGHTBOX */}
//             {expandable && isExpanded && activeAsset && (
//                 <LightboxPortal
//                     mediaList={mediaList}
//                     activeIndex={activeIndex}
//                     setActiveIndex={setActiveIndex}
//                     globalAlt={alt}
//                     highResOverride={highResSrc}
//                     basePath={base}
//                     videoControls={true}
//                     onClose={() => setIsExpanded(false)}
//                     nextMedia={nextMedia}
//                     prevMedia={prevMedia}
//                     swipeThreshold={swipeThreshold}
//                 />
//             )}
//         </>
//     );
// });

// /* ==========================================
//    3. ISOLATED MEMOIZED RENDER SUB-COMPONENTS
//    ========================================== */

// const RenderAsset = React.memo(({ src, alt, className, style, videoControls, fallback, onFallbackTrigger, props }) => {
//     if (isVideoFile(src)) {
//         return (
//             <video
//                 {...props}
//                 src={src}
//                 muted={!videoControls}
//                 autoPlay
//                 loop
//                 playsInline
//                 controls={videoControls}
//                 className={className}
//                 style={style}
//             />
//         );
//     }

//     return (
//         <img
//             {...props}
//             src={src}
//             alt={alt}
//             className={className}
//             style={style}
//             onError={() => {
//                 if (src !== fallback) onFallbackTrigger(fallback);
//             }}
//         />
//     );
// });

// const CarouselDots = React.memo(({ list, currentIndex, onDotSelect, isLightbox = false }) => {
//     return (
//         <div
//             className={`${Styles.carouselDotsZone} ${isLightbox ? Styles.lightboxDots : ""}`}
//             onClick={e => e.stopPropagation()}
//         >
//             {list.map((_, idx) => (
//                 <button
//                     key={idx}
//                     onClick={() => onDotSelect(idx)}
//                     className={`${Styles.dotTrigger} ${currentIndex === idx ? Styles.dotActive : ""}`}
//                 />
//             ))}
//         </div>
//     );
// });

// const LightboxPortal = React.memo(({ mediaList, activeIndex, setActiveIndex, globalAlt, highResOverride, basePath, videoControls, onClose, nextMedia, prevMedia, swipeThreshold }) => {
//     const { AppRef } = useDOM();
//     const touchStartX = useRef(0);
//     const touchEndX = useRef(0);

//     const activeAsset = mediaList[activeIndex];
//     if (!activeAsset) return null;

//     const finalHighRes = highResOverride ? joinPath(basePath, highResOverride) : activeAsset.resolvedHighRes;
//     const currentCaption = activeAsset.alt || globalAlt;
//     const portalTarget = AppRef?.current || document.body;

//     const handleLTOStart = (e) => {
//         touchStartX.current = e.touches[0].clientX;
//         touchEndX.current = e.touches[0].clientX;
//     };

//     const handleLTOMove = (e) => {
//         touchEndX.current = e.touches[0].clientX;
//     };

//     const handleLTOEnd = () => {
//         const distance = touchStartX.current - touchEndX.current;
//         if (Math.abs(distance) > swipeThreshold) {
//             if (distance > 0) nextMedia();
//             else prevMedia();
//         }
//     };

//     return createPortal(
//         <div
//             className={Styles.lightboxOverlay}
//             onClick={onClose}
//             onTouchStart={handleLTOStart}
//             onTouchMove={handleLTOMove}
//             onTouchEnd={handleLTOEnd}
//         >
//             <button className={Styles.closeBtn} onClick={onClose}>&times;</button>

//             <div className={Styles.lightboxContentFrame} onClick={e => e.stopPropagation()}>
//                 {isVideoFile(finalHighRes) ? (
//                     <video
//                         src={finalHighRes}
//                         controls={videoControls}
//                         autoPlay
//                         loop
//                         className={Styles.expandedAssetVideo}
//                     />
//                 ) : (
//                     <img
//                         src={finalHighRes}
//                         alt={currentCaption}
//                         className={Styles.expandedAssetImg}
//                         onError={(e) => {
//                             if (e.currentTarget.src !== activeAsset.resolved) {
//                                 e.currentTarget.src = activeAsset.resolved;
//                             }
//                         }}
//                     />
//                 )}
//                 {/* FORCED INDICATORS INSIDE PORTALS */}
//                 {mediaList.length > 1 && (
//                     <CarouselDots
//                         list={mediaList}
//                         currentIndex={activeIndex}
//                         onDotSelect={setActiveIndex}
//                         isLightbox={true}
//                     />
//                 )}

//                 {/* REVEALS ALTS TEXT LABELS UNDER GRAPHICS */}
//                 {currentCaption && (
//                     <div className={Styles.captionBar}>
//                         {currentCaption}
//                     </div>
//                 )}
//             </div>
//         </div>,
//         portalTarget
//     );
// });

