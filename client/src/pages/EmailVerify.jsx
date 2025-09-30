import React from 'react'
import { useContext } from "react";
import axios from "axios";
import assets from "../assets/assets";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContent } from "../context/AppContext";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
function EmailVerify() {
  axios.defaults.withCredentials = true;
  const{backendurl,isLoggedin,userData, getUserData}=useContext(AppContent)
  const navigate=useNavigate();
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
  const onSubmitHandler=async(e)=>{
    try{
      e.preventDefault();
      const otpArray=inputRefs.current.map(e=>e.value)
      const otp=otpArray.join('')
      const{data}=await axios.post(backendurl+'/api/auth/verifyEmail',{otp})
      if(data.success){
        toast.success(data.message)
        getUserData()
        navigate('/')
      }
      else{
        toast.error(data.message)
      }

    }catch(error){
      toast.error(error.message)
    }
  }
  useEffect(()=>{isLoggedin&&userData&&userData.isAccountVerified&&navigate('/')},[isLoggedin,userData])
  return (
    <div className="flex items-center justify-center min-h-screen
  bg-gradient-to-br from-blue-200 to-purple-400">
    <img onClick={()=>navigate('/')}
            src={assets.logo}
            alt=""
            className="absolute left-5 sm:left-20
       top-5 w-28 sm:w-32 cursor-pointer"
          />
          <form onSubmit={onSubmitHandler}  className='bg-slate-900 p-8 
          rounded-lg shadow-lg w-96 text-sm'>
            <h1 className='text-white text-2xl font-semibold 
            text-center mb-4'>Email Verify OTP</h1>
            <p className='text-center mb-6 text-indigo-300'>Enter the 6 digit code sent to your email</p>
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
          from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer'>Verify Email</button>
          </form>
  </div>
  )
}

export default EmailVerify