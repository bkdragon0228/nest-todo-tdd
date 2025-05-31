export type Auth =
  | Auth.SignUpRequest
  | Auth.SignInRequest
  | Auth.SignUpResponse;
export namespace Auth {
  export interface SignUpRequest {
    email: string;
    password: string;
  }
  export interface SignInRequest {
    email: string;
    password: string;
  }
  export interface SignUpResponse {
    accessToken: string;
    refreshToken: string;
  }
}
