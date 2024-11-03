// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {
    // Variables para contabilizar votos
    uint256 public yesVotes;
    uint256 public noVotes;

    // Mapping para almacenar si un usuario ya ha votado
    mapping(address => bool) public hasVoted;

    // Mapping para almacenar el hash de la firma de cada usuario
    mapping(address => bytes32) public voteSignatureHash;

    // Evento para registrar cada voto
    event Voted(address indexed voter, bool vote, bytes32 signatureHash);

    // Función para votar
    function vote(bool _vote, bytes32 _signatureHash) external {
        require(!hasVoted[msg.sender], "Usuario ya ha votado.");
            
        // Marcar al usuario como ya votado y guardar el hash de su firma
        hasVoted[msg.sender] = true;
        voteSignatureHash[msg.sender] = _signatureHash;

        // Registrar el voto
        if (_vote) {
            yesVotes++;
        } else {
            noVotes++;
        }
        
        // Emitir un evento
        emit Voted(msg.sender, _vote, _signatureHash);
    }
}
