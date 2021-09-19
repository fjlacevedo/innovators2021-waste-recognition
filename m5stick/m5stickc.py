#----------------------------------------------------------------------------
# Created By  : Francisco Javier Lopez Acevedo (fjlacevedo)
# Created Date: 08/09/2021
# version ='1.0'
# ---------------------------------------------------------------------------


from m5stack import *
from m5ui import *
from uiflow import *
from m5mqtt import M5mqtt

import wifiCfg
import espnow
import json
import base64


############## 
# GLOBAL INFO
##############

# Styles
backgroundColor = 0x111111
backgroundImage = "res/logo_inn2021_v1.jpg"

# WiFi
ssid = "ssid_name"
password = "ssid_password"

# Labels
labelInfo = M5TextBox(30, 50, "", lcd.FONT_Default, 0xFFFFFF, rotate=90)
labelId = M5TextBox(70, 10, "", lcd.FONT_Default, 0xFFFFFF, rotate=90)
labelMqtt = M5TextBox(40, 10, "", lcd.FONT_Default, 0xFFFFFF, rotate=90)
labelStatus = M5TextBox(20, 10, "", lcd.FONT_Default, 0xFFFFFF, rotate=90)

# Business Things
mac = None
idClientControl = None
idClientBusiness = None
businessTopicDevice = None
topicDevice = "business/TEAM_8/ENT/device/"
topicServer = "business/TEAM_8/ENT/server"
deviceToken = "KqXnj8iO"

# MQTT
m5mqtt = None
server = "iothub02.onesaitplatform.com"
port = 8883
timeout = 30
ssl = True

# UART
uart = machine.UART(1, tx=33, rx=32)
uart.init(115200, bits=8, parity=None, stop=0, rxbuf=8000)

# Dumpster status
alarm = False


############## 
# METHODS
##############

# This will create a fancy loading effect (useless, but pretty)
def introEffect():
  # Add the loading text
  labelInfo.setText("Loading")
  wait(0.2)
  labelInfo.setText("Loading.")
  wait(0.2)
  labelInfo.setText("Loading..")
  wait(0.2)
  labelInfo.setText("Loading...")
  wait(0.2)
  labelInfo.setText("Loading")
  wait(0.2)
  labelInfo.setText("Loading.")
  wait(0.2)
  labelInfo.setText("Loading..")
  wait(0.2)
  labelInfo.setText("Loading...")
  

# This function will handle the A button status
def callFromA():
  global alarm
  alarm = True
  sendDataToCloudLab()
  alarm = None
  

# This another function will handle the B button status
def callFromB():
  global alarm
  alarm = False
  sendDataToCloudLab()
  alarm = None
  

# This function will be awaiting for an UART incoming
def awaitUart():

  while True:
    
    # When some data comes from the port, start working
    if uart.any():
      
      # Update the status msg
      labelStatus.setText('Status: Receiving')
      
      wait(1)
      
      # The first incoming will be the alarm status, so get it, decode it,
      # store it and remove the tailing
      isAlarm = uart.readline().decode("utf-8").rstrip()
      
      alarm = isAlarm
      
      # Update again the status msg
      labelStatus.setText('Status: ' + alarm)
      
      wait(1)
      
      # The rest of the data will be the image as bytes, so store it and
      # also decode it to base64 ()
      imgBase64 = base64.b64encode(uart.read())
      
      # Update the status msg one more time
      labelStatus.setText('Status: Sending...')
      
      wait(1)
      
      # Send the alarm status and the snapshot to the Onesait Platform
      sendDataToCloudLab(alarm, imgBase64)
      
    else:
      labelStatus.setText('Status: awaiting')
      
    wait_ms(10) 
      

# Handle the comm with CloudLab
def sendDataToCloudLab(isAlarm, image):
  
  global alarm, m5mqtt, topicServer
  
  # Update the label
  labelStatus.setText('Status: packing...')
  
  # Switch on the LED to see a visual signal
  M5Led.on()
  
  wait(1)
  
  # Set the data object to send
  data = {
    "deviceId": idClientControl,
    "dumpsterId": "IG_03_050",
    "alarm": isAlarm,
    "image": image,
  }
  
  # dumpsterId is fixed for the moment, as no GPS unit is available for
  # location filter. If the future, getting the position will allow to
  # get the nearest dumpster and retrieve the ID dynamically.

  # Update the status msg
  labelStatus.setText('Status: sending...')
  
  # Send the data payload to the DataFlow on the Onesait Platform
  m5mqtt.publish(str(topicServer),str((json.dumps(data))))
  
  # Switch off the LED to visually indicate the end of the communication
  M5Led.off()
  
  # Update again the label
  labelStatus.setText('Status: sended')
  
  wait(1)
  
  # Update the label to default text
  labelStatus.setText('Status: awaiting')


############## 
# PROGRAM
##############

# Set a init background color
setScreenColor(0x111111)

# Set loading image
lcd.image(0, 0, "res/logo_inn2021_v1.jpg")

# Force the LED switch off
M5Led.off()

wait(0.5)

# Launch the intro screen
introEffect()

# Init WiFi connection
wifiCfg.wlan_sta.active(True)
wifiCfg.doConnect(ssid, password)

# If the M5StickC wasn't able to connect to the WiFi net, try again until connect
while (not wifiCfg.wlan_sta.isconnected()):
    wifiCfg.doConnect(ssid, password_wifi)
    
# Init the EspNow (will be useful later to get the MAC)
espnow.init()

# Update the info label to show that the connection to the WiFi was succeeded
labelInfo.setText("WiFi connection OK")
labelInfo.setPosition(30,15)

wait(1)

# Get the MAC address
mac = str((espnow.get_mac_addr())).replace(':', '').upper()

# Set the ID client through the MAC address
idClientControl = mac

# Set the id client business using the MAC address
idClientBusiness = "b_" + idClientControl

# Generate the business topic device ID
businessTopicDevice = topicDevice + idClientBusiness

# Set the MQTT connection
m5mqtt = M5mqtt(str(idClientBusiness), server, port, str(idClientControl), deviceToken, timeout, ssl = ssl)

# Suscribe to the Cloud to Device MQTT service
# WIP: m5mqtt.subscribe(business_topic_s, methodC2D)

# Start the connection to the MQTT protocol
m5mqtt.start()

# Clear the LCD screen
lcd.clear()

# Set info data on screen
labelId.setText(idClientControl)
separator = M5Line(M5Line.PLINE, 50, 10, 50, 150, 0xFFFFFF)
labelMqtt.setText('MQTT: connected')
labelStatus.setText('Status: awaiting')

# Set an event handler to the button A for a positive detection, and B for
# a negative detection. This'll be used for demo tricks
btnA.wasPressed(callFromA)
btnB.wasPressed(callFromB)

awaitUart()