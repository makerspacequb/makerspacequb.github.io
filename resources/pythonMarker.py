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

def debugOutput():
    file = open("out.txt", "r") 
    text = ""
    for line in file:
        text += line.strip() +"|"
    return text

def outputEmpty():
    file = open("out.txt", "r") 
    for line in file:
        if(len(line)) > 0:
            return False
    return True

def convertCodeToString(code):
    output = code
    forReplacment = {"%20" : " ", "%23" : "#", "%26" : "&", "%2C" : ",", "%3D" : "=",
                    "%0A": "\n", "%3A": ":", "%28": "(", "%29": ")", "%22" : "\"", "%3E": ">"} 
    for key in forReplacment.keys():
        replacement = forReplacment.get(key)
        while key in output:
            output = output.replace(key, replacement)
    return output.strip()

def checkQuestion(number, code, vars):
    code = convertCodeToString(code)
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
        elif not vars.get('x'):
            return "Did you create a variable x and set x = 5?"
        elif not outputMatches("5"):
            return "Did you print the variable x?"
    elif(number == 5):
        if code[0] == "#":
            return True
        else:
            return "Did you create a comment using #?"
    elif(number == 6):
        if isinstance(vars.get('name'), str) and outputMatches(vars.get('name')):
            return True
        elif not isinstance(vars.get('name'), str):
            return "Did you correct the variable name?"
        elif not outputMatches(vars.get('name')):
            return "Did you fix the print call?"
    elif(number == 7):
        if vars.get('x') == 10 and outputMatches("10") and "*" in code:
            return True
        elif vars.get('x') != 10:
            return "Did you set x to 5, then multiply by 2?"
        elif not outputMatches("10"):
            return "Did you print x?"
        elif not "*" in code:
            return "Did you use the '*' symbol when multiplying?"
    elif(number == 8):
        if vars.get('b') == vars.get('a')/2 and vars.get('c') == vars.get('a')+2 and vars.get('d') == vars.get('a')-2:
            return True
        elif vars.get('b') != vars.get('a')/2:
            return "Did you create a variable b that is a/2?"
        elif vars.get('c') != vars.get('a')+2:
            return "Did you create a variable c that is a+2?"
        elif vars.get('d') != vars.get('a')-2:
            return "Did you create a variable d that is a-2?"
    elif(number == 9):
        if vars.get('a') == 1 and "7%2" in code:
            return True
        elif vars.get('a') != 1:
            return "Did you create a variable a to 7 % 2?"
        elif "7%2" not in code:
            return "Have you set a to 7 % 2?"
    elif(number == 10):
        if isinstance(vars.get('name'), str) and outputMatches("Hello "+vars.get('name')):
            return True
        elif not isinstance(vars.get('name'), str):
            return "Did you create a variable called name that is a string?"
        elif not outputMatches("Hello "+vars.get('name')):
            return "Did you print 'Hello ' + name?"
    elif(number == 11):
        if isinstance(vars.get('donaldIsACat'), bool) and isinstance(vars.get('donaldIsADuck'), bool) and not vars.get('donaldIsACat') and vars.get('donaldIsADuck'):
            return True
        elif not isinstance(vars.get('donaldIsACat'), bool):
            return "Did you create a boolean donaldIsACat?"
        elif not isinstance(vars.get('donaldIsADuck'), bool):
            return "Did you create a boolean donaldIsADuck?"
        else:
            return "Is donaldIsACat false and donaldIsADuck true?"
    elif(number == 12):
        if isinstance(vars.get('y'),bool) and isinstance(vars.get('z'), bool) and vars.get('y') and not vars.get('z') and outputMatches("True") and outputMatches("False"):
            return True
        elif not isinstance(vars.get('y'),bool) or not isinstance(vars.get('z'), bool):
            return "Did you create y and z with comparisons?"
        elif not vars.get('y') or vars.get('z'):
            return "Did you create variable y and z?"
        elif not outputMatches("True") or not outputMatches("False"):
            return "Did you print y and z?"
    elif(number == 13):
        if isinstance(vars.get('sayHello'), bool) and vars.get('sayHello') and "if sayHello:".strip() in code and outputMatches("Hello"):
            return True
        elif not isinstance(vars.get('sayHello'), bool):
            return "Did you create sayHello comparison that is set to True?"
        elif not vars.get('sayHello'):
            return "Did you create variable sayHello?"
        elif "if sayHello:".strip() not in code:
            return "Did you create an if statement checking sayHello?"
        elif not outputMatches("Hello"):
            return "Did you print Hello?"
    elif(number == 14):
        if isinstance(vars.get('sayHello'), bool) and not vars.get('sayHello') and "if sayHello:".strip() in code and outputEmpty():
            return True
        elif not isinstance(vars.get('sayHello'), bool):
            return "Did you create sayHello comparison that is set to False?"
        elif vars.get('sayHello'):
            return "Did you create variable sayHello?"
        elif "if sayHello:".strip() not in code:
            return "Did you create an if statement checking sayHello?"
        elif not outputEmpty:
            return "Did you not print Hello?"+outputEmpty()
    elif(number == 15):
        if isinstance(vars.get('sayHello'), bool) and not vars.get('sayHello') and "if sayHello:".strip() in code and "else:".strip() in code and outputMatches("Goodbye"):
            return True
        elif not isinstance(vars.get('sayHello'), bool):
            return "Did you create sayHello comparison that is set to False?"
        elif vars.get('sayHello'):
            return "Did you create variable sayHello?"
        elif "if sayHello:".strip() not in code:
            return "Did you create an if statement checking sayHello?"
        elif "else:".strip() not in code:
            return "Did you create an else?"
        elif not outputMatches("Goodbye"):
            return "Did you print 'Goodbye'?"
    elif(number == 16):
        if isinstance(vars.get('sayHello'), bool) and not vars.get('sayHello') and isinstance(vars.get('askQuestion'), bool) and  vars.get('askQuestion') and "if sayHello:".strip() in code and "elif askQuestion:".strip() in code and "else:".strip() in code and outputMatches("How are you?"):
            return True
        elif not isinstance(vars.get('sayHello'), bool):
            return "Did you create sayHello comparison that is set to False?"
        elif vars.get('sayHello'):
            return "Did you create variable sayHello?"
        elif not isinstance(vars.get('askQuestion'), bool):
            return "Did you create askQuestion comparison that is set to False?"
        elif not vars.get('askQuestion'):
            return "Did you create variable askQuestion?"
        elif "if sayHello:".strip() not in code:
            return "Did you create an if statement checking sayHello?"
        elif "elif askQuestion:".strip() not in code:
            return "Did you create and elif statement checking askQuestion?"
        elif "else:".strip() not in code:
            return "Did you create an else?"
        elif not outputMatches("How are you?"):
            return "Did you print 'How are you?'?"
    elif(number == 17):
        if isinstance(vars.get('x'), bool) and vars.get('x') and isinstance(vars.get('y'), bool) and not vars.get('y') and isinstance(vars.get('z'), bool) and vars.get('z') and outputMatches("True") and outputMatches("False") and outputMatches("True"):
            return True
        elif not isinstance(vars.get('x'), bool) or not isinstance(vars.get('y'), bool) or not isinstance(vars.get('z'), bool):
            return "Did you create x,y,z comparisons?"
        elif not vars.get('x') or vars.get('y') or not vars.get('z'):
            return "Did you create x,y,z variables?"
        elif not outputMatches("True") and not outputMatches("False") and not outputMatches("True"):
            return "Did you print x,y,z?"
    elif(number == 18):
        if isinstance(vars.get('x'), bool) and vars.get('x') and isinstance(vars.get('z'), bool) and vars.get('z') and "if x and z:".strip() in code and "if not z:".strip() in code and outputMatches("a"):
            return True
        elif not isinstance(vars.get('x'), bool) or not isinstance(vars.get('z'), bool):
            return "Did you create x,z comparisons from the last question?"
        elif not vars.get('x') or not vars.get('z'):
            return "Did you create x,z variables?"
        elif "if x and z:".strip() not in code:
            return "Did you create an if statement checking x and z are True?"
        elif "if not z:".strip() not in code:
            return "Did you create an if statement checking z is False?"
        elif not outputMatches("a"):
            return "Did you print 'a'?"
    elif(number == 19):
        if vars.get('q') == 5 and "if q > 3:".strip() in code and outputMatches("abc"):
            return True
        elif vars.get('q') != 5:
            return "Did you create a variable q which is set to 5?"
        elif "if q > 3:".strip() not in code:
            return "Did you create an if statement checking that q > 3?" + code
        elif not outputMatches("abc"):
            return "Did you print 'abc'?"
    elif(number == 20):
        if "input()".strip() in code:
            return True
        else:
            return "Does your code equal input?"
    elif(number == 21):
        if vars.get('x') == input():
            return True
        else:
            return "Have you created variable x and x is equal to input?"
    elif(number == 22):
        if "x = \"200\"".strip() in code and vars.get('x') == 200 and "print(x*2)".strip() in code and outputMatches(str(vars.get('x')*2)):
            return True
        elif "x = \"200\"".strip() not in code:
            return "Did you set x to equal the string of \"200\"?"
        elif vars.get('x') != 200:
            return "Did you set x to equal 200 as an int?"
        elif "print(x*2)".strip() not in code:
            return "Did you include a print statement of x*2?"
        elif not outputMatches(str(vars.get('x')*2)):
            return "Did you print x*2?"
    elif(number == 23):
        if vars.get('x') == input() and outputMatches("You are "+vars.get('x')+" years old"):
            return True
        elif vars.get('x') != input():
            return "Did you set x to input()?"
        elif not outputMatches("You are "+vars.get('x')+" years old"):
            return "Did you print x in a concatenated string?"
    
    


