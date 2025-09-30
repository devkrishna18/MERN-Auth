import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";
export const AppContent=createContext()
export const AppContextProvider=(props)=>{
     axios.defaults.withCredentials = true;
    const backendurl=import.meta.env.VITE_BACKEND_URL
    const[isLoggedin,setisLoggedin]=useState(false)
    const[userData,setuserData]=useState(null)
    const getAuthState=async()=>{
        try{
        const {data}=await axios.get(backendurl+'/api/auth/isAuth');
        if(data.success){
            setisLoggedin(true)
            getUserData()
        }        

        }catch(error){
            toast.error(error.message)
        }
    }
    const getUserData=async()=>{
        try{
            axios.defaults.withCredentials = true;
            const{data}=await axios.get(backendurl+'/api/user/data')
            data.success?setuserData(data.user):toast.error(data.message)
        }
        catch (error) {
            if (error.response && error.response.data) {
              toast.error(error.response.data.message);
            } else {
              toast.error(error.message || "Something went wrong");
            }
          }
    }
    useEffect(()=>{
        getAuthState();
    },[])
    const value={
        backendurl,isLoggedin,
        setisLoggedin,userData,setuserData,
        getUserData
    }
    return(
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}