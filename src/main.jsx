import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App.jsx";
// import { AppProvider } from "./assets/context/AppContext.jsx";
//Wagmi+rainbowkit
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { sepolia } from 'wagmi/chains'; // Changed from base to sepolia for testing
// import { base } from 'wagmi/chains'; // Commented out - will use for mainnet launch
import { WagmiProvider } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';



const config = getDefaultConfig({
  appName: 'Neba Token',
  projectId: import.meta.env.VITE_APP_WAGMI_PROJECT_ID,
  chains: [sepolia], // Using Sepolia testnet for testing
  // chains: [base], // Uncomment this and comment sepolia above when going live on Base
});
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme()}>
            {/* <AppProvider> */}
              <App />
            {/* </AppProvider> */}

          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </StrictMode>
);
