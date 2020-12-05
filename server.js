const express = require('express')
const fetch = require('node-fetch')
const PORT = 5000
let nextAvailableId = 1
const docObj = {}
const app = express()
app.use(express.json())
app.use(express.text())

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/request', (req, res) => {
	const {body} = req.body
	// initiate request to third party service
	// create unique identifier for this request
	const id = nextAvailableId++
	docObj[id] = {body, createdTimeStamp: new Date().getTime()}
	fetch('http://example.com/request', {
		method: 'POST', 
		body: JSON.stringify({body, callback: `/callback/${id}`})
	}).then(data => console.log(data))
	.catch(err => console.err(err))
	res.send(body)
})

app.post('/callback/:id', (req, res) => {
	const {id} = req.params 	
	docObj[id].status = req.body // STARTED
	docObj[id].modifiedTimeStamp = new Date().getTime()
	res.sendStatus(204)
})

app.put('/callback/:id', (req, res)=> {
	const {id} = req.params 
	const {status, detail} = req.body
	
	docObj[id].status = status
	docObj[id].detail = detail
	docObj[id].modifiedTimeStamp = new Date().getTime()

	res.sendStatus(204)
})

app.get('/status/:id', (req, res)=> {
	const {id} = req.params 
	res.json(docObj[id])
})

app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`)
})
