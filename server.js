const jsonServer = require('json-server')
const fs = require('fs')
const path = require('path')
const formidable = require('formidable')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Usar os middlewares padrão
server.use(middlewares)

// Middleware customizado para manipular FormData no endpoint "/sendData"
server.post('/sendData', (req, res) => {
  const form = new formidable.IncomingForm()

  // Parse do FormData
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao processar o FormData' })
      return
    }

    // Conversão de FormData para JSON
    const newData = { ...fields, id: Date.now() } // Gerar ID único

    // Caminho para o arquivo db.json
    const dbFilePath = path.join(__dirname, 'db.json')

    // Leitura do arquivo db.json
    fs.readFile(dbFilePath, (err, data) => {
      if (err) {
        res.status(500).json({ error: 'Erro ao ler o arquivo db.json' })
        return
      }

      const jsonData = JSON.parse(data)

      // Se o campo "sendData" não existir, inicialize-o como um array
      if (!jsonData.sendData) {
        jsonData.sendData = []
      }

      // Adiciona o novo dado ao array sendData
      jsonData.sendData.push(newData)

      // Escreve os dados atualizados no arquivo db.json sem apagar o resto do conteúdo
      fs.writeFile(dbFilePath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          res.status(500).json({ error: 'Erro ao escrever no db.json' })
          return
        }

        res.status(200).json({ message: 'Dados enviados com sucesso', newData })
      })
    })
  })
})

// Configurar rotas padrão
server.use(router)

// Iniciar o servidor
server.listen(3000, () => {
  console.log('JSON Server is running')
})

module.exports = server
