const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;

// Configuración de la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'estudiantes_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos.');
});

// Configuración de middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Ruta para la página principal
app.get('/', (req, res) => {
    res.render('home');
});

// Ruta para listar estudiantes
app.get('/students', (req, res) => {
    const query = 'SELECT * FROM estudiantes';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.render('index', { students: results });
    });
});

// Ruta para búsqueda de estudiantes
app.get('/students/search', (req, res) => {
    const searchTerm = req.query.searchTerm;
    const query = 'SELECT * FROM estudiantes WHERE nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ? OR carrera LIKE ? OR semestre LIKE ?';
    const likeTerm = '%' + searchTerm + '%';
    connection.query(query, [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm], (err, results) => {
        if (err) throw err;
        res.render('index', { students: results });
    });
});

// Ruta para añadir nuevo estudiante
app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', (req, res) => {
    const { nombre, apellido, cedula, carrera, semestre, nota_final } = req.body;
    const query = 'INSERT INTO estudiantes (nombre, apellido, cedula, carrera, semestre, nota_final) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [nombre, apellido, cedula, carrera, semestre, nota_final], (err) => {
        if (err) throw err;
        res.redirect('/students');
    });
});

// Ruta para editar estudiante
app.get('/edit/:id', (req, res) => {
    const query = 'SELECT * FROM estudiantes WHERE id = ?';
    connection.query(query, [req.params.id], (err, results) => {
        if (err) throw err;
        res.render('edit', { student: results[0] });
    });
});

app.post('/edit/:id', (req, res) => {
    const { nombre, apellido, cedula, carrera, semestre, nota_final } = req.body;
    const query = 'UPDATE estudiantes SET nombre = ?, apellido = ?, cedula = ?, carrera = ?, semestre = ?, nota_final = ? WHERE id = ?';
    connection.query(query, [nombre, apellido, cedula, carrera, semestre, nota_final, req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/students');
    });
});

// Ruta para eliminar estudiante
app.get('/delete/:id', (req, res) => {
    const query = 'DELETE FROM estudiantes WHERE id = ?';
    connection.query(query, [req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/students');
    });
});

// Ruta para listar materias
app.get('/materias', (req, res) => {
    const query = 'SELECT * FROM materias';
    connection.query(query, (err, results) => {
        if (err) throw err;
        res.render('materias', { materias: results });
    });
});

// Ruta para añadir nueva materia
app.get('/materias/add', (req, res) => {
    res.render('add_materia');
});

app.post('/materias/add', (req, res) => {
    const { nombre, docente } = req.body;
    const query = 'INSERT INTO materias (nombre, docente) VALUES (?, ?)';
    connection.query(query, [nombre, docente], (err) => {
        if (err) throw err;
        res.redirect('/materias');
    });
});

// Ruta para ver expediente del estudiante
app.get('/students/:id/expediente', (req, res) => {
    const studentId = req.params.id;
    const studentQuery = 'SELECT * FROM estudiantes WHERE id = ?';
    const subjectsQuery = `SELECT materias.nombre, materias.docente FROM materias
                           JOIN estudiantes_materias ON materias.id = estudiantes_materias.materia_id
                           WHERE estudiantes_materias.estudiante_id = ?`;

    connection.query(studentQuery, [studentId], (err, studentResults) => {
        if (err) throw err;

        connection.query(subjectsQuery, [studentId], (err, subjectsResults) => {
            if (err) throw err;
            res.render('expediente', { student: studentResults[0], subjects: subjectsResults });
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
