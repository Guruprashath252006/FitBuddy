import React from 'react'
import { SignUp } from '@clerk/clerk-react'
import ColorBends from '../components/ColorBends'

const SignUpPage = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#0a0a0f',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Animation */}
            <ColorBends
                colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
                rotation={0}
                speed={0.2}
                scale={1}
                frequency={1}
                warpStrength={1}
                mouseInfluence={1}
                parallax={0.5}
                noise={0.1}
                transparent={true}
                autoRotate={0}
            />

            <div className="glass-3d" style={{ padding: '0', border: 'none', overflow: 'hidden', zIndex: 1 }}>
                <SignUp
                    appearance={{
                        elements: {
                            card: { borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' },
                            headerTitle: { color: 'white' },
                            headerSubtitle: { color: 'rgba(255,255,255,0.6)' },
                            socialButtonsBlockButton: { background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' },
                            formButtonPrimary: { background: 'linear-gradient(135deg, #8a5cff 0%, #00ffd1 100%)', boxShadow: '0 4px 15px rgba(138, 92, 255, 0.4)', color: 'white', fontWeight: 'bold' },
                            formFieldLabel: { color: 'rgba(255,255,255,0.6)' },
                            formFieldInput: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' },
                            // Explicitly hide phone fields and alternatives
                            formField__phone_number: { display: 'none' },
                            alternativeMethods: { display: 'none' },
                            footer: { background: 'transparent' },
                            footerAction: { justifyContent: 'center', width: '100%' },
                            footerActionText: { color: 'rgba(255,255,255,0.6)' },
                            footerActionLink: { color: '#8a5cff' },
                            dividerLine: { background: 'rgba(255,255,255,0.1)' },
                            dividerText: { color: 'rgba(255,255,255,0.4)' }
                        }
                    }}
                />
            </div>
        </div>
    )
}

export default SignUpPage
