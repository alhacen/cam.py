var crypto = require('crypto');
var md5sum = crypto.createHash('md5');
s = new WebSocket("ws://localhost:8080")
videoBlobs={}
tmpBlobs=[]
currentFileName=null
s.onmessage = function fun(msg){
    console.log(msg)
    if(msg.data instanceof Blob){
        tmpBlobs.push(msg.data)
        md5sum.update(msg.data);
    }else{
        msg=JSON.parse(msg.data)
        if(msg.type==="upload"){
            if(msg.status==="done"){
                videoBlobs[currentFileName]=tmpBlobs
                tmpBlobs=[]
                let videoBlob = new Blob([...videoBlobs[currentFileName]],{type:"video/octet-stream"});
                url = webkitURL.createObjectURL(videoBlob);
                window.open(url);
                delete videoBlobs[currentFileName]
            }
        }

    }
    
}


