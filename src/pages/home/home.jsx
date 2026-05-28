import FeaturedStyles from "./Featured.module.css"
import { Image } from "../../components/micro/media"
import Styles from "./home.module.css"
export default function Home() {
    return (<>
        <Featured />
        <Catigaries>
            <Catigary />
            <Catigary />
            <Catigary />
            <Catigary />
            <Catigary />
            <Catigary />
            <Catigary />
            <Catigary />
            <Catigary />
            <Catigary />
        </Catigaries>
        <Products />
    </>
    )
}

let i = 0;

function Catigary() {
    return (
        <div className={Styles.catigary}>
            <div className={Styles.thumbnail}>
                <Image src={`https://picsum.photos/100?random=${i++}`} />
            </div>
            <div className={Styles.title}>
                Lorem, ipsum.
            </div>
        </div>
    );
}

function Catigaries({ children }) {
    return (
        <div className={Styles.catigaries}>
            {children}
        </div>
    )
}










function Products() {
    return (
        <div className={Styles.section}>
            <div className={Styles.heading}>Products</div>
            <div className={Styles.content}>
                <Card />
                <Card />
                <Card />
                <Card />
                <Card />
                <Card />
                <Card />
            </div>
        </div>
    )
}

function Card() {
    return (<>
        <div className={Styles.card}>
            <div className={Styles.thumbnail}>
                <Image src={`https://picsum.photos/100?random=${i++}`} />
            </div>
            <div className={Styles.metadata}>
                <div className={Styles.name}>Lorem ipsum dolor sit amet.</div>
                <div className={Styles.price}>234</div>
                <div className={Styles.option}>Add to Cart</div>
            </div>
        </div>
    </>
    )
}




function Featured() {
    return (
        <div className={FeaturedStyles.Featured}>
            <div className={FeaturedStyles.posterList}>
                <Posters />
                <Posters />
                <Posters />
                <Posters />
                <Posters />
                <Posters />
                <Posters />
                <Posters />
            </div>
        </div>
    )
}


function Posters() {
    return (<div className={FeaturedStyles.poster}>
        <Image src={`https://picsum.photos/256/144?random=${i++}`} style={{ aspectRatio: "16/9" }} />
    </div>)
}