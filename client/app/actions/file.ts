import apiClient from "../axios"

export async function DownloadFile(url:string,onProgress:(progress:number)=>void) {
    try {
      // console.log({data:response.data})
      const response = await apiClient.get( `http://localhost:5000/api/file/${url}`,{
        method: 'GET',
        url: url,
        responseType: "stream",
        onDownloadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });
      return {status:response.status,message:response.data}
     
  
  
  } catch (error:any) {
    console.log("error occured at get chats endpoint",error.message)
    return  {status:500,message:[]}   }
  }