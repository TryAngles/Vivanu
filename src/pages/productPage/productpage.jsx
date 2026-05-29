// ProductPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FirstPage from "./firstPage";
import ErrPage from "../fallback/ErrPage";
import Styles from "./productpage.module.css";
import { Image } from "../../components/micro/media";
import { fetchJSON } from "../../lib/fetchJSON";
import Product from "../../lib/core/product.class";
import LoadingPage from "../loading/loading";


export default function ProductPage() {
    const { id } = useParams();
    /**
     * @type {Product} product
    */
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchJSON(
                    `/data/products/${id}/index.json`
                );

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

        return () => mounted = false;

    }, [id]);

    if (loading)
        return <LoadingPage message="fetching Product"/>;

    if (error)
        return (
            <ErrPage code={error.status} message={error.message}/>
        );

    return (
        <div className={Styles.ProductPage}>
            <FirstPage product={product} />
            <ProductMeta product={product} />
        </div>
    );
}

function ProductMeta({ product }) {
    console.log(product,product.media.base)
    return (
        <div className={Styles.productBox}>
            <div className={Styles.info}>

                <div className={Styles.meta}>
                    <div className={Styles.name}>
                        {product.title}
                    </div>

                    <div className={Styles.price}>
                        ₹{product.price}
                    </div>
                </div>

                <div className={Styles.thumbnail}>
                    <Image src={product.thumbnail} base={product.media.base} />
                </div>

            </div>

            <button className={Styles.addToCart}>
                Add to Cart
            </button>
        </div>
    );
}