myPath="rec/chunks"
# files=($(ls $myPath))

while [ 1 ]
do
    fileName=$(date "+%Y.%m.%d-%H.%M.%S")".h264"
    fullFileName="$myPath/chunks_$current_time"
    #raspivid -t 30000 -w 640 -h 480 -rot 90 -fps 25 -b 1200000 -$
    echo $fileName > 'src/video-recorded.lock.txt'
    raspivid -t 18000 -w 640 -h 480 -rot 90 -fps 25 -b 1200000 -p$
    echo "" > 'src/video-recorded.lock.txt'
    echo "$fileName, recorded"
done
