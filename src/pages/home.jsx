import HomeStyles from "./home.module.css"
import FeaturedStyles from "./Featured.module.css"
import ProductsStyles from "./products.module.css"
import { Image } from "../components/micro/media"
export default function Home() {
    return (<>
        <Featured />
        <Products/>
    </>
    )
}

function Products(){
    return(
        <div className={ProductsStyles.Products}>
            <div className={ProductsStyles.heading}></div>
            <div className={ProductsStyles.content}></div>
        </div>
    )
}

function Featured() {
    return (
        <div className={FeaturedStyles.Featured}>
            <div className={FeaturedStyles.posterList}>
                <Posters />
                <Posters />
                <Posters />
            </div>
        </div>
    )
}
let i = 0;
function Posters() {
    return (<div className={FeaturedStyles.poster}>
        <Image src={`https://picsum.photos/256/144?random=${i++}`} />
    </div>)
}