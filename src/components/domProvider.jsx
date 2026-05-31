import { createContext, useContext, useState, useMemo, useEffect} from "react";

const DOMContext = createContext(null);

function DOMContextProvider({ children, scrollRef, appRef }) {
    const [isScrollUp, setIsScrollUp] = useState(false);
    const [isScrollLocked, setIsScrollLocked] = useState(false);
    // 1. ADDED: Centralized state to dynamically disable scroll snapping
    const [disableSnap, setDisableSnap] = useState(false);

    // 2. FIXED: Unified layout manager effect
    useEffect(() => {
        const scrollContainer = scrollRef?.current;
        if (!scrollContainer) return;

        // Manage overall page scroll lock
        if (isScrollLocked) {
            scrollContainer.style.overflowY = "hidden";
        } else {
            scrollContainer.style.overflowY = "auto";
        }

        // Manage dynamic snap locking framework state
        if (disableSnap) {
            scrollContainer.classList.add("noSnap");
            scrollContainer.scrollTop = 0; // Lock cleanly to the top during fetches
        } else {
            // Tiny 50ms layout pass delay allows elements to safely render before locking snap coordinates
            const timer = setTimeout(() => {
                scrollContainer.classList.remove("noSnap");
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isScrollLocked, disableSnap, scrollRef]);

    // Directional scroll metric tracker effect loop
    useEffect(() => {
        const scrollContainer = scrollRef?.current;
        if (!scrollContainer || isScrollLocked) return;

        let lastScrollTop = 0;
        let isTicking = false;

        const handleScroll = () => {
            const scrollTop = scrollContainer.scrollTop;
            if (isTicking) return;
            isTicking = true;

            requestAnimationFrame(() => {
                if (scrollTop < 0) { isTicking = false; return; }
                if (scrollTop <= 50) {
                    setIsScrollUp(false);
                    lastScrollTop = scrollTop;
                    isTicking = false;
                    return;
                }

                const scrollDelta = scrollTop - lastScrollTop;
                const threshold = 15;

                if (Math.abs(scrollDelta) > threshold) {
                    setIsScrollUp(scrollDelta > 0);
                    lastScrollTop = scrollTop;
                }
                isTicking = false;
            });
        };

        scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
        return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }, [scrollRef, isScrollLocked]);

    // 3. EXPOSE: Expose control configurations cleanly to the downstream custom hook consumer
    const value = useMemo(() => ({ 
        isScrollUp, 
        preventScroll: setIsScrollLocked,
        setSnapLock: setDisableSnap, // Added control hook handle shortcut
        AppRef: appRef
    }), [isScrollUp , appRef]);

    return (
        <DOMContext.Provider value={value}>
            {children}
        </DOMContext.Provider>
    );
}

function useDOM() {
    const context = useContext(DOMContext);
    if (!context) throw new Error("useDOM must be used within a DOMContextProvider");
    return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { useDOM, DOMContextProvider };
