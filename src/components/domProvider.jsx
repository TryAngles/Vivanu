import { createContext, useContext, useState, useMemo, useEffect } from "react";

// 1. Create the context
const DOMContext = createContext(null);

// 2. Create the Provider component
function DOMContextProvider({children}) {
    const [isScrollUp,setIsScrollUp] = useState(false);

    useEffect(()=>
        trackScroll(setIsScrollUp), 
    [setIsScrollUp]);

    // Optimize performance so components only re-render when state actually changes
    const value = useMemo(() => ({
        isScrollUp
    }), [isScrollUp]);

    return (
        <DOMContext.Provider value={value}>
            {children}
        </DOMContext.Provider>
    );
}

// 3. Create the custom consumer hook with an error check
function useDOM() {
    const context = useContext(DOMContext);
    
    // Safety check: alerts you if you use the hook outside the Provider
    if (!context) {
        throw new Error("useDOM must be used within a DOMContextProvider");
    }
    
    return context;
}

const trackScroll = (setIsScrollUp) => {
    // 1. Maintain a mutable reference of the last position to compare directions
    let lastScrollTop = 0;

    const handleScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Prevent negative bounce values on iOS Safari platforms
        if (scrollTop < 0) return;

        // 2. Clear minimization at the absolute top of the page frame
        if (scrollTop <= 50) {
            setIsScrollUp(false);
            lastScrollTop = scrollTop;
            return;
        }

        // 3. Evaluate scroll vectors
        if (scrollTop > lastScrollTop) {
            // User is moving down (Into product content/gallery) -> Hide Panel
            setIsScrollUp(true);
        } else {
            // User is pulling back up -> Proactively surface actions immediately
            setIsScrollUp(false);
        }

        // Update tracking cursor position
        lastScrollTop = scrollTop;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
};


// eslint-disable-next-line react-refresh/only-export-components
export { useDOM, DOMContextProvider };
