import Navbar from './components/navbar'
import Home from './pages/home/home'
import './App.css'
import { BottomBar } from './components/bottombar/bottombar'
import ProductPage from './pages/productPage/productpage'
import { Route, Routes } from 'react-router'
import ErrPage from './pages/fallback/ErrPage'
import ErrorBoundary from './components/errorBoundary/errorBoundary'

function App() {

  return (
  <div className="app dark">
    <ErrorBoundary>
    <Navbar/>                                                                                                                                                                                   
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/product/:id' element={<ProductPage/>}/>
      <Route path="*" element={<ErrPage status={400} message={"Page Not Found"}/>}/>
    </Routes>
    <BottomBar/>
    </ErrorBoundary>
  </div>)
}



export default App
