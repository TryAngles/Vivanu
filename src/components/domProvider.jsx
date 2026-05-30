import { createContext, useContext, useState, useMemo, useEffect } from "react";

const DOMContext = createContext(null);

function DOMContextProvider({ children, scrollRef }) {
    const [isScrollUp, setIsScrollUp] = useState(false);
    const [isScrollLocked, setIsScrollLocked] = useState(false);

    useEffect(() => {
        const scrollContainer = scrollRef?.current;
        if (!scrollContainer) return;

        if (isScrollLocked) {
            // eslint-disable-next-line react-hooks/immutability
            scrollContainer.style.overflowY = "hidden"; // Locks snap scroll
        } else {
            scrollContainer.style.overflowY = "auto";   // Restores snap scroll
        }
    }, [isScrollLocked, scrollRef]);

    // Handle standard scroll tracking
    useEffect(() => {
        const scrollContainer = scrollRef?.current;
        if (!scrollContainer || isScrollLocked) return; // Ignore tracking if locked

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

    // 3. EXPOSE: Expose the state setter function to the custom hook consumer
    const value = useMemo(() => ({ 
        isScrollUp, 
        preventScroll: setIsScrollLocked 
    }), [isScrollUp]);

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
