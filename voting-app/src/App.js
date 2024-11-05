import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, ethers } from "ethers";
import fondo from './chain.jpg';
import yesImage from './yesImage.png';
import noImage from './noImage.png';

// Dirección del contrato inteligente desplegado en la red Ethereum.
const contractAddress = '0xFc894967E9c09c6DBDBc002F7d6Fb9F657710cAF';
// ABI del contrato inteligente para interactuar con sus métodos.
const contractABI = [
    "function vote(bool _vote, bytes32 _signatureHash) external",
    "function yesVotes() view returns (uint256)",
    "function noVotes() view returns (uint256)"
];

function VotingApp() {
    // Define los estados locales.
    const [provider, setProvider] = useState(null);  // Proveedor de la red Ethereum.
    const [signer, setSigner] = useState(null);      // Firmante para realizar transacciones.
    const [contract, setContract] = useState(null);  // Instancia del contrato inteligente.
    const [yesCount, setYesCount] = useState(0);     // Cuenta de votos a favor (sí).
    const [noCount, setNoCount] = useState(0);       // Cuenta de votos en contra (no).
    const [hoveredButton, setHoveredButton] = useState(null);  // Identifica el botón sobre el cual se pasa el ratón.
    useEffect(() => {
        async function init() {
            // Verifica si el navegador tiene una conexión a Ethereum.
            if (window.ethereum) {
                try {
                    // Crea una instancia del proveedor para interactuar con MetaMask.
                    const providerInstance = new BrowserProvider(window.ethereum);
                    setProvider(providerInstance);

                    // Intenta obtener la cuenta del usuario y, si no está conectada, solicita permiso.
                    const accounts = await providerInstance.send("eth_accounts", []);
                    if (accounts.length === 0) {
                        await providerInstance.send("eth_requestAccounts", []);
                    }

                    // Define al firmante (cuenta que firma transacciones).
                    const signerInstance = await providerInstance.getSigner();
                    setSigner(signerInstance);

                    // Crea una instancia del contrato utilizando la dirección y el ABI.
                    const contractInstance = new Contract(contractAddress, contractABI, signerInstance);
                    setContract(contractInstance);

                    // Obtiene el número de votos "Sí" y "No" desde el contrato.
                    const yesVotes = await contractInstance.yesVotes();
                    const noVotes = await contractInstance.noVotes();

                    // Convierte los valores obtenidos a enteros y los asigna a los estados.
                    setYesCount(parseInt(yesVotes.toString(), 10));
                    setNoCount(parseInt(noVotes.toString(), 10));
                } catch (error) {
                    console.error("Error durante la inicialización:", error);
                }
            } else {
                console.error("Core Wallet no está disponible. Asegúrate de que esté instalado.");
            }
        }
        init();
    }, []);

    // Función para manejar el voto del usuario.
    const handleVote = async (userVote) => {
        // Verifica si el contrato y el firmante están inicializados.
        if (!signer || !contract) {
            console.error("El contrato o el firmante no están inicializados.");
            return;
        }

        try {
            // Crea un mensaje de voto y lo firma con el firmante del usuario.
            const message = JSON.stringify({ vote: userVote ? "yes" : "no" });
            const signature = await signer.signMessage(message);
            const signatureHash = ethers.keccak256(signature);

            // Llama a la función de voto en el contrato, enviando el voto y la firma.
            const tx = await contract.vote(userVote, signatureHash);
            await tx.wait();  // Espera a que la transacción se confirme.

            // Actualiza los conteos de votos desde el contrato después de votar.
            const yesVotes = await contract.yesVotes();
            const noVotes = await contract.noVotes();
            setYesCount(parseInt(yesVotes.toString(), 10));
            setNoCount(parseInt(noVotes.toString(), 10));
        } catch (error) {
            console.error("Error al votar:", error);
        }
    };

    return (
        // Diseño principal de la aplicación.
        <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundImage: `url(${fondo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100vh',
            color: '#000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            paddingTop: '40px'
        }}>
            {/* Título y pregunta para los usuarios */}
            <h1 style={{ color: '#B0E0E6' }}>Sistema de Votación Blockchain</h1>
            <h2 style={{ color: '#87CEEB' }}>¿Nos deberían poner 5.0 en la definitiva?</h2>
            
            {/* Muestra los conteos de votos */}
            <p style={{ color: '#4169E1', fontSize: '24px' }}>Votos por "Sí": {yesCount}</p>
            <p style={{ color: '#4169E1', fontSize: '24px' }}>Votos por "No": {noCount}</p>
            <p style={{ color: '#40E0D0', fontSize: '24px' }}>Votos totales: {yesCount + noCount}</p>
            
            {/* Botones de votación con efectos al pasar el ratón */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                {/* Botón de votar "Sí" */}
                <button onClick={() => handleVote(true)} 
                    onMouseEnter={() => setHoveredButton('yes')} 
                    onMouseLeave={() => setHoveredButton(null)} 
                    style={{
                        margin: '5px',
                        padding: '15px 30px',
                        fontSize: '20px',
                        color: '#008000',
                        backgroundColor: hoveredButton === 'yes' ? '#98FB98' : '#f0f0f0',
                        border: '2px solid #008000',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>
                    Votar Sí
                </button>

                {/* Botón de votar "No" */}
                <button onClick={() => handleVote(false)} 
                    onMouseEnter={() => setHoveredButton('no')} 
                    onMouseLeave={() => setHoveredButton(null)} 
                    style={{
                        margin: '5px',
                        padding: '15px 30px',
                        fontSize: '20px',
                        color: '#FF0000',
                        backgroundColor: hoveredButton === 'no' ? '#FFB6C1' : '#f0f0f0',
                        border: '2px solid #FF0000',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>
                    Votar No
                </button>

                {/* Imágenes que aparecen según el botón sobre el que se pasa el ratón */}
                {hoveredButton === 'yes' && (
                    <img src={yesImage} alt="Voto Sí" style={{
                        position: 'absolute',
                        top: '100px',
                        left: 'calc(50% - 150px)',
                        width: '150px',
                        height: 'auto',
                        opacity: 0,
                        animation: 'fadeIn 0.5s forwards'
                    }} />
                )}
                {hoveredButton === 'no' && (
                    <img src={noImage} alt="Voto No" style={{
                        position: 'absolute',
                        top: '100px',
                        left: 'calc(50% + 20px)',
                        width: '150px',
                        height: 'auto',
                        opacity: 0,
                        animation: 'fadeIn 0.5s forwards'
                    }} />
                )}
            </div>

            {/* Pie de página con créditos */}
            <footer style={{
                marginTop: '370px',
                fontWeight: 'bold',
                color: '#00BFFF',
                position: 'relative',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)'
            }}>
                Desarrollado por Juan José Aguado y Santiago Peña
            </footer>

            {/* Estilos adicionales para animación de imágenes */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default VotingApp;