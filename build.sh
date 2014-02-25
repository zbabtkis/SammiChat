#!/bin/bash

grunt build
phonegap build ios
open platforms/ios/SammiChat.xcodeproj 
