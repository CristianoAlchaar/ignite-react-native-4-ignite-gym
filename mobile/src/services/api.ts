import axios, { AxiosInstance, AxiosError } from "axios";
import { apiBaseURL } from '../../config'
import { AppError } from "@utils/AppError";
import { storageAuthTokenGet, storageAuthTokenSave } from "@storage/storageAuthToken";

type SignOut = () => void;

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void
}

type PromiseType = {
  onSuccess: (token: string) => void
  onFailure:(error: AxiosError) => void
}

const api = axios.create({
  baseURL: apiBaseURL
}) as APIInstanceProps

let failedQueue: Array<PromiseType> = []
let isRefreshing = false

api.registerInterceptTokenManager = signOut => {
  const interceptTokenManager = 
  //first paramather is the function that will be executed if promise is fulfilled
  //second paramather is the function that will be executed if fails
  api.interceptors.response.use((response) => response, 
    async (requestError) => {
      if(requestError?.response?.status === 401){ //request not authorized
        if(requestError.response.data?.message === 'token expirado' || requestError.response.data?.message === 'token.invalid'){
          const { refresh_token } = await storageAuthTokenGet()

          if(!refresh_token){
            signOut()
            return Promise.reject(requestError)
          }

          const originalRequestConfig = requestError.config
          
          //if doenst changed token yet
          if(isRefreshing){
            return new Promise((resolve, reject) => {
              failedQueue.push({
                onSuccess: ( token: string ) => {
                  originalRequestConfig.headers = {'Authorization': `Bearer ${token}`}
                  resolve(api(originalRequestConfig))
                },
                onFailure: (error: AxiosError) => {
                  reject(error)
                },
              })
            })
          }

          isRefreshing = true

          return new Promise(async (resolve, reject) => {
            try{
              const { data } = await api.post('/sessions/refresh-token', { refresh_token })

              await storageAuthTokenSave({ token: data.token, refresh_token: data.refresh_token })

              if(originalRequestConfig.data) {
                originalRequestConfig.data = JSON.parse(originalRequestConfig.data)
              }

              originalRequestConfig.headers = {'Authorization': `Bearer ${data.token}` }

              api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

              failedQueue.forEach(request => {
                request.onSuccess(data.token);
              })

              console.log("TOKEN ATUALIZADO")

            } catch(error:any){
              console.log(error)
              failedQueue.forEach(request => {
                request.onFailure(error)
              })

              signOut()
              reject(error)

            } finally{
              isRefreshing = false
              failedQueue = []
            }
          })
        }
        signOut()
      }
      if(requestError.response && requestError.response.data) {
        return Promise.reject(new AppError(requestError.response.data.message))
      } else {
        return Promise.reject(requestError)
      }
    }
  )

  return() => {
    api.interceptors.response.eject(interceptTokenManager)
  }
}



export { api }