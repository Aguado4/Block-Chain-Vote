import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, ethers } from "ethers";
import fondo from './chain.jpg';
import yesImage from './yesImage.png'; // Importa la imagen para el "Sí"
import noImage from './noImage.png'; // Importa la imagen para el "No"

// Dirección del contrato desplegado en la red de pruebas
const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138'; // Reemplaza con la dirección de tu contrato

// ABI del contrato que define las funciones que se pueden llamar
const contractABI = [
    "function vote(bool _vote, bytes32 _signatureHash) external",
    "function yesVotes() view returns (uint256)",
    "function noVotes() view returns (uint256)"
];

function VotingApp() {
    // Estados para manejar la conexión con el proveedor, el firmante, el contrato y los votos
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [yesCount, setYesCount] = useState(0);
    const [noCount, setNoCount] = useState(0);
    const [hoveredButton, setHoveredButton] = useState(null); // Estado para gestionar el botón hover

    useEffect(() => {
        async function init() {
            // Inicializa el proveedor de Ethereum si está disponible
            if (window.ethereum) {
                const provider = new BrowserProvider(window.ethereum);
                setProvider(provider);

                // Verificar si las cuentas ya están conectadas
                const accounts = await provider.send("eth_accounts", []);
                if (accounts.length === 0) {
                    // Solicitar las cuentas solo si no están conectadas
                    try {
                        await provider.send("eth_requestAccounts", []);
                    } catch (error) {
                        console.error("Error al solicitar cuentas:", error);
                    }
                }

                // Obtiene el firmante (la cuenta activa) y el contrato
                const signer = await provider.getSigner();
                setSigner(signer);

                const contract = new Contract(contractAddress, contractABI, signer);
                setContract(contract);

                // Obtiene el número de votos "Sí" y "No" del contrato
                try {
                    const yesVotes = await contract.yesVotes();
                    const noVotes = await contract.noVotes();
                    setYesCount(yesVotes.toNumber());
                    setNoCount(noVotes.toNumber());
                } catch (error) {
                    console.error("Error al obtener los votos:", error);
                }
            } else {
                console.error("Core Wallet no está disponible. Asegúrate de que esté instalado.");
            }
        }
        init();
    }, []);

    const handleVote = async (userVote) => {
        // Maneja la lógica de votación
        try {
            const message = JSON.stringify({ vote: userVote ? "yes" : "no" });
            const signature = await signer.signMessage(message); // Firma el mensaje para verificar la identidad
            const signatureHash = ethers.keccak256(signature); // Crea un hash de la firma

            const tx = await contract.vote(userVote, signatureHash); // Envía la transacción al contrato
            await tx.wait(); // Espera a que la transacción se confirme

            // Actualiza los conteos de votos después de votar
            const yesVotes = await contract.yesVotes();
            const noVotes = await contract.noVotes();
            setYesCount(yesVotes.toNumber());
            setNoCount(noVotes.toNumber());
        } catch (error) {
            console.error("Error al votar:", error);
        }
    };

    return (
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
            justifyContent: 'flex-start', // Cambiado a 'flex-start' para subir el contenido
            paddingTop: '40px' // Añadido padding superior para elevar todo el contenido
        }}>
            <h1 style={{ color: '#B0E0E6' }}>Sistema de Votación Blockchain</h1>
            <h2 style={{ color: '#87CEEB' }}>¿Nos deberían poner 5.0 en la definitiva?</h2>
            <p style={{ color: '#4169E1', fontSize: '24px' }}>Votos por "Sí": {yesCount}</p>
            <p style={{ color: '#4169E1', fontSize: '24px' }}>Votos por "No": {noCount}</p>
            <p style={{ color: '#40E0D0', fontSize: '24px' }}>Votos totales: {yesCount + noCount}</p>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button onClick={() => handleVote(true)} 
                    onMouseEnter={() => setHoveredButton('yes')} 
                    onMouseLeave={() => setHoveredButton(null)} 
                    style={{
                        margin: '5px',
                        padding: '15px 30px',
                        fontSize: '20px',
                        color: '#008000',
                        backgroundColor: hoveredButton === 'yes' ? '#98FB98' : '#f0f0f0', // Cambiar color de fondo al hacer hover
                        border: '2px solid #008000',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>
                    Votar Sí
                </button>
                <button onClick={() => handleVote(false)} 
                    onMouseEnter={() => setHoveredButton('no')} 
                    onMouseLeave={() => setHoveredButton(null)} 
                    style={{
                        margin: '5px',
                        padding: '15px 30px',
                        fontSize: '20px',
                        color: '#FF0000',
                        backgroundColor: hoveredButton === 'no' ? '#FFB6C1' : '#f0f0f0', // Cambiar color de fondo al hacer hover
                        border: '2px solid #FF0000',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>
                    Votar No
                </button>
                {hoveredButton === 'yes' && (
                    <img src={yesImage} alt="Voto Sí" style={{
                        position: 'absolute',
                        top: '100px', // Ajusta la posición de la imagen
                        left: 'calc(50% - 150px)', // Ajusta la posición para centrar a la izquierda
                        width: '150px', // Ajusta el tamaño de la imagen
                        height: 'auto',
                        opacity: 0,
                        animation: 'fadeIn 0.5s forwards'
                    }} />
                )}
                {hoveredButton === 'no' && (
                    <img src={noImage} alt="Voto No" style={{
                        position: 'absolute',
                        top: '100px', // Ajusta la posición de la imagen
                        left: 'calc(50% + 20px)', // Ajusta la posición para centrar a la derecha
                        width: '150px', // Ajusta el tamaño de la imagen
                        height: 'auto',
                        opacity: 0,
                        animation: 'fadeIn 0.5s forwards'
                    }} />
                )}
            </div>
            <footer style={{
                marginTop: '370px', // Aumentado margen superior para el footer
                fontWeight: 'bold',
                color: '#00BFFF',
                position: 'relative',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)'
            }}>
                Desarrollado por Juan José Aguado
            </footer>
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
