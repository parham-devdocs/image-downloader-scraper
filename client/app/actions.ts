"use server"

import { API } from "@/types"



export async function GetData({page,perPage,filter,sort}:API) {
    
const filterQuery=filter ? `${filter?.key}:eq=${filter?.value}` : ""
const sortQuery=sort ?`_sort=${sort}`:""
const queries=[filterQuery,sortQuery,`_page=${page}`,`_per_page=${perPage}`].join("&")

console.log(`http://localhost:3000/data?${queries}`)

        const res=await fetch(`http://localhost:3000/data?${queries}`)
        if(res.ok){

            return res.json()
        }
        throw Error ("an unexpected problem occured")
       
}