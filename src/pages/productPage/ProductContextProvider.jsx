import { createContext, useContext, useState, useMemo, } from "react";

// 1. Create the context
const ProductContext = createContext(null);

// 2. Create the Provider component
function ProductContextProvider({ children,productData }) {
    const [isExpanded, setIsExpanded] = useState(false); 
    const [product, setProduct] = useState(productData);

    // Optimize performance so components only re-render when state actually changes
    const value = useMemo(() => ({
        isExpanded,
        setIsExpanded,
        product,
        setProduct
    }), [isExpanded,product]);

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
}

// 3. Create the custom consumer hook with an error check
function useProduct() {
    const context = useContext(ProductContext);
    
    // Safety check: alerts you if you use the hook outside the Provider
    if (!context) {
        throw new Error("useProduct must be used within a ProductContextProvider");
    }
    
    return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { ProductContextProvider, useProduct };
