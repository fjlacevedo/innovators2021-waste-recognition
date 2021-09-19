#----------------------------------------------------------------------------
# Created By  : Francisco Javier Lopez Acevedo (fjlacevedo)
# Created Date: 08/09/2021
# version ='1.0'
# ---------------------------------------------------------------------------

import network, socket, time, sensor, image, lcd, sys
import KPU as kpu

from Maix import GPIO
from fpioa_manager import fm, board_info
from machine import UART
import ubinascii
import math

# Init the LCD screen and clear the camera
# clock = time.clock()
lcd.init()
sensor.reset()

# Try to import the library for I2C bus
try:
    from pmu import axp192
    pmu = axp192()
    pmu.enablePMICSleepMode(True)
except:
    pass

# Try to add a init splash screen
try:
    img = image.Image("/sd/startup.jpg")
    lcd.display(img)
except:
    lcd.draw_string(lcd.width()//2-100,lcd.height()//2-4, "Error: Cannot find start.jpg", lcd.WHITE, lcd.RED)

# Set the labels for recognition (yhree classes were trained as required)
labels=["Clear","Alarm","Alarm"]

# Set the size of the video, flip the feed and set the FPS
sensor.set_pixformat(sensor.RGB565) # KPU doesn't support GrayScale
sensor.set_framesize(sensor.QVGA)
sensor.set_vflip(True)
sensor.set_hmirror(True)
sensor.set_windowing((224, 224)) # This is mandatory for KPU analysis
sensor.run(1)

# Clear the LCD to remove the image
lcd.clear()

# Set the UART gpios and enable it
fm.register(35, fm.fpioa.UART2_TX, force=True)
fm.register(34, fm.fpioa.UART2_RX, force=True)

uartPort = UART(UART.UART2, 115200,8,0,0, timeout=0, read_buf_len= 1400)

# Enable the Buttons
fm.register(board_info.BUTTON_A, fm.fpioa.GPIO1)
fm.register(board_info.BUTTON_B, fm.fpioa.GPIO2)

buttonA = GPIO(GPIO.GPIO1, GPIO.IN, GPIO.PULL_UP)
buttonB = GPIO(GPIO.GPIO2, GPIO.IN, GPIO.PULL_UP)

# Set a boolean to control when to load the task
initiated = False

# Set a variable to store the task. This will be reused in every photo
task = None

# Now, show the video feed on the screen
while(True):

    # Create the task until a photo is taken
    if not initiated:
		# Load the test model
        task = kpu.load("/sd/5ea9782f7c969ac7_mbnet10_quant.kmodel")
        initiated = True

    # Take a photo
    img = sensor.snapshot()
    
    # Perform the screening analysis
    fmap = kpu.forward(task, img)
    plist = fmap[:]
    pmax = max(plist)
    max_index = plist.index(pmax)
    a = lcd.display(img)
    
    # Set a global min recognition value
    recognitionValue = 0.80
    
    # Check the value of the detection, and if is higher than a 80%,
    # set a label on the screen with the info
    if pmax > recognitionValue:
        if labels[max_index].strip() == 'Alarm':
            lcd.draw_string(130, 10, "Status:%s"%(labels[max_index].strip()), lcd.RED)
        else:
            lcd.draw_string(130, 10, "Status:%s"%(labels[max_index].strip()), lcd.GREEN)
        
    # Await for button A to be pushed
    if buttonA.value() == 0:
    
        # Kill the task. This is MANDATORY as the M5StickV doesn't have
        # enough memory to maintain the task AND compress the snapshot.
        # So killing the task and removing the variable will free up enough
        # memory for allow the program to runs fine.
        a = kpu.deinit(task)
        del task
        
        # Change the boolean, so when this code ends, will create again
        # the task
        initiated = False
    
        # Show a message to the user
        lcd.draw_string(20, 20, "Photo taken", lcd.WHITE, lcd.BLACK)
        
        # Compress the image to make it easier to send
        imgBuffer = img
        imgBuffer.compress(quality=50)

        # Transform the image to bytes. I think this is not necessary,
        # but sometimes problems comes if I don't force that...
        imgBytes = bytes(img)

        # Set a variable with the alarm status. By default will be no
        # alarm
        alarm = False
    
        # Only if the recognition value is over the limit, check if the
        # is an alarm. This is not the best way to do that, but for the
        # moment if enough.
        # TODO: check what happens when the value is < recognitionValue
        if pmax > recognitionValue and labels[max_index] == 'Alarm':
            alarm = True

        # Send firtsly the alarm value, and then the array of bytes
        uartPort.write(str(alarm) + "\n")
        uartPort.write(imgBytes)

        # Wait a moment
        time.sleep(1.0)
   
        # Tell the user that the image has been sended
        lcd.draw_string(20, 20, "Photo sended", lcd.WHITE, lcd.RED)

        # Wait one more time, and finish
        time.sleep(1.0)

        # Clear the screen
        lcd.clear()

        # Clear all as possible as the M5StickV will raise a MemoryError
        # when try to rebuild the KPU task.
        del imgBuffer, imgBytes, alarm


# UART Ending
uartPort.deinit()
del uartPort