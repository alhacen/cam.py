var fs = require('fs');
var chokidar = require('chokidar');
const WebSocket = require('ws');
const util = require('util');
var crypto = require('crypto');
var myDir = "../rec/chunks"

const sendVideoToMaster = (ws,video) =>{  
        busy=true;
        var md5sum = crypto.createHash('md5');
        console.log(`${myDir}/${video}`)
        let readStream = fs.createReadStream(`${myDir}/${video}`);
        readStream.on('data', function (chunk) {
            ws.send(chunk,{binary:true})
            md5sum.update(chunk);
        })
        readStream.on('end',()=>{
            var chucksum = md5sum.digest('hex');
            ws.send(JSON.stringify({
                type:"upload",
                fileName:video,
                status:"done",
                chucksum:chucksum
            }))
            console.log("video uploaded")
            busy=false;
        });
    
}
const wss = new WebSocket.Server({ port: 8080 });
users=null
busy=false;
wss.on('connection', function connection(ws) {
    users=ws;
    ws.on('message', function incoming(message) {
        try{
            message=JSON.parse(message)
            if(!busy){
                if(message.type === "sendVideo"){
                    sendVideoToMaster(ws,message.videoName)
                }
                if(message.type === "fileReceivedAck"){
                    // removeFileFromQueue
                    if(msg.status === "done"){
                        fs.unlink(`${myDir}/${message.videoName}`);//todo: validate ${message.videoName} xD
                    }else{
                        
                    }
                }
            }
        }catch(err){
            console.log(err)
        }
    });
});

const readFile = (path, opts = 'utf8') =>
    new Promise((resolve, reject) => {
    fs.readFile(path, opts, (err, data) => {
        if (err) reject(err)
        else resolve(data)
    })
})
const readFileInDir = (path) =>
    new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
        if (err) reject(err)
        else resolve(files)
    });
})

const sendMsgToMaster = async ()=>{
    let videos = await readFileInDir(myDir)
    // console.log(videos)
    let locked_video = await readFile('video-recorded.lock.txt')
    uploadingQueue = videos.filter((v)=>{return v!=="" && v!==locked_video})
    console.log(uploadingQueue,locked_video)
    uploadingQueue.map((video)=>{
        if(users)
            sendVideoToMaster(users,video)
    })
}
const fun = async () =>{
    try{
        var watcher = chokidar.watch('./video-recorded.lock.txt', {ignored: /^\./, persistent: true});
        watcher
        .on('add', sendMsgToMaster)
        .on('change',sendMsgToMaster)
        
    }catch(err){
        console.log(err)
    }
}
fun()