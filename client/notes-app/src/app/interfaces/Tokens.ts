export interface TokenResponse {
    token: string;
  }
  
  export interface TokenPayload {
    email: string;
    password: string;
    username?: string;
  }