var fs = require('fs');
var chokidar = require('chokidar');
const WebSocket = require('ws');
const util = require('util');
var crypto = require('crypto');
var myDir = __dirname+"/../rec/chunks"
const { exec } = require("child_process");
const record = require("../lib/recording/index")

const sendVideoToMaster = (ws,video) => new Promise((resolve,reject)=>{
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
            resolve()
            console.log("video uploaded")
            busy=false;
        });
    
})
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
const _wait = (path, opts = 'utf8') =>{
    return new Promise((resolve, reject) =>{
        setTimeout(()=>{resolve()},1000)
        console.log(1)
    })
}
const sendMsgToMaster = async ()=>{
    let videos = await readFileInDir(myDir)
    // console.log(videos)
    let locked_video = await readFile(__dirname+'/video-recorded.lock.txt')
    uploadingQueue = videos.filter((v)=>{return v !== "" && v !== locked_video})
    console.log(uploadingQueue,locked_video)
    // console.log(users)
    for(let i=0;i<uploadingQueue.length;i++){
        if(users){
            // await _wait()
            await sendVideoToMaster(users,uploadingQueue[i])
            console.log(uploadingQueue[i])
        }
        
    }
}
const init = async () =>{
    try{
        record()
        var watcher = chokidar.watch(__dirname+'/video-recorded.lock.txt', {ignored: /^\./, persistent: true});
        watcher
        .on('add', sendMsgToMaster)
        .on('change',sendMsgToMaster)
        
    }catch(err){
        console.log(err)
    }
}
init()
// sendMsgToMaster()