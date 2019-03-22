import urllib
from pathlib import Path
import sys
import re

def outputMatches(pattern):
    file = open("out.txt", "r") 
    for line in file:
        if re.search(pattern,line.strip()):
            return True
    return False

def convertCodeToString(code):
    output = code
    forReplacment = {"%20" : " ", "%23" : "#", "%26" : "&", "%2C" : ","}
    for key in forReplacment.keys():
        replacement = forReplacment.get(key)
        while key in output:
            output = output.replace(key, replacement)
    return output.strip()
    

def checkQuestion(number, code, vars):
    if(number == 1):
        if outputMatches(".*\w+.*"):
            return True
        else:
            return "Did you **print** a word?"
    elif(number == 2):
        if isinstance(vars.get('name'), str):
            return True
        else:
            return "Did you create a string called name?"
    elif(number == 3):
        if outputMatches(vars.get('name')):
            return True
        else:
            return "Did you print the variable name?"
    elif(number == 4):
        if vars.get('x') == 5 and outputMatches("5"):
            return True
        else:
            return "Did you set x = 5 and then print the variable x?"
    elif(number == 5):
        if convertCodeToString(code)[0] == "#":
            return True
        else:
            return "Did create a comment using #?"
    elif(number == 6):
        if isinstance(vars.get('name'), str) and outputMatches(vars.get('name')):
            return True
        else:
            return "Did correct the variable name and fix the print call?"
    elif(number == 7):
        if vars.get('x') == 10 and outputMatches("10"):
            return True
        else:
            return "Did you set x to 5 and double it with x = x*2? Also make sure you print"