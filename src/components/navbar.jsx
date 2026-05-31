import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import NavbarStyles from "./navbar.module.css"
import { useDOM } from "./domProvider"

function Navbar() {
  const navigate = useNavigate()
  const { isScrollUp } = useDOM()
  
  /* 
     DEMO MODES SYSTEM:
     - "default"    -> Standard sleek capsule tracking brand stamp
     - "cartAlert"  -> Stretches horizontal momentarily when item is added
     - "liveStream" -> Glows pulsing red representing live stock drops
     - "expanded"   -> Large state revealing advanced details
  */
  const [islandState, setIslandState] = useState("default")

  // Automated timer: When an item is added, stay in "cartAlert" mode for 3 seconds, then spring back
  useEffect(() => {
    if (islandState === "cartAlert") {
      const timer = setTimeout(() => setIslandState("default"), 3000)
      return () => clearTimeout(timer)
    }
  }, [islandState])

  return (
    <>
      {/* 1. THE FLOATING DEMO CONTROLLER (Temporary Dev Tools for testing) */}
      <div className={NavbarStyles.devController}>
        <button onClick={() => setIslandState("default")}>Pill</button>
        <button onClick={() => setIslandState("cartAlert")}>🛒 Add Item</button>
        <button onClick={() => setIslandState("liveStream")}>🔴 Live Drop</button>
        <button onClick={() => setIslandState("expanded")}>Menu Close</button>
      </div>

      {/* 2. THE DYNAMIC ISLAND COMPONENT */}
      <div className={`${NavbarStyles.navBox} ${isScrollUp ? NavbarStyles.minimise : ""}`}>
        <div 
          className={`${NavbarStyles.navbar} ${NavbarStyles[islandState]}`}
          onClick={() => islandState === "expanded" ? setIslandState("default") : navigate("/")}
        >
          <div className={NavbarStyles.islandContent}>
            
            {/* Left Slot: Changes icons fluidly based on current active state */}
            <div className={NavbarStyles.leftSlot}>
              {islandState === "cartAlert" && <span className={NavbarStyles.iconAnim}>📦</span>}
              {islandState === "liveStream" && <span className={NavbarStyles.pulseDot} />}
              {islandState === "expanded" && <span className={NavbarStyles.backArrow}>←</span>}
            </div>

            {/* Center Slot: Core messaging text feed panel layout */}
            <div className={NavbarStyles.brandZone}>
              {islandState === "default" && (
                <span className={NavbarStyles.logoText}>VIVANU</span>
              )}
              {islandState === "cartAlert" && (
                <span className={NavbarStyles.alertText}>Added to Bag</span>
              )}
              {islandState === "liveStream" && (
                <span className={NavbarStyles.liveText}>Stock Dropping</span>
              )}
              {islandState === "expanded" && (
                <div className={NavbarStyles.megaMenu}>
                  <span className={NavbarStyles.logoTextExpanded}>VIVANU</span>
                  <span className={NavbarStyles.subtitle}>Premium Crafted Edition</span>
                </div>
              )}
            </div>

            {/* Right Slot: Displays context numbers or mini action nodes */}
            <div className={NavbarStyles.rightSlot}>
              {islandState === "cartAlert" && <span className={NavbarStyles.badgeCount}>+1</span>}
              {islandState === "liveStream" && <span className={NavbarStyles.liveCount}>4.2k</span>}
              {islandState === "expanded" && <span className={NavbarStyles.closeIcon}>&times;</span>}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
