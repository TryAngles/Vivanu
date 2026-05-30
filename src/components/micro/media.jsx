import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const joinPath = (...parts) => {
    parts = parts
        .flat()
        .filter(v => v != null)
        .map(v => String(v).trim())
        .filter(Boolean);

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

export function Image({
    src,
    highResSrc, // 1. Added optional high-quality asset path
    fallback = "/fallback.png",
    style,
    alt = "",
    base = "/",
    expandable,
    ...props
}) {
    const resolved = useMemo(() => joinPath(base, src), [base, src]);
    // 2. Resolve high-res source path if provided, fallback to standard resolved path
    const resolvedHighRes = useMemo(() => highResSrc ? joinPath(base, highResSrc) : resolved, [base, highResSrc, resolved]);
    
    const [img, setImg] = useState(resolved);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setImg(resolved);
    }, [resolved]);

    const handleImageClick = (e) => {
        if (expandable) {
            setIsExpanded(true);
        }
        if (props.onClick) props.onClick(e);
    };

    return (
        <>
            <img
                {...props}
                src={img}
                alt={alt}
                onClick={handleImageClick}
                style={{
                    width: "100%",
                    height: "100%",
                    cursor: expandable ? "pointer" : "default",
                    ...style
                }}
                onError={e => {
                    console.error("Image Failed:", img);
                    if (img !== fallback) setImg(fallback);
                    else e.currentTarget.style.display = "none";
                }}
            />

            {expandable && isExpanded && createPortal(
                <div 
                    onClick={() => setIsExpanded(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgb(from var(--theme-light) r g b / 85%)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 999999,
                        cursor: "zoom-out",
                        backdropFilter: "blur(4px)"
                    }}
                >
                    <button 
                        onClick={() => setIsExpanded(false)}
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            background: "none",
                            border: "none",
                            color: "white",
                            fontSize: "30px",
                            cursor: "pointer",
                            lineHeight: 1
                        }}
                    >
                        &times;
                    </button>

                    {/* Expanded Image Panel */}
                    <img 
                        src={resolvedHighRes} // 3. Renders high-res asset if it exists
                        alt={alt} 
                        style={{
                            maxWidth: "90%",
                            maxHeight: "90%",
                            objectFit: "contain",
                            boxShadow: "0px 4px 20px rgba(0,0,0,0.5)",
                            animation: "imageZoomIn 0.2s ease-out",
                            
                            // 4. Low-Quality rendering fixes (prevents bilinear blur stretching)
                            imageRendering: highResSrc ? "auto" : "pixelated" 
                        }}
                        onError={(e) => {
                            // 5. Fallback back to standard image if high-res fails to load
                            if (e.currentTarget.src !== img) {
                                e.currentTarget.src = img;
                                e.currentTarget.style.imageRendering = "pixelated";
                            }
                        }}
                    />

                    <style>{`
                        @keyframes imageZoomIn {
                            from { transform: scale(0.9); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                </div>,
                document.querySelector(".app") || document.body
            )}
        </>
    );
}
