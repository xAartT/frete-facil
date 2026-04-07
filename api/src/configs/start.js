import { pool } from './index.js';

const sql = `
  DO $$ BEGIN
    CREATE TYPE tipo_usuario AS ENUM ('P', 'S', 'A', 'M');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  DO $$ BEGIN
    CREATE TYPE status_encomenda AS ENUM (
      'DISPONIVEL',
      'AGUARDANDO_PROPOSTAS',
      'ACEITA',
      'EM_TRANSITO',
      'ENTREGUE',
      'CANCELADA'
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  DO $$ BEGIN
    CREATE TYPE status_proposta AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  DO $$ BEGIN
    CREATE TYPE status_pagamento AS ENUM ('PENDENTE', 'PAGO', 'ESTORNADO');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    tipo tipo_usuario NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    data_nascimento TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS enderecos (
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

  CREATE TABLE IF NOT EXISTS veiculos (
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

  CREATE TABLE IF NOT EXISTS encomendas (
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

  CREATE TABLE IF NOT EXISTS propostas (
    id SERIAL PRIMARY KEY,
    encomenda_id INTEGER NOT NULL REFERENCES encomendas(id) ON DELETE CASCADE,
    motorista_id INTEGER NOT NULL REFERENCES usuarios(id),
    valor_proposto NUMERIC(10,2) NOT NULL,
    mensagem TEXT,
    status status_proposta DEFAULT 'PENDENTE',
    data_proposta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (encomenda_id, motorista_id)
  );

  CREATE TABLE IF NOT EXISTS pagamentos (
    id SERIAL PRIMARY KEY,
    encomenda_id INTEGER UNIQUE NOT NULL REFERENCES encomendas(id),
    valor_total NUMERIC(10,2) NOT NULL,
    taxa_plataforma NUMERIC(10,2) NOT NULL,
    valor_motorista NUMERIC(10,2) NOT NULL,
    status status_pagamento DEFAULT 'PENDENTE',
    data_pagamento TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS avaliacoes (
    id SERIAL PRIMARY KEY,
    encomenda_id INTEGER NOT NULL REFERENCES encomendas(id),
    avaliador_id INTEGER NOT NULL REFERENCES usuarios(id),
    avaliado_id INTEGER NOT NULL REFERENCES usuarios(id),
    nota INTEGER CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tokens (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

try {
  await pool.query(sql);
  console.log('✅ Banco de dados inicializado com sucesso!');
} catch (err) {
  console.error('❌ Erro ao inicializar banco:', err.message);
} finally {
  await pool.end();
}