const { exec } = require("child_process");
module.exports = record = (currentPath) =>{
    exec(`sh lib/recording/record.sh ${currentPath}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}