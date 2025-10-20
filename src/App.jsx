import "../src/styles/scss/main.scss";
import Home from "./assets/pages/Home";
import { Routes, Route, Navigate } from "react-router-dom";
// import ScrollToSection from "./assets/components/ScrollToSection";
import { useAccount } from 'wagmi';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isConnected, status } = useAccount();

  // Avoid redirecting while wagmi is initializing or reconnecting
  if (status === 'connecting' || status === 'reconnecting') {
    return null; // or a small loader if you prefer
  }

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
 
  return (
    <>
      {/* <ScrollToSection /> */}
      <Routes>
        <Route path="/" element={<Home />} />
      
        
      
      </Routes>
    </>
  );
}

export default App;
