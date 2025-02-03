import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Firebase Auth instance
const auth = getAuth();

export const sendOTP = async (phoneNumber) => {
    try {
        const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
                console.log('recaptcha resolved..')
            }
        });
        signInWithPhoneNumber(formValues.phone, recaptchaVerifier).then((result) => {
            setConfirmationResult(result);
            alert("code sent")
            setshow(true);
        })
            .catch((err) => {
                alert(err);
                window.location.reload()
            });
     
    } catch (error) {
        flag = false
        console.log('error sending otp ' + error)
    }
};
