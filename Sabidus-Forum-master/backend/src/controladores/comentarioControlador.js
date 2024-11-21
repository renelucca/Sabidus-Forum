const Usuario = require("../modelos/usuarioModelo")
const Post = require("../modelos/postModelo")

const criarComentario = async (req, res) => {
    const { postId } = req.params
    const { usuarioId, conteudo } = req.body

    try {
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ message: "Post não encontrado" })
        }

        const usuario = await Usuario.findById(usuarioId)
        if (!usuario) {
            return res.status(404).json({ message: "Usuário não encontrado" })
        }

        const novoComentario = {
            usuarioId,
            nome: usuario.nome,
            conteudo,
            likes: []
            // MongoDB vai gerenciar automaticamente createdAt e updatedAt
        }
        
        post.comentarios.push(novoComentario)
        await post.save()

        return res.status(201).json({
            message: "Comentário adicionado com sucesso!",
            comentario: novoComentario
        })

    } catch (error) {
        res.status(500).json({ message: "Erro ao adicionar comentário", error: error.message })
    }
}

const listarComentario = async (req, res) => {
    const { postId } = req.params

    try {
        const post = await Post.findById(postId).populate("comentarios.usuarioId", "nome")
        if (!post || post.comentarios.length === 0) {
            return res.status(404).json({ message: "Nenhum comentário encontrado para este post." })
        }

        res.status(200).json(post.comentarios)
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar comentários", error: error.message })
    }
}

const deletarComentario = async (req, res) => {
    const { postId, comentarioId } = req.params;
    const { usuarioId } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post não encontrado" });
        }

        const comentario = post.comentarios.id(comentarioId);
        if (!comentario) {
            return res.status(404).json({ message: "Comentário não encontrado" });
        }

        if (comentario.usuarioId.toString() !== usuarioId) {
            return res.status(403).json({ message: "Você não tem permissão para deletar este comentário" });
        }

        comentario.deleteOne();
        await post.save();

        res.status(200).json({ message: "Comentário deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar comentário", error: error.message });
    }
};

const likeComentario = async (req, res) => {
    const { postId, comentarioId } = req.params;
    const { usuarioId } = req.body;

    try {
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ message: "Post não encontrado" })
        }

        const comentario = post.comentarios.id(comentarioId)
        if (!comentario) {
            return res.status(404).json({ message: "Comentário não encontrado" })
        }

        const likeIndex = comentario.likes.indexOf(usuarioId)
        if (likeIndex === -1) {
            comentario.likes.push(usuarioId)
        } else {
            comentario.likes.splice(likeIndex, 1)
        }

        await post.save()

        res.status(200).json({
            message: likeIndex === -1 ? "Comentário curtido!" : "Like removido!",
            comentario
        });
    } catch (error) {
        res.status(500).json({ message: "Erro ao curtir comentário", error: error.message })
    }
}

module.exports = {
    criarComentario,
    listarComentario,
    likeComentario,
    deletarComentario
}