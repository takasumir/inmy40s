import threading
import RPi.GPIO as GPIO
from gpiozero import MCP3304
import time
import csv
from datetime import datetime
import paho.mqtt.client as mqtt
from paho.mqtt.subscribeoptions import SubscribeOptions

## Global variables
running = False
led = None
analog = None
client = None

## Global settings
GPIO.setmode(GPIO.BCM)

## Classes アナログ入力とLEDの点滅をそれぞれ別のスレッドで行う
class LEDThread(threading.Thread):
    def __init__(self):
        super().__init__()
        self.running = False

        # LED pin settings
        GPIO.setup(17, GPIO.OUT)

    def run(self):
        self.running = True
        while self.running:
            GPIO.output(17, 1)
            time.sleep(0.5)
            GPIO.output(17, 0)
            time.sleep(0.5)
        GPIO.cleanup(17)

    def stop(self):
        self.running = False


class AnalogRead(threading.Thread):
    def __init__(self, interval):
        super().__init__()
        self.running = False
        self.vref = 3.3
        self.interval = interval
        self.buff = [["time", "b0", "v0", "b1", "v1", "b2", "v2", "b3", "v3"]]
        # analog settings
        self.channel0 = MCP3304(channel=0, differential=False, device=0, max_voltage=self.vref)
        self.channel1 = MCP3304(channel=1, differential=False, device=0, max_voltage=self.vref)
        self.channel2 = MCP3304(channel=2, device=0, max_voltage=self.vref)
        self.channel3 = MCP3304(channel=3, device=0, max_voltage=self.vref)
        print("Analog read init done.")

    def run(self):
        global client
        print("Analog run")
        # print(f'{"time":^11} | {"V0":^8} | {"V1":^8} | {"V2":^8} | {"V3":^8}')
        self.running = True
        start_time = time.time()
        while self.running:
            elapsed_time = (time.time() - start_time) * 1000  # ms
            v0 = self.channel0.voltage
            v1 = self.channel1.voltage
            v2 = self.channel2.voltage
            v3 = self.channel3.voltage

            b0 = self.channel0.raw_value
            b1 = self.channel1.raw_value
            b2 = self.channel2.raw_value
            b3 = self.channel3.raw_value
            self.buff.append([elapsed_time, b0, v0, b1, v1, b2, v2, b3, v3])
            if client is not None:
                client.publish("sumic_test", f"{v0:2.2f}")
            if self.interval > 0:
                time.sleep(self.interval)

                # print(
                #    f"{elapsed_time:6.4f} | {b0:04}, {v0:1.6f} | {b1:04}, {v1:1.6f} | {b2:04}, {v2:1.6f} | {b3:04}, {v3:1.6f}"
                # )

    def stop(self):
        self.running = False
        with open(data_file_name(self.interval), "w") as f:
            writer = csv.writer(f)
            writer.writerows(self.buff)

## mqtt client
def on_connect(client, userdata, flags, rc, properties=None):
    print("Connected with result code " + str(rc))
    # client.subscribe("takasumi/elec/mcp3304")
    options = mqtt.SubscribeOptions(noLocal=True)
    client.subscribe("sumic_test", options=options)

def on_message(client, userdata, msg):
    global led
    print(msg.topic + " " + str(msg.payload))
    print(client)
    if b"led_on" in msg.payload:
        led = LEDThread()
        print("led on: " + str(led))
        led.start()
    elif b"led_off" in msg.payload:
        print("led off")
        if led is not None:
            if led.running == True:
                led.stop()
            led.join()
    elif b"start" in msg.payload:
        print("start measuring is called")
        toggle_measuring(0)
    elif b"stop" in msg.payload:
        print("stop measuring is called")
        toggle_measuring(0)
    elif b"measure" in msg.payload:
        print("measure routine start")
        measure()

## 保存するデータのファイル名を決める関数
def data_file_name(interval):
    today = datetime.now()
    y = today.year
    mo = today.month
    day = today.day
    h = today.hour
    m = today.minute
    s = today.second
    return f"data_{str(interval)}_{y}{mo:02}{day:02}{h:02}{m:02}{s:02}.csv"


## 最短から0.5秒ごとに測定ルーチン
def measure():
    for i in [0, 0.001, 0.005, 0.01, 0.05, 0.1]:
        print(f"Get analog data each {i}s")
        led = LEDThread()
        analog = AnalogRead(i)
        led.start()
        analog.start()
        time.sleep(5)
        led.stop()
        analog.stop()
        led.join()
        analog.join()

def toggle_measuring(gpio_pin):
    global running
    global led
    global analog
    if running == False:
        print("starting...")
        running = True
        led = LEDThread()
        analog = AnalogRead(0.01)  # 0.01sのタイマーを入れる
        led.start()
        analog.start()
    else:
        print("stopping...")
        led.stop()
        analog.stop()
        led.join()
        analog.join()
        running = False

def start_measuring(client):
    global running
    global led
    global analog
    print("start measuring called")
    print(client)
    if running == False:
        running = True
        led = LEDThread()
        analog = AnalogRead(0.01)  # 0.01sのタイマーを入れる
        led.start()
        analog.start()
    while True:
        print("in while loop")
        print(f"{analog.channel0.voltage:2.2f}")
        print(client)
        client.publish("sumic_test", "Hello!")
        time.sleep(0.5)

def stop_measuring():
    global running
    global led
    global analog
    if running == True:
        led.stop()
        analog.stop()
        led.join()
        analog.join()
        running = False
        
## メイン関数
if __name__ == "__main__":
    # GPIO setting
    GPIO.setup(18, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.add_event_detect(18, GPIO.FALLING, callback=toggle_measuring, bouncetime=300)

    print("MCP3304 analog data logger")
    print("resolution: 10bit")
    print("max input voltage: 3.3v")

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, protocol=mqtt.MQTTv5)
    client.on_connect = on_connect
    client.on_message = on_message
    # client.connect("raspberrypi.local", 1883)
    client.connect("broker.emqx.io", 1883)
    client.publish("sumic_test", "Hello from rp")
    client.loop_start()

    try:
        # タイマを0から0.5sまで変化させて5秒ずつデータを取る場合はコメントアウト
        # measure()
        while True:  # イベント待ちループ
            time.sleep(0.5)
            # client.loop_forever()
    except KeyboardInterrupt:
        print("Ctrl-c key pressed")
        client.loop_stop()
        GPIO.cleanup()
        raise
