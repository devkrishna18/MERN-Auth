import React from 'react'
import{Routes,Route} from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPswd from './pages/ResetPswd'
const App = () => {
  return (
   <div>
    <Routes>
      <Route path='/' element={<Home/>}/>
       <Route path='/login' element={<Login/>}/>
         <Route path='/emailverify' element={<EmailVerify/>}/>
            <Route path='/resetpswd' element={<ResetPswd/>}/>
    </Routes>

   </div>
  )
}

export default App