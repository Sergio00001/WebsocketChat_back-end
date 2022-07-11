const ws = require('ws')

const PORT = Number(process.env.PORT || 5000)

const wss = new ws.Server({ port: PORT }, () => {
    console.log(`server started: ${PORT}`);
})

// create store for users online
let users = []

// working with connected users
wss.on('connection', function connection(ws) {
    console.log('client connected');
    ws.on('message', function (msg) {
        msg = JSON.parse(msg)
        switch (msg.event) {
            case 'message':
                connectionHandler(ws, msg)
                break;
            case 'connection':
                connectionHandler(ws, msg)
                break;
            case 'close':
                connectionHandler(ws, msg)
                ws.close()
                break;
        }
    })
})

// sending messages to all connected users at once
function connectionHandler(ws, msg) {
    ws.id = msg.chatName
    broadCastMessage(ws, msg)
}

function broadCastMessage(ws, msg) {
    wss.clients.forEach(client => {
        if (client.id === msg.chatName) {
            client.send(JSON.stringify(msg))
            if (msg.event === 'close') {
                let disconected = msg
                users = users.filter(user => user.userName !== disconected.userName)
            } else {
                users.push(msg)
                users = users.filter(user => client.id === user.chatName)
                users = [...new Set(users)]
            }
            client.send(JSON.stringify(users))
        }
    })
}