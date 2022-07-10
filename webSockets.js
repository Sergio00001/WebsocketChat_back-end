const ws = require('ws')

const wss = new ws.Server({
    port: 5000
}, () => { console.log('server started on port 5000'); })


let users = []

wss.on('connection', function connection(ws) {

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