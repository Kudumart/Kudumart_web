import { getToken } from "firebase/messaging";
import { messaging } from "./firebaseConfig"; // your file

const VAPID_KEY =
  "BDb9JGLugoj1qxUB5O_mTFr1_q61_5vklCiGFjwDcOpSCpN-v4186F-Sbuw82IUkTP106do5Lqp_SRBPLQsVkqM"; // from Firebase Console

export const requestNotificationPermission = async () => {
  console.log("requesting");
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_VAPID_KEY,
      });
      if (currentToken) {
        console.log("✅ Token:", currentToken);
        // send this token to your backend to save for this user
      } else {
        console.warn("No registration token available.");
      }
    } else {
      console.warn("Permission not granted for notifications.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token.", err);
  }
};
