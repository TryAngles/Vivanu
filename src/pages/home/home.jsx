import FeaturedStyles from "./Featured.module.css"
// FIXED: Explicitly importing your custom Media component from its module track
import { Media } from "../../components/micro/media" 
import Styles from "./home.module.css"
import React from "react";

export default function Home() {
    return (
        <div className={Styles.home}>
            <Featured />
            <Categories />
            <Products />
        </div>
    )
}

function Categories() {
    const categoriesData = ["Hardware", "Lifestyle", "Decor", "Crafted", "Premium", "Minimal", "Minimalist", "Design", "Studio", "Collectibles"];
    
    return (
        <div className={`${Styles.categories} section`}>
            <div className={Styles.sectionTitle}>Browse Categories</div>
            <div className={Styles.categoriesScroller}>
                {categoriesData.map((title, index) => (
                    <div key={index} className={Styles.category}>
                        <div className={Styles.thumbnail}>
                            {/* FIXED: Passing base path context and expandable rule sets safely */}
                            <Media 
                                src={`120?random=cat-${index}`} 
                                base="https://picsum.photos" 
                                alt={title}
                                expandable={false} 
                            />
                        </div>
                        <div className={Styles.title}>{title}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function Products() {
    const productsData = Array.from({ length: 8 });

    return (
        <div className={`${Styles.section} section`}>
            <div className={Styles.heading}>Featured Products</div>
            <div className={Styles.gridContent}>
                {productsData.map((_, index) => (
                    <Card key={index} id={index} />
                ))}
            </div>
        </div>
    )
}

function Card({ id }) {
    return (
        <div className={Styles.card}>
            <div className={Styles.thumbnail}>
                {/* FIXED: Passing props to utilize your custom expandable lightbox portal */}
                <Media 
                    src={`300?random=prod-${id}`} 
                    base="https://picsum.photos" 
                    alt="Product thumbnail preview"
                    expandable={true} 
                />
            </div>
            <div className={Styles.metadata}>
                <div className={Styles.name}>Premium Crafted Spec Item No. {id + 1}</div>
                <div className={Styles.price}>₹4,234</div>
                <button className={Styles.option}>Add to Cart</button>
            </div>
        </div>
    )
}

function Featured() {
    const featuredItems = Array.from({ length: 5 });

    return (
        <div className={`${FeaturedStyles.Featured} section`}>
            <div className={FeaturedStyles.posterList}>
                {featuredItems.map((_, index) => (
                    <div key={index} className={FeaturedStyles.poster}>
                        {/* FIXED: Formatted correctly to support your joinPath engine parameters */}
                        <Media 
                            src={`600/337?random=feat-${index}`} 
                            base="https://picsum.photos" 
                            style={{ aspectRatio: "16/9", objectFit: "cover" }} 
                            alt="Featured banner display"
                            expandable={false}
                        />
                        <div className={FeaturedStyles.posterOverlay}>
                            <span className={FeaturedStyles.badge}>New Release</span>
                            <h3 className={FeaturedStyles.posterTitle}>Collection Vol. {index + 1}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
