const express = require('express');
const {Pool} = require('pg');
const port = 8000;
const app = express();
app.use(express.json());
//do not put your connection string in your js, move it to a config.json file and then gitignore it so it doesnt get uploade
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'anime',
    password: 'docker',
    port: 5432,
  })
  


app.get('/', (req, res) => {
    res.send('hello world');
});

app.get('/api/anime', (req, res) => {
    pool.query('SELECT * FROM anime')
    .then(result => {
        console.log(result.rows[0])
        res.send(result.rows);
    })
    .catch(e => console.error(e.stack))
});
app.post('/api/anime', (req, res) => {
    let anime = req.body;
    let age = anime.age;
    let kind = anime.kind;
    let name = anime.name;
    pool.query(` INSERT INTO anime (age, kind, name)
    VALUES (${age}, '${kind}', '${name}') RETURNING * `)
    .then(result =>{
        res.status(200).send(result.rows);
    })
    .catch(e => console.error(e.stack))
})
// app.post('/api/anime', (req, res)=> {
//     async function postAnime() {
//     try {
//         var anime= req.body;
//         var name= anime.name;
//         var kind= anime.kind;
//         var age= parseInt(anime.age);
        
//         if ((!name || !kind || !age) || (typeof age != "number")) {
//             res.status(400).send('bad request')
            
//         } else {
//             const result = await pool.query(`INSERT INTO anime (age, kind, name)
//             VALUES (${age}, '${kind}', '${name}') RETURNING * `);
//             res.status(200).send(result.rows)
//         }
//       } catch (e) {
//         console.error(e.stack)
//       }
//     }
//     postAnime();
// });
  app.get('/api/anime/:id', (req, res)=> {
        async function getAnime() {
        try {
            const result = await pool.query(`SELECT * FROM anime WHERE anime_id = ${req.params.id}`);
            console.log(result);
            if (result.rows.length !== 0) {
                res.status(200).send(result.rows);
            } else {
                res.status(404).send('anime does not exist')
            }
          } catch (e) {
            console.error(e.stack)
          }
        }
        getAnime();
    });
app.patch('/api/anime/:id', (req, res) => {
        async function patchAnime() {
            try {
                    let anime = req.body;
                    let age = anime.age || -1;
                    let kind = anime.kind || '';
                    let name = anime.name || '';
                    // NOTE: The PATCH route handler must only update the record if age is an integer, if kind is not missing, or if name is not missing.
                    if (typeof anime.age == 'number' || anime.kind || anime.name) {
                        var query = `
                        UPDATE anime SET 
                            age=COALESCE(NULLIF($1,-1), age),
                            kind=COALESCE(NULLIF($2,''), kind),
                            name=COALESCE(NULLIF($3,''), name) 
                        WHERE anime_id=${req.params.id}
                        `
                        var values = [age, kind, name]
                        const result = await pool.query(query,values)
                        console.log(result);
                        res.status(200).send(result.rows);
                    } else {
                        res.status(400).send('cannot update')
                    }
                } catch (e) {
                console.error(e.stack)
                }
        }
        patchAnime();
    })
app.delete('/api/anime/:id', (req, res) => {
            pool.query(`DELETE FROM anime WHERE anime_id = ${req.params.id}`)
            .then(result => {
                res.status(200).send("deleted");
            })
            .catch(e => console.error(e.stack))
        })




app.listen(port, () => {
    console.log(`listening on port ${port}`)
})