import { Resend } from "resend";

// In here to make the api key of resend email we went to the resend email web and created the api key 

export const resend = new Resend(process.env.RESEND_API_KEY)