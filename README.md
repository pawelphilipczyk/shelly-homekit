# Shelly Homekit
Dashboard for Shelly Homekit enabled devices in local network

## Why
The main purpouse of the app is to lookup local network Shelly devices that are running [Shelly Homekit](https://github.com/mongoose-os-apps/shelly-homekit) firmware.

The problem with Shelly devices is that it's not easy to know which IP addresses on your network are they running under. 
Even if you have done the manual work of finding this out it's not stable. 
The list of IP addresses can change every now and then making you do the excercise again. 

## What
When app launches it first checks if you already have a list of devices stored in your browsers local storage. 
If not then it runs a scan of all IP addresses in the range of 192.168.88.1-255 and then stores the list in local storage so it does not have to perform the scanning each time. 

## Development
The app is running on [Remix](https://remix.run) framework. 
Initial goal is not about how it looks so the styling is minimalistic at best.  
