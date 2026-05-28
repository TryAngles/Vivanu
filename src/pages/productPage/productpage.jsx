import { Image } from "../../components/micro/media"
import FirstPage from "./firstPage";
import ProductPageStyles from "./productpage.module.css"

export default function ProductPage() {
    return (
        <div className={ProductPageStyles.ProductPage}>
            <FirstPage />
            <ProductMeta />
        </div>
    )
}

let i = 0;
function ProductMeta() {
    return (
        <div className={ProductPageStyles.productBox}>
            <div className={ProductPageStyles.info}>
                <div className={ProductPageStyles.meta}>
                    <div className={ProductPageStyles.name}>Earing-2356</div>
                    <div className={ProductPageStyles.price}>256</div>
                </div>
                <div className={ProductPageStyles.thumbnail}>
                    <Image src={`https://picsum.photos/${100}?random=${i++}`} />
                </div>
            </div>
            <button className={ProductPageStyles.addToCart}>Add to Cart</button>
        </div>
    )
}

