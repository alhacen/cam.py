 	#------------ Python ------------
#pkill mjpg_streamer
from subprocess import call 
from multiprocessing import Pool
import atexit

#from multiprocessing import Pool
from os import getpid
def atexit_abort():
    print("cleaning up")
    command = "sudo pkill mjpg_streamer"
    call(command, shell=True)


def streamx(i):
    print("streaming")
    command ="touch x"
    command = 'cd mjpg-streamer/mjpg-streamer-experimental && ./mjpg_streamer -o  "output_http.so " -i "input_raspicam.so"   >/dev/null 2>&1 &'
    call(command, shell=True)

def record(i):
#    command = 'cd mjpg-streamer/mjpg-streamer-experimental"'
#    call(command, shell=True)

    print("recording")
    command = 'cd mjpg-streamer/mjpg-streamer-experimental/x && touch x&& ffmpeg -y -f  mjpeg -r 5 -t 5 -i "http://localhost:8080/?action=stream" -r 5 ./video.avi'
#    command="touch x"
    call(command, shell=True)

atexit.register(atexit_abort)
pool = Pool()
pool.map(streamx, [1])
pool1 = Pool()
pool1.map(record, [1])
atexit.unregister(atexit_abort)
atexit_abort()
'''
if __name__ == '__main__':
    with Pool() as pool:
        result = pool.map(streamx, [1])
        print(result)
    with Pool() as pool1:
        result = pool1.map(record, [1])
        print(result)

'''
