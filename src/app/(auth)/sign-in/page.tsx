"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export default function Component() {

    // useSession = A React hook that tells you if someone is logged in and who they are
    const { data: session } = useSession()
    if (session) {
        return (
            <>
                Signed in as {session.user.email} <br />
                <button onClick={() => signOut()}>Sign Out</button>
            </>
        )
    }
    return (
        <>
            Not Signed in <br />
            <button className="bg-orange-500 px-3 py-2 m-4 rounded-xl cursor-pointer" onClick={() => signIn()}>Sign In</button>
        </>
    )
}