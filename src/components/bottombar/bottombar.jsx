import { useState } from "react"
import { CartIcon } from "../micro/icon"
import bottomStyles from "./bottombar.module.css"

export function BottomBar() {
    const [activeIndex, setActiveIndex] = useState(1);

    const menuItems = [
        { id: 0, label: "Discover", icon: <CartIcon /> },
        { id: 1, label: "Cart", icon: <CartIcon /> },
        { id: 2, label: "Profile", icon: <CartIcon /> }
    ];

    return (
        <div className={bottomStyles.bottomBar}>
            <div className={bottomStyles.navContainer}>
                
                {/* THE DYNAMIC INDICATOR LINE: Glides beneath the active item */}
                <div 
                    className={bottomStyles.indicatorLine} 
                    style={{
                        left: `${(activeIndex * 33.333) + 11.111}%` // Centers the micro-line perfectly under columns
                    }}
                />

                {menuItems.map((item) => (
                    <button 
                        key={item.id}
                        className={`${bottomStyles.item} ${activeIndex === item.id ? bottomStyles.active : ""}`}
                        onClick={() => setActiveIndex(item.id)}
                    >
                        <div className={bottomStyles.iconWrapper}>
                            {item.icon}
                        </div>
                        <span className={bottomStyles.label}>{item.label}</span>
                    </button>
                ))}

            </div>
        </div>
    );
}
