import { useAuth0 } from "@auth0/auth0-react"


function useAuth0Token() {
    const { getIdTokenClaims, isAuthenticated } = useAuth0();

    const getToken = async () => {
        console.log("is authenticated in get TOken ",isAuthenticated)
        if (!isAuthenticated) return null;
        const claims = await getIdTokenClaims();
        return claims.__raw;
    }

    // console.log("get token function > ",getToken);

    return getToken;
}

export {useAuth0Token}