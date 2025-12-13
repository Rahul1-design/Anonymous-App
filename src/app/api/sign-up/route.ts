import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST(request: Request){
    await dbConnect()

    try {

        const {username, email, password} = await request.json()

        console.log("Sign-up attempt with username:", username); // Debug log

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {status: 400}) // Changed from 404 to 400
        }

        const existingUserByEmail = await UserModel.findOne({
            email
        })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exist with this email"
                }, {status: 400})
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.username = username; // Update username too
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
                console.log("Updated existing user:", existingUserByEmail.username); // Debug log
            }
        }
        else {
            const hashedPassword =  await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()
            console.log("Created new user:", newUser.username, "with code:", verifyCode); // Debug log
        }
        //Send Verification Email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        if(!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status: 500})
        }
        return Response.json({
                success: true,
                message: "User registered successfully. Please verify your email."
            }, {status: 201})

    } catch (error) {

        console.error("Error registering user", error)
        return Response.json({
            success: false,
            message: "Error registering user"
        },
        {
            status: 500
        } 
    )
    }
}