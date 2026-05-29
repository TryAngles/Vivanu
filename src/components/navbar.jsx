import { useNavigate } from "react-router"
import NavbarStyles from "./navbar.module.css"
function Navbar() {
  // const SpaceStyles = {
  //   width: "100%",
  //   height: "50px"
  // }

  const navigate = useNavigate()


  const headingStyles={
    opacity: 0.5
  }
  return (<>
  {/* <div style={SpaceStyles}></div> */}
  <div className={NavbarStyles.navbar} onClick={()=>navigate("/")}>
    <div style={headingStyles}>
      vivanu
    </div>
  </div>
  </>
  )
}

export default Navbar