CREATE DATABASE IF NOT EXISTS sistema_moedas;

USE sistema_moedas;

DROP TABLE IF EXISTS LogConversaoSimulada;
DROP TABLE IF EXISTS ConfiguracaoAlerta;
DROP TABLE IF EXISTS CotacaoHistorico;

CREATE TABLE CotacaoHistorico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    moeda_origem VARCHAR(10) NOT NULL,
    moeda_destino VARCHAR(10) NOT NULL,
    valor_bid DECIMAL(15, 6) NOT NULL,
    valor_ask DECIMAL(15, 6) NOT NULL,
    variacao DECIMAL(10, 4) NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ConfiguracaoAlerta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    par_moedas VARCHAR(10) NOT NULL,
    valor_limite DECIMAL(15, 2) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE LogConversaoSimulada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    moeda_origem VARCHAR(10) NOT NULL,
    moeda_destino VARCHAR(10) NOT NULL,
    valor_entrada DECIMAL(15, 2) NOT NULL,
    valor_convertido DECIMAL(15, 6) NOT NULL,
    data_simulacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);