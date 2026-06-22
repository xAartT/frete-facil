import { pool } from '../configs/index.js';

export const criar = async ({
  cliente_id,
  endereco_coleta_id,
  endereco_entrega_id,
  descricao,
  peso,
  valor_sugerido,
  distancia,
  tipo_veiculo,
  observacao,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO encomendas (
      cliente_id, endereco_coleta_id, endereco_entrega_id,
      descricao, peso, valor_sugerido, distancia, tipo_veiculo, observacao, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'DISPONIVEL')
    RETURNING *`,
    [cliente_id, endereco_coleta_id, endereco_entrega_id, descricao, peso, valor_sugerido, distancia || null, tipo_veiculo || null, observacao || null]
  );
  return rows[0];
};

export const listarDisponiveis = async () => {
  const { rows } = await pool.query(
    `SELECT e.*,
            c.nome as cliente_nome, c.login as cliente_login,
            ec.logradouro as coleta_logradouro, ec.cidade as coleta_cidade,
            ec.bairro as coleta_bairro, ec.numero as coleta_numero, ec.cep as coleta_cep, ec.estado as coleta_estado,
            ee.logradouro as entrega_logradouro, ee.cidade as entrega_cidade,
            ee.bairro as entrega_bairro, ee.numero as entrega_numero, ee.cep as entrega_cep, ee.estado as entrega_estado
     FROM encomendas e
     LEFT JOIN usuarios c ON e.cliente_id = c.id
     LEFT JOIN enderecos ec ON e.endereco_coleta_id = ec.id
     LEFT JOIN enderecos ee ON e.endereco_entrega_id = ee.id
     WHERE e.status = 'DISPONIVEL'
     ORDER BY e.data_criacao DESC`
  );
  return rows;
};

export const minhasEncomendas = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT e.*,
            c.nome as cliente_nome, c.login as cliente_login,
            m.nome as motorista_nome, m.login as motorista_login,
            ec.logradouro as coleta_logradouro, ec.cidade as coleta_cidade,
            ee.logradouro as entrega_logradouro, ee.cidade as entrega_cidade,
            pa.valor_proposto as valor_aceito
     FROM encomendas e
     LEFT JOIN usuarios c ON e.cliente_id = c.id
     LEFT JOIN usuarios m ON e.motorista_id = m.id
     LEFT JOIN enderecos ec ON e.endereco_coleta_id = ec.id
     LEFT JOIN enderecos ee ON e.endereco_entrega_id = ee.id
     LEFT JOIN propostas pa ON pa.encomenda_id = e.id AND pa.status = 'ACEITA'
     WHERE e.cliente_id = $1 OR e.motorista_id = $1
     ORDER BY e.data_criacao DESC`,
    [usuario_id]
  );
  return rows;
};

export const buscarPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT e.*, 
            c.nome as cliente_nome, c.login as cliente_login,
            m.nome as motorista_nome, m.login as motorista_login,
            ec.logradouro as coleta_logradouro, ec.cidade as coleta_cidade,
            ee.logradouro as entrega_logradouro, ee.cidade as entrega_cidade
     FROM encomendas e
     LEFT JOIN usuarios c ON e.cliente_id = c.id
     LEFT JOIN usuarios m ON e.motorista_id = m.id
     LEFT JOIN enderecos ec ON e.endereco_coleta_id = ec.id
     LEFT JOIN enderecos ee ON e.endereco_entrega_id = ee.id
     WHERE e.id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const atualizarStatus = async (id, novoStatus, usuario_id) => {
  // Validar status permitidos
  const statusValidos = ['DISPONIVEL', 'AGUARDANDO_PROPOSTAS', 'ACEITA', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADA'];
  if (!statusValidos.includes(novoStatus)) {
    throw { status: 400, mensagem: 'Status inválido.' };
  }

  // Buscar encomenda
  const encomenda = await buscarPorId(id);
  if (!encomenda) return null;

  // Validar permissão: apenas cliente ou motorista podem atualizar
  if (encomenda.cliente_id !== usuario_id && encomenda.motorista_id !== usuario_id) {
    throw { status: 403, mensagem: 'Sem permissão para atualizar esta encomenda.' };
  }

  // Lógica de transições de status
  const transicoes = {
    'DISPONIVEL': ['AGUARDANDO_PROPOSTAS', 'CANCELADA'],
    'AGUARDANDO_PROPOSTAS': ['ACEITA', 'CANCELADA'],
    'ACEITA': ['EM_TRANSITO', 'CANCELADA'],
    'EM_TRANSITO': ['ENTREGUE', 'CANCELADA'],
  };

  const statusAtual = encomenda.status;
  if (transicoes[statusAtual] && !transicoes[statusAtual].includes(novoStatus)) {
    throw { status: 400, mensagem: `Não é possível mudar de ${statusAtual} para ${novoStatus}.` };
  }

  const dataAtualizar = novoStatus === 'EM_TRANSITO' 
    ? 'data_envio = CURRENT_TIMESTAMP,'
    : novoStatus === 'ENTREGUE' 
    ? 'data_entrega = CURRENT_TIMESTAMP,'
    : '';

  const { rows } = await pool.query(
    `UPDATE encomendas
     SET ${dataAtualizar} status = $1
     WHERE id = $2
     RETURNING *`,
    [novoStatus, id]
  );
  return rows[0];
};

export const deletar = async (id, usuario_id) => {
  const encomenda = await buscarPorId(id);
  if (!encomenda) return null;

  // Apenas o cliente pode deletar e apenas em status DISPONIVEL
  if (encomenda.cliente_id !== usuario_id) {
    throw { status: 403, mensagem: 'Apenas o cliente pode deletar a encomenda.' };
  }

  if (encomenda.status !== 'DISPONIVEL') {
    throw { status: 400, mensagem: 'Apenas encomendas em status DISPONÍVEL podem ser deletadas.' };
  }

  const { rows } = await pool.query(
    'DELETE FROM encomendas WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0];
};
