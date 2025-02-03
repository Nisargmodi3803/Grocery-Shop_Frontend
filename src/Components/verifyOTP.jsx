import axios from "axios";

export const verifyOTP = async (otp) => {
    try {
        const result = await window.confirmationResult.confirm(otp);
        const idToken = await result.user.getIdToken();

        // Send ID Token to Spring Boot Backend using Axios
        const response = await axios.post("http://localhost:9000/api/auth/verify-otp", {
            token: idToken
        });

        console.log("Backend Response:", response.data);

    } catch (error) {
        console.error("OTP Verification Failed:", error);
    }
};
