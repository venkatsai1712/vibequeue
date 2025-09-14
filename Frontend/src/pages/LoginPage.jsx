import "./LoginPage.css";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";

function LoginPage() {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center p-0"
      style={{
        maxWidth: "480px",
        minWidth: "300px",
        minHeight: "100vh",
        maxHeight: "100vh",
      }}
    >
      <div className="d-flex flex-column align-items-center gap-3">
        <div className="d-flex justify-content-center align-items-center">
          <img src="banner.png" className="w-50" />
        </div>
        <a
          className="btn btn-outline-light w-50 d-flex justify-content-between align-items-center"
          href="http://localhost:3000/auth/google"
        >
          Host
          <FcGoogle />
        </a>
        <div className="btn btn-outline-light w-50 d-flex justify-content-between align-items-center">
          User
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
