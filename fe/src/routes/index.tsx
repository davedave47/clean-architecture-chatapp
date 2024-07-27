import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom"
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import ChatPage from "@/pages/ChatPage";
import App from "@/apps/App";
import { SocketProvider } from "@/context/SocketContext";
function MyRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="chat" element={<SocketProvider><ChatPage /></SocketProvider>} />
      </Routes>
    </Router>
  );
}

export default MyRouter;