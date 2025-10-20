import React, { useState, useEffect } from 'react';
import SumsubWebSdk from '@sumsub/websdk-react';
import { initiateKycApplication } from '../api/kyc'
// Wallet to be whitelist
let walletAddress = "0x3873836fBa8917a880586080dEC95BBB9aDAd7f6";

function Home() {
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Fetching verification session...');

  const fetchAccessToken = async () => {
    try {
      setLoading(true);
      setStatus('Generating verification token...');
      let { data } = await initiateKycApplication({ walletAddress })
      setAccessToken(data.accessToken);
      setStatus('Verification session ready.');
    } catch (error) {
      console.error('Error fetching Sumsub access token:', error);
      setStatus('❌ Failed to load verification session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessToken();
  }, []);

  const accessTokenExpirationHandler = () => {
    console.log('🔁 Access token expired. Fetching a new one...');
    fetchAccessToken();
  };

  const messageHandler = (type, payload) => {
    console.log('📩 Sumsub message:', type, payload);
    if (type === 'idCheck.onDone') setStatus('✅ Verification Completed');
    if (type === 'idCheck.onError') setStatus('⚠️ Verification Error');
    if (type === 'idCheck.onCancel') setStatus('🕓 Verification Cancelled');
  };

  const errorHandler = (error) => {
    console.error('Sumsub error:', error);
    setStatus('⚠️ Error in verification process.');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        padding: 20,
        color: 'white',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          background: '#ffffff10',
          borderRadius: 16,
          padding: 30,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 10, fontSize: 24, fontWeight: 600 }}>
          🪪 Identity Verification
        </h2>
        <p style={{ textAlign: 'center', color: '#cbd5e1', marginBottom: 20 }}>
          Verify your wallet address to complete KYC
        </p>

        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 300,
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: '4px solid rgba(255,255,255,0.3)',
                borderTopColor: '#38bdf8',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p>{status}</p>
          </div>
        ) : (
          <>
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 12,
                overflow: 'hidden',
                minHeight: 500,
                backgroundColor: '#f8fafc',
              }}
            >
              <SumsubWebSdk
                accessToken={accessToken}
                expirationHandler={accessTokenExpirationHandler}
                config={{
                  lang: 'en',
                  uiConf: {
                    customCssStr: `
                      .sns-step-content { 
                        background: #f8fafc !important; 
                        border-radius: 12px;
                      }
                      .sns-sdk-container {
                        border-radius: 12px !important;
                      }
                    `,
                  },
                }}
                onMessage={messageHandler}
                onError={errorHandler}
                options={{ adaptIframeHeight: true }}
              />
            </div>

            <div
              style={{
                marginTop: 20,
                textAlign: 'center',
                fontSize: 14,
                color: '#cbd5e1',
              }}
            >
              <p>{status}</p>
            </div>

            <div
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <button
                onClick={fetchAccessToken}
                style={{
                  padding: '10px 20px',
                  background: '#38bdf8',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                🔁 Restart Verification
              </button>
            </div>
          </>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Home;
