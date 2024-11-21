const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    alunoId: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    nome: String,
    categoria: {
        type: String,
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);

const Post = require("../modelos/postModelo");
const Usuario = require("../modelos/usuarioModelo");

const criarPost = async (req, res) => {
    try {
        const { alunoId, categoria, titulo, conteudo } = req.body;

        const usuario = await Usuario.findById(alunoId);
        if (!usuario) {
            return res.status(400).json({ message: "Usuário não encontrado." });
        }

        const novoPost = new Post({
            alunoId,
            nome: usuario.nome,
            categoria,
            titulo,
            conteudo,
            likes: []
        });

        await novoPost.save();

        const postPopulado = await Post.findById(novoPost._id).populate('alunoId', 'nome');
        
        return res.status(201).json({ 
            message: "Pergunta realizada com sucesso!", 
            post: postPopulado
        });
    } catch (error) {
        console.error("Erro ao criar pergunta:", error);
        return res.status(500).json({ message: "Erro ao criar pergunta.", error });
    }
};

const deletarPost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ mensagem: "Post não encontrado" });
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({ mensagem: "Post deletado com sucesso" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao deletar post: " + erro.message });
    }
};

const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ mensagem: "userId é obrigatório" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ mensagem: "userId inválido" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ mensagem: "Post não encontrado" });
        }

        if (!post.likes) {
            post.likes = [];
        }

        const likeIndex = post.likes.findIndex(like => 
            like && like.toString() === userId.toString()
        );

        if (likeIndex === -1) {
            post.likes.push(userId);
        } else {
            post.likes = post.likes.filter(like => 
                like && like.toString() !== userId.toString()
            );
        }

        await post.save();

        res.status(200).json({
            mensagem: "Like atualizado com sucesso",
            likes: post.likes.length,
            hasLiked: likeIndex === -1
        });

    } catch (erro) {
        console.error('Erro no like:', erro);
        res.status(500).json({ erro: "Erro ao processar like: " + erro.message });
    }
};

const listarPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('alunoId', 'nome')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar posts.", error: error.message });
    }
};

module.exports = {
    criarPost,
    listarPost,
    deletarPost,
    likePost
};
