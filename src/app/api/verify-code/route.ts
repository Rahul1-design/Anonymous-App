import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect()
    
    try {
        const {username, code} = await request.json()
        
        console.log("Received verification request:", { username, code }); // Debug log
        
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({username: decodedUsername})

        if (!user) {
            console.log("User not found:", decodedUsername); // Debug log
            return Response.json(
            {
                success: false,
                message: "User not found"
            }, {status: 404})
        }
        
        console.log("User found. Stored code:", user.verifyCode, "Received code:", code); // Debug log
        console.log("Code expiry:", user.verifyCodeExpiry, "Current time:", new Date()); // Debug log
        
        const isCodeValid = user.verifyCode === code; // Changed == to ===
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save()
            console.log("User verified successfully"); // Debug log
            return Response.json({
                success: true,
                message: "Account verified successfully"
            }, {status: 200})
        } else if (!isCodeNotExpired) {
            console.log("Code expired"); // Debug log
            return Response.json({
                success: false,
                message: "Verification code has expired. Please signup again to get a new code."
            }, {status: 400})
        } else {
            console.log("Incorrect code"); // Debug log
            return Response.json({
                success: false,
                message: "Incorrect Verification Code"
            }, {status: 400})
        }

    } catch (error) {
        console.error("Error verifying user:", error); // Better error logging
        return Response.json(
            {
                success: false,
                message: "Error verifying user"
            }, {status: 500}
        )
    }
}