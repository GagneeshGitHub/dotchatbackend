const express = require("express");
const app = express();

const port = process.env.PORT || 8081;
const cors = require('cors')
app.use(cors())
app.use(express.json())
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})


const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});


let arrIp = {}
const regUsers = ['gagneeshvimal','gagneeshvimal101','pooja222','poojavimal10']
const userPass = {
    'gagneeshvimal': "gagneeshvimal",
    'gagneeshvimal101': "gagneeshvimal101",
    'pooja222': "pooja222",
    'poojavimal10': "poojavimal10"
}


const userSocket = {}


app.get("/",(req,res)=>{
    setTimeout(()=>{
        res.redirect("http://localhost:3000/");
        res.end();
    },4000)
})

app.get("/logoutme",(req,res)=>{
    arrIp = Object.keys(arrIp).filter(key=>key!==req.ip)
    console.log("We are inside the logoutme uri")
    res.end()
})

app.post("/login",(req,res)=>{
    console.log("The login is called")
    console.log(".......  ",req.body);
    const username = req.body.username;
    const password = req.body.password;

    if(!regUsers.includes(username)){
        console.log("Username does not exist");
        res.send({loginSuccess: false})
    } else if (!checkPassword(username, password)) {
        console.log("Password does not exist for the username, wrong password")
        res.send({loginSuccess: false})
    } else {
        console.log("Username and password are correct")
        res.send({loginSuccess: true})
        saveUsernmaeIp(req.ip,username)
    }
    res.end();
})

app.get("/checklogin",(req,res)=>{
    const ipAddress = req.socket.remoteAddress;
    if(ipAddress in arrIp){
        res.send({loggedin: true, username: getUsername(req.ip)})
    } else {
        res.send({loggedin: false})
    }
    res.end();
})

app.get("/getContactList",(req,res)=>{
    const ipAddress = req.socket.remoteAddress
    if(ipAddress in arrIp){
        const username = getUsername(ipAddress)
        let otherUsers = []
        regUsers.forEach((value)=>{
            if(value===username){
                
            } else {
                otherUsers.push(value)
            }
        })
        console.log("List of contacts are: ",otherUsers)
        res.send(otherUsers)
        res.end()
    } else {
        res.send("You are not logged in")
    }
})


// Handling socket
io.on('connection',(socket)=>{
    console.log("Socket is connected successfully")
    saveUserSocket(socket)
    socket.on("sendMessage",(arg)=>{
        // socket.emit(arg.otherUser,{ message: arg.message})
        if(arg.otherUser in userSocket){
        io.to(userSocket[arg.otherUser]).emit(arg.otherUser,{username:getUsername(socket.handshake.address), message: arg.message})
        } else {
            console.log("Username doesn't exist yet");
        }
}
    )
})


server.listen(port,()=>{
    console.log("Server listening on the port number: ",port);
})

// Other functions for the server
function checkPassword(username, password){
    if(userPass[username]===password){
        return true;
    }
    return false
}

function saveUsernmaeIp(ip,username){
    arrIp[ip] = username;
}

function saveUserSocket(socket){
    let username = arrIp[socket.handshake.address]
    if(username!==undefined){   
    userSocket[username] = socket.id;
    }
}

function getUsername(ip){
    return arrIp[ip];
}