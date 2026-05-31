import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FirstPage from "./firstPage";
import ErrPage from "../fallback/ErrPage";
import Styles from "./productpage.module.css";
import { Media } from "../../components/micro/media";
import { fetchJSON } from "../../lib/fetchJSON";
import Product from "../../lib/core/product.class";
import LoadingPage from "../loading/loading";
import { DownArrowIcon } from "../../components/micro/icon";
import React from "react";
import { ProductContextProvider, useProduct } from "./ProductContextProvider";
import { useDOM } from "../../components/domProvider";

export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { setSnapLock } = useDOM();
    useEffect(() => {
        setSnapLock(loading);
        return () => setSnapLock(false);
    }, [loading, setSnapLock]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchJSON(`/data/products/${id}/index.json`);
                if (!mounted) return;
                setProduct(new Product(data));
            } catch (e) {
                if (!mounted) return;
                console.error(e);
                setError(e);
            } finally {
                mounted && setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    if (loading) 
        return <LoadingPage message="fetching Product" />;
    if (error) return <ErrPage code={error.status} message={error.message} />;

    return (
        <div className={`${Styles.ProductPage}`}>
            <ProductContextProvider productData={product}>
                <FirstPage />
                <ProductMeta />
            </ProductContextProvider>
        </div>
    );
}

const ProductMeta = React.memo(() => {
    const { isExpanded, setIsExpanded } = useProduct();
    const { isScrollUp, preventScroll } = useDOM();

    useEffect(() => {
        preventScroll(isExpanded);
        return () => preventScroll(false);
    }, [isExpanded, preventScroll]);

    const toggle = useCallback(() => setIsExpanded((v) => !v), [setIsExpanded]);

    return (
        <div className={`${Styles.productBox} ${isExpanded ? Styles.expanded : ""} ${isScrollUp ? Styles.minimised : ""}`}>
            <div className={Styles.innerProductBox}>
                <div className={Styles.main}>
                    <ProductInfo />
                    <ProductContent />
                </div>
                <div className={Styles.bottom}>
                    <span className={Styles.viewMore} onClick={toggle}>
                        {isExpanded ? "View less" : "View more"}
                    </span>
                    <button className={Styles.addToCart}>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
});

const ProductInfo = React.memo(() => {
    const { product, setIsExpanded } = useProduct();
    const toggle = useCallback(() => setIsExpanded((v) => !v), [setIsExpanded]);
    
    return (
        <div className={Styles.info}>
            <div className={Styles.meta} onClick={toggle}>
                <div className={Styles.name}>{product.title}</div>
                <div className={Styles.label}>
                    {product.data.brand?.name} ({product.data.brand?.country})
                </div>
                <ProductStock inStock={product.inStock} />
                <div className={Styles.type}>
                    {product.data.type}
                </div>
                <ProductPrice price={product.data.pricing} />
            </div>
            <div className={Styles.thumbnail}>
                <Media expandable={true} src={product.thumbnail} base={product.media.base} alt={product.title} />
            </div>
        </div>
    );
});

const ProductContent = React.memo(() => {
    const { product } = useProduct();
    return (
        <div className={Styles.content}>
            <div>
                <span className={Styles.title}>{product.data.shortTitle}</span>
                <p>{product.data.description.short}</p>
                <p>{product.data.description.full}</p>
                <ul className={Styles.bulletList}>
                    {product.data.description.bulletPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
});

const ProductStock = React.memo(({ inStock }) => {
    return (
        <div className={`${Styles.label} ${Styles.color} ${inStock ? "green" : "red"}`}>
            {inStock ? "Stock Available" : "Out of Stock"}
        </div>
    );
});

const ProductPrice = React.memo(({ price }) => {
    return (
        <div className={Styles.price}>
            ₹{price.sellingPrice}
            <span className={Styles.mrp}>{price.mrp}</span>
            <span className={`${Styles.discount} green`}>
                <DownArrowIcon />
                {price.discountPercent}%
            </span>
        </div>
    );
});
