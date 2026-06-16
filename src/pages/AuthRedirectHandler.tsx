import { useEffect } from "react";
import { getRedirectResult } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";

export default function AuthRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        console.log("AUTH REDIRECT HANDLER STARTED");

        const result = await getRedirectResult(auth);

        console.log("REDIRECT RESULT:", result);

        if (result?.user) {
          console.log("LOGIN SUCCESS:", result.user.email);
          navigate("/dashboard");
        } else {
          console.log("NO REDIRECT RESULT");
          navigate("/");
        }
      } catch (error) {
        console.error("REDIRECT ERROR:", error);
        navigate("/");
      }
    };

    run();
  }, [navigate]);

  return <>Signing in...</>;
}
