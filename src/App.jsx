import Navbar from './components/navbar'
// import Home from './pages/home/home'
import './App.css'
import { BottomBar } from './components/bottombar/bottombar'
import ProductPage from './pages/productPage/productpage'

function App() {

  return (<div className="app light">
    <Navbar/>
    {/* <Home/> */}
    <ProductPage/>
    <BottomBar/>
  </div>)
}

export default App
