import React from 'react'
import assets from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { AppContent } from "../context/AppContext";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
function ResetPswd() {
    axios.defaults.withCredentials = true;
  const{backendurl,isLoggedin,userData, getUserData}=useContext(AppContent)
    const navigate=useNavigate();
    const[email,setEmail]=useState('')
    const[newpassword,setnewpassword]=useState('')
    const[isEmailSent,setisEmailSent]=useState('')
    const[otp,setotp]=useState(0)
    const[isOtpSubmitted,setisOtpSubmitted]=useState(false)
    const inputRefs=React.useRef([])
      const handelInput=(e,index)=>{
        if(e.target.value.length>0 && index<inputRefs.current.length - 1){
          inputRefs.current[index+1].focus();
        }
      }
      const handelKeydown=(e,index)=>{
        if(e.key==='Backspace'&& e.target.value===''&&index>0){
            inputRefs.current[index-1].focus();
        }
      }
      const handelPaste=(e)=>{
        const paste=e.clipboardData.getData('text')
        const pasteArray=paste.split('')
        pasteArray.forEach((char,index) => {
          if(inputRefs.current[index]){
            inputRefs.current[index].value=char;
          }
        });
      }
      const onEmailSubmit=async (e)=>{
        e.preventDefault();
        try{
          const{data}=await axios.post(backendurl+'/api/auth/resetotp',{email})
        data.success?toast.success(data.message):toast.error(error.message)
        data.success&&setisEmailSent(true)
        }
        catch(error){
          toast.error(error.message)
        }
        
      }
      const onOtpSubmit=async(e)=>{
        e.preventDefault();
        const otpArray=inputRefs.current.map(e=>e.value)
        setotp(otpArray.join(''))
        setisOtpSubmitted(true)
      }
      const onSubmitNewPaswd=async(e)=>{
        e.preventDefault();
        try{
          const{data}=await axios.post(backendurl+'/api/auth/resetpswd',{email,otp,newpassword})
          data.success?toast.success(data.message):toast.error(error.message)
           data.success&&navigate('/login')
        }
        catch(error){
          toast.error(error.message)
        }
      }
  return (
    <div className="flex items-center justify-center min-h-screen
  bg-gradient-to-br from-blue-200 to-purple-400">
      <img onClick={()=>navigate('/')}
                src={assets.logo}
                alt=""
                className="absolute left-5 sm:left-20
           top-5 w-28 sm:w-32 cursor-pointer"
              />
      {/* email input form */}
      {!isEmailSent && 
              <form onSubmit={onEmailSubmit} className='bg-slate-900 p-8 
          rounded-lg shadow-lg w-96 text-sm'>
             <h1 className='text-white text-2xl font-semibold 
            text-center mb-4'>Reset Password</h1>
            <p className='text-center mb-6 text-indigo-300'>Enter your registered email address</p>
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5
            rounded-full bg-[#333A5C]'>
              <img src={assets.mail_icon} alt="" />
              <input type="email" placeholder='Email Id'
              className='bg-transparent outline-none text-white' value={email}
              onChange={e=>setEmail(e.target.value)} required/>
            </div>
            <button  className='w-full py-2.5 rounded-full bg-gradient-to-r
          from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer'>Submit</button>
          </form>}
          {/*otp input form*/}
          {!isOtpSubmitted&&isEmailSent&&
          <form onSubmit={onOtpSubmit} className='bg-slate-900 p-8 
          rounded-lg shadow-lg w-96 text-sm'>
            <h1 className='text-white text-2xl font-semibold 
            text-center mb-4'>Reset Password OTP</h1>
            <p className='text-center mb-6 text-indigo-300'>Enter the 6 digit code to reset password</p>
            <div onPaste={handelPaste} className='flex justify-between mb-8'>
              {Array(6).fill(0).map((_,index)=>(
                <input className='w-12 h-12
                bg-[#333A5C] text-white text-center
                text-xl rounded-md' type="text" maxLength='1' key={index} required 
                ref={e=>inputRefs.current[index]=e}
                onInput={(e)=>handelInput(e,index)}
                onKeyDown={(e)=>handelKeydown(e,index)}
                />
              ))}
            </div>
            <button className='w-full py-2.5 rounded-full bg-gradient-to-r
          from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer'>Submit</button>
          </form>}
          {/*enter new password*/}
          {isOtpSubmitted&&isEmailSent&&
           <form onSubmit={onSubmitNewPaswd} className='bg-slate-900 p-8 
          rounded-lg shadow-lg w-96 text-sm'>
             <h1 className='text-white text-2xl font-semibold 
            text-center mb-4'>New Password</h1>
            <p className='text-center mb-6 text-indigo-300'>Enter your new password</p>
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5
            rounded-full bg-[#333A5C]'>
              <img src={assets.lock_icon} alt="" />
              <input type="password" placeholder='Password'
              className='bg-transparent outline-none text-white' value={newpassword}
              onChange={e=>setnewpassword(e.target.value)} required/>
            </div>
            <button  className='w-full py-2.5 rounded-full bg-gradient-to-r
          from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer'>Submit</button>
          </form>}
  </div>
  )
}

export default ResetPswd