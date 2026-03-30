import * as service from '../services/usuariosService.js';

export const meuPerfil = async (req, res) => {
    try {
        const usuario = await service.meuPerfil(req.userId);

        if (!usuario) {
            return res.status(204).json({ message: 'Usuário não encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar perfil do usuário' });
    }
}