import { useNavigate } from "react-router"
import NavbarStyles from "./navbar.module.css"
import { useDOM } from "./domProvider"
function Navbar() {
  
  const navigate = useNavigate()
  const {isScrollUp} = useDOM();

  const headingStyles = {
    opacity: 0.5
  }
  return (
    <div className={`${NavbarStyles.navBox} ${isScrollUp?NavbarStyles.minimise:""}`}>
      <div className={NavbarStyles.navbar} onClick={() => navigate("/")}>
        <div style={headingStyles}>
          vivanu
        </div>
      </div>
    </div>
  )
}

export default Navbar