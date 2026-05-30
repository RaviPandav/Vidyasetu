import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { authService } from "../../services";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    authService.verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card w-full max-w-md text-center">
        {status === "verifying" && (
          <>
            <div className="text-5xl mb-4 animate-spin">⚙️</div>
            <h2 className="font-heading text-2xl font-bold">Verifying your email...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">Your account is ready. Please login to continue.</p>
            <Link to="/login" className="btn-primary">Go to Login</Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">The link is invalid or expired. Please register again.</p>
            <Link to="/register" className="btn-primary">Register Again</Link>
          </>
        )}
      </div>
    </div>
  );
}
