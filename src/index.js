const express = require('express');
const cors = require('cors');
const connection = require('./db');
const bcrypt = require('bcrypt');
const { body, validationResult, query } = require('express-validator');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// Teste simples
app.get('/', (req, res) => {
    res.send('API funcionando!');
});

// Cadastrar motorista no banco de dados
app.post('/motoristas', (req, res) => {
    const {
        nome,
        rg,
        uf,
        email,
        cep,
        complemento,
        dataNascimento,
        telefone,
        cnh,
        categoriaCnh,
        vencimentoCnh,
        nomeMae,
        cidade,
        endereco,
        numero,
        pais,
        observacoes
    } = req.body;

    const query = `
        INSERT INTO motoristas (
            nome, rg, uf, email, cep, complemento, dataNascimento, telefone,
            cnh, categoriaCnh, vencimentoCnh, nomeMae, cidade, endereco, numero, pais, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [
        nome, rg, uf, email, cep, complemento, dataNascimento, telefone,
        cnh, categoriaCnh, vencimentoCnh, nomeMae, cidade, endereco, numero, pais, observacoes
    ], (err, result) => {
        if (err) {
            console.error('Erro ao inserir motorista:', err);
            return res.status(500).json({ erro: err.message });
        }
        res.status(201).json({ message: 'Motorista cadastrado com sucesso!', id: result.insertId });
    });
});

// Listar todos os motoristas
app.get('/motoristas', (req, res) => {
    connection.query('SELECT * FROM motoristas', (err, results) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json(results);
    });
});

// Obter um motorista por ID
app.get('/motoristas/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM motoristas WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Motorista não encontrado.' });
        }
        res.json(results[0]);
    });
});

// Atualizar motorista
app.put('/motoristas/:id', (req, res) => {
    const id = req.params.id;
    const dados = req.body;

    const query = `
        UPDATE motoristas SET ?
        WHERE id = ?
    `;

    connection.query(query, [dados, id], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Motorista não encontrado.' });
        }
        res.json({ message: 'Motorista atualizado com sucesso!' });
    });
});

// Deletar motorista
app.delete('/motoristas/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM motoristas WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Motorista não encontrado.' });
        }
        res.json({ message: 'Motorista excluído com sucesso!' });
    });
});

// Iniciar servidor
app.listen(PORT)
    .on('listening', () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    })
    .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Porta ${PORT} já está em uso.`);
        } else {
            console.error('❌ Erro ao iniciar o servidor:', err);
        }
    });
// página que usa para emprestar ou devolver carro o <select>

app.get('/api/motoristas', (req, res) => {
    const sql = 'SELECT id, nome FROM motoristas';
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});




//  empréstar de veículos
app.post('/emprestar', (req, res) => {
    const { gestor, motorista, telefone, carro, odometro, tipo, data_hora } = req.body;

    // Verificação simples
    if (!gestor || !motorista || !carro || !data_hora) {
        return res.status(400).send('Campos obrigatórios faltando');
    }

    // salvar os dados no banco de dados
    const query = `
        INSERT INTO eventos (gestor, motorista, telefone, carro, odometro, tipo, data_hora)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    console.log('Dados do empréstimo:', [gestor, motorista, telefone, carro, odometro, tipo, data_hora]);

    connection.query(query, [gestor, motorista, telefone, carro, odometro, tipo, data_hora], (err, result) => {
        if (err) {
            console.error('Erro ao registrar empréstimo:', err);
            return res.status(500).send('Erro ao registrar empréstimo');
        }
        res.status(201).send('Empréstimo registrado com sucesso!');

    });
});

// cadastrar carros 
app.post('/carros', (req, res) => {
    const {
        marca,
        modelo,
        fabricacao,
        cor,
        placa,
        renavan,
        chassi,
        quilometragem,
        tipoCombustivel,
        transmissao,
        valor,
        foto,
        observacoes,
    } = req.body;

    const query = `
        INSERT INTO carros (
            marca, modelo, fabricacao, cor, placa, renavan, chassi, quilometragem,
            tipoCombustivel, transmissao, valor, foto, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [
        marca, modelo, fabricacao, cor, placa, renavan, chassi, quilometragem,
        tipoCombustivel, transmissao, valor, foto, observacoes
    ], (err, result) => {
        if (err) {
            console.error('Erro ao inserir Carro:', err);
            return res.status(500).json({ erro: err.message });
        }
        res.status(201).json({ message: 'Carro cadastrado com sucesso!', id: result.insertId });
    });
});

// devolver veículos
app.post('/devolver', (req, res) => {
    const { gestor, motorista, telefone, carro, odometro, tipo, data_hora } = req.body;


    if (!gestor || !motorista || !carro || !data_hora) {
        return res.status(400).send('Campos obrigatórios faltando');
    }

    // salvar os dados no banco de dados
    const query = `
        INSERT INTO eventos ( gestor,motorista, telefone, carro, odometro ,tipo, data_hora)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    console.log('Dados devolução:', [gestor, motorista, telefone, carro, odometro, tipo, data_hora]);

    connection.query(query, [gestor, motorista, telefone, carro, odometro, tipo, data_hora], (err, result) => {
        if (err) {
            console.error('Erro ao registrar Devolução:', err);
            return res.status(500).send('Erro ao registrar devolução');
        }
        res.status(201).send('Devolução registrada com sucesso!');

    });
});

app.post('/cadastrase',
    body('email').isEmail().withMessage('e-mail inválido.'),
    body('cpf').matches(/^\d{11}$/).withMessage('O CPF deve ter 11 dígitos.'),
    body('senha').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
    async (req, res) => {
        const erros = validationResult(req);

        if (!erros.isEmpty()) {
            return res.status(400).json({ erro: erros.array()[0].msg });
        }

        const { nome, sobrenome, telefone, cpf, email, senha } = req.body;

        try {
            const saltRounds = 10;
            const senha_hash = await bcrypt.hash(senha, saltRounds);

            const sql = `
                INSERT INTO gestor
                (nome, sobrenome, telefone, cpf, email, senha_hash)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            connection.query(sql, [nome, sobrenome, telefone, cpf, email, senha_hash], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ erro: 'Erro ao salvar dados no banco.' });
                }
                res.status(201).json({ message: 'Gestor cadastrado com sucesso!' });
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
    }
);

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ success: false, message: 'Por favor, forneça email e senha.' });
    }

    connection.query('SELECT * FROM gestor WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Erro na consulta ao banco de dados:', err);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
        }

        const gestor = results[0];

        const senhaValida = await bcrypt.compare(senha, gestor.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({ success: false, message: 'Senha incorreta.' });
        }


        const token = jwt.sign({ gestorId: gestor.id }, 'segredo_jwt', { expiresIn: '1h' });

        return res.json({
            success: true,
            message: 'Login bem-sucedido!',
            token,
        });
    });
});


app.get('/mcadastrados', (req, res) => {
    connection.query('SELECT * FROM motoristas', (err, results) => {
        if (err) {
            console.error('Erro na consulta:', err);
            res.status(500).json({ error: 'Erro ao buscar dados.' });
            return;
        }
        res.json(results);
    });
});

app.get('/eventos', (req, res) => {
    connection.query('SELECT * FROM eventos', (err, results) => {
        if (err) {
            console.error('Erro na consulta:', err);
            res.status(500).json({ error: 'Erro ao buscar dados.' });
            return;
        }
        res.json(results);
    });
});