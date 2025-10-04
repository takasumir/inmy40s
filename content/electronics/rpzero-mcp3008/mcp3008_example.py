import threading
import RPi.GPIO as GPIO
from gpiozero import MCP3008
import time
import csv
from datetime import datetime

GPIO.setmode(GPIO.BCM)


## アナログ入力とLEDの点滅をそれぞれ別のスレッドで行う
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
        self.vref = 3.30
        self.interval = interval
        # analog settings
        self.channel0 = MCP3008(channel=0, device=0, max_voltage=self.vref)
        self.channel1 = MCP3008(channel=1, device=0, max_voltage=self.vref)
        self.channel2 = MCP3008(channel=2, device=0, max_voltage=self.vref)
        self.channel3 = MCP3008(channel=3, device=0, max_voltage=self.vref)
        print("Analog read init done.")

    def run(self):
        print("Analog run")
        print(f'{"time":^11} | {"V0":^8} | {"V1":^8} | {"V2":^8} | {"V3":^8}')
        self.running = True
        with open(data_file_name(self.interval), "w") as f:
            writer = csv.writer(f)
            start_time = time.time()
            writer.writerow(["time", "b0", "v0", "b1", "v1", "b2", "v2", "b3", "v3"])
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

                print(
                    f"{elapsed_time:6.4f} | {b0:04}, {v0:1.6f} | {b1:04}, {v1:1.6f} | {b2:04}, {v2:1.6f} | {b3:04}, {v3:1.6f}"
                )
                writer.writerow([elapsed_time, b0, v0, b1, v1, b2, v2, b3, v3])
                time.sleep(self.interval)

    def stop(self):
        self.running = False


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
    for i in [0, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5]:
        print(f"Get analog data each {i}ms")
        led = LEDThread()
        analog = AnalogRead(i)
        led.start()
        analog.start()
        time.sleep(5)
        led.stop()
        analog.stop()
        led.join()
        analog.join()


## ボタンを押すと測定開始/終了する
running = False
led = None
analog = none


def toggle_measuring(gpio_pin):
    global running
    global led
    global analog
    if running == False:
        running = True
        led = LEDThread()
        analog = AnalogRead(0.01)  # 0.01msのタイマーを入れる
        led.start()
        analog.start()
    else:
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

    print("MCP3008 analog data logger")
    print("resolution: 10bit")
    print("max input voltage: 3.30v")

    try:
        while True:
            sleep(1)
        # ボタンを押してスタート、ストップする場合はこのコメントを外す
        # measure()
    except KeyboardInterrupt:
        print("Ctrl-c key pressed")
        raise
