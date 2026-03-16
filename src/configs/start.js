import { pool } from './index.js';

const sql = `
    CREATE TYPE tipo_usuario AS ENUM ('CLIENTE', 'MOTORISTA', 'ADMIN');

    CREATE TYPE status_encomenda AS ENUM (
    'DISPONIVEL',
    'AGUARDANDO_PROPOSTAS',
    'ACEITA',
    'EM_TRANSITO',
    'ENTREGUE',
    'CANCELADA'
    );

    CREATE TYPE status_proposta AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA');

    CREATE TYPE status_pagamento AS ENUM ('PENDENTE', 'PAGO', 'ESTORNADO');

    CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        login VARCHAR(50) UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        tipo tipo_usuario NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        data_nascimento TIMESTAMP,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE enderecos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        cep VARCHAR(9),
        numero VARCHAR(10),
        logradouro VARCHAR(100),
        bairro VARCHAR(50),
        complemento VARCHAR(50),
        estado VARCHAR(20),
        pais VARCHAR(20),
        latitude DECIMAL(9,6),
        longitude DECIMAL(9,6)
    );


    CREATE TABLE veiculos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nome VARCHAR(50),
        modelo VARCHAR(50),
        cor VARCHAR(20),
        placa VARCHAR(10) UNIQUE NOT NULL,
        marca VARCHAR(30),
        ano INTEGER,
        renavam VARCHAR(20),
        peso_max NUMERIC(6,2),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE encomendas (
        id SERIAL PRIMARY KEY,

        cliente_id INTEGER NOT NULL REFERENCES usuarios(id),
        motorista_id INTEGER REFERENCES usuarios(id),

        endereco_coleta_id INTEGER REFERENCES enderecos(id),
        endereco_entrega_id INTEGER REFERENCES enderecos(id),

        descricao TEXT NOT NULL,
        peso NUMERIC(6,2),
        valor_sugerido NUMERIC(10,2),

        status status_encomenda DEFAULT 'DISPONIVEL',

        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_envio TIMESTAMP,
        data_entrega TIMESTAMP,

        observacao TEXT
    );

    CREATE TABLE propostas (
        id SERIAL PRIMARY KEY,

        encomenda_id INTEGER NOT NULL REFERENCES encomendas(id) ON DELETE CASCADE,
        motorista_id INTEGER NOT NULL REFERENCES usuarios(id),

        valor_proposto NUMERIC(10,2) NOT NULL,
        mensagem TEXT,

        status status_proposta DEFAULT 'PENDENTE',

        data_proposta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE (encomenda_id, motorista_id)
    );

    CREATE TABLE pagamentos (
        id SERIAL PRIMARY KEY,

        encomenda_id INTEGER UNIQUE NOT NULL REFERENCES encomendas(id),

        valor_total NUMERIC(10,2) NOT NULL,
        taxa_plataforma NUMERIC(10,2) NOT NULL,
        valor_motorista NUMERIC(10,2) NOT NULL,

        status status_pagamento DEFAULT 'PENDENTE',

        data_pagamento TIMESTAMP
    );

    CREATE TABLE avaliacoes (
        id SERIAL PRIMARY KEY,

        encomenda_id INTEGER NOT NULL REFERENCES encomendas(id),
        avaliador_id INTEGER NOT NULL REFERENCES usuarios(id),
        avaliado_id INTEGER NOT NULL REFERENCES usuarios(id),

        nota INTEGER CHECK (nota BETWEEN 1 AND 5),
        comentario TEXT,

        data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE tokens (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

await pool.query(sql);