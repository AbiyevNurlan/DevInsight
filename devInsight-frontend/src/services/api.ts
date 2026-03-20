import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const BASE = ((import.meta as any).env?.VITE_API_BASE as string) || '/api'

// Debug: Log API base URL
console.log('[API Service] Base URL:', BASE)

type QueueItem = { resolve: (v:any)=>void; reject: (e:any)=>void; config: AxiosRequestConfig }

class APIService{
  instance: AxiosInstance
  tokenKey = 'devinsight_jwt'
  refreshKey = 'devinsight_refresh'
  roleKey = 'devinsight_role'
  isRefreshing = false
  queue: QueueItem[] = []

  constructor(){
    this.instance = axios.create({ 
      baseURL: BASE, 
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    console.log('[API Service] Initialized with baseURL:', BASE)

    // Request interceptor - Add Authorization header
    this.instance.interceptors.request.use((config)=>{
      const token = this.getToken()
      if(token){
        if(!(config as any).headers) (config as any).headers = {}
        ;(config as any).headers['Authorization'] = `Bearer ${token}`
      }
      // Ensure Content-Type is set
      if(!config.headers['Content-Type']){
        config.headers['Content-Type'] = 'application/json'
      }
      console.log('[API Service] Request:', {
        method: config.method,
        url: config.url,
        hasAuth: !!token
      })
      return config
    }, (error) => {
      console.error('[API Service] Request error:', error)
      return Promise.reject(error)
    })

    // Response interceptor - Handle errors and token refresh
    this.instance.interceptors.response.use(
      (res) => {
        console.log('[API Service] Response OK:', res.status, res.config.url)
        return res
      }, 
      (error) => {
        console.error('[API Service] Response error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        })
        return this.handleError(error)
      }
    )
  }

  // Exponential backoff retry helper
  async retry<T>(fn: ()=>Promise<T>, retries=3, delayMs=300): Promise<T>{
    try{ 
      return await fn() 
    }catch(err){
      if(retries<=0) throw err
      await new Promise(r=> setTimeout(r, delayMs))
      return this.retry(fn, retries-1, delayMs*2)
    }
  }

  async handleError(err:any){
    const original = err.config
    const status = err.response?.status

    // Handle 401 Unauthorized - try to refresh token
    if(status === 401 && !original._retry){
      original._retry = true
      console.log('[API Service] Received 401, attempting token refresh...')
      return this.attemptRefresh(original)
    }

    // For other errors, just reject
    return Promise.reject(err)
  }

  async attemptRefresh(originalConfig: AxiosRequestConfig){
    if(this.isRefreshing){
      console.log('[API Service] Token refresh already in progress, queuing request')
      return new Promise((resolve, reject)=>{
        this.queue.push({ resolve, reject, config: originalConfig })
      })
    }

    this.isRefreshing = true
    const refreshToken = this.getRefreshToken()
    
    console.log('[API Service] Attempting token refresh...', {
      hasRefreshToken: !!refreshToken,
      queueLength: this.queue.length
    })
    
    try{
      if(!refreshToken) {
        console.error('[API Service] No refresh token available - cannot refresh session')
        throw new Error('No refresh token available. Please log in again.')
      }
      
      const r = await axios.post(`${BASE}/auth/refresh`, { refreshToken })
      const newToken = r.data?.data?.token
      const newRefresh = r.data?.data?.refreshToken
      const newRole = r.data?.data?.role
      
      console.log('[API Service] Token refresh response:', {
        hasNewToken: !!newToken,
        hasNewRefresh: !!newRefresh,
        role: newRole
      })
      
      if(!newToken) {
        console.error('[API Service] Token refresh response did not contain new token')
        throw new Error('Token refresh failed - no new token received')
      }
      
      this.setToken(newToken)
      console.log('[API Service] New access token stored')
      
      if(newRefresh) {
        this.setRefreshToken(newRefresh)
        console.log('[API Service] New refresh token stored')
      }
      
      if(newRole) {
        this.setRole(newRole)
        console.log('[API Service] Role updated:', newRole)
      }
      
      this.processQueue(null)
      console.log('[API Service] Token refresh successful, retrying original request')
      
      return this.instance(originalConfig)
    }catch(e: any){
      console.error('[API Service] Token refresh failed:', {
        error: e.message,
        response: e.response?.data
      })
      this.processQueue(e)
      this.clearTokens()
      console.log('[API Service] Tokens cleared due to refresh failure')
      return Promise.reject(e)
    }finally{ 
      this.isRefreshing = false 
    }
  }

  processQueue(err: any){
    while(this.queue.length){
      const q = this.queue.shift()!
      if(err) q.reject(err)
      else q.resolve(this.instance(q.config))
    }
  }

  getToken(){ 
    return localStorage.getItem(this.tokenKey) 
  }

  getRefreshToken(){ 
    return localStorage.getItem(this.refreshKey) 
  }

  setToken(t:string){ 
    localStorage.setItem(this.tokenKey, t) 
  }

  setRefreshToken(t:string){ 
    localStorage.setItem(this.refreshKey, t) 
  }

  clearTokens(){ 
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshKey)
    localStorage.removeItem(this.roleKey)
  }

  clearToken(){ 
    this.clearTokens() 
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey)
  }

  setRole(role: string) {
    localStorage.setItem(this.roleKey, role)
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN'
  }

  // Convenience methods
  get(path:string, config?:AxiosRequestConfig){ 
    return this.retry(()=> this.instance.get(path, config)) 
  }

  post(path:string, data?:any, config?:AxiosRequestConfig){ 
    return this.retry(()=> this.instance.post(path, data, config)) 
  }

  put(path:string, data?:any, config?:AxiosRequestConfig){ 
    return this.retry(()=> this.instance.put(path, data, config)) 
  }

  patch(path:string, data?:any, config?:AxiosRequestConfig){ 
    return this.retry(()=> this.instance.patch(path, data, config)) 
  }

  delete(path:string, config?:AxiosRequestConfig){ 
    return this.retry(()=> this.instance.delete(path, config)) 
  }
}

// Create singleton instance
const api = new APIService()

export default api
