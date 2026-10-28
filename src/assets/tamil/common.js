


var isIE = document.all?true:false;
var myimg = new Image();
var sPos = 0;
var isTh = false;
var isNg = false;
var kbmode = "roman";
var pkbmode = "roman";
var SplKeys = new Array();
var toShowHelp = true;
var webhome = "http://www.higopi.com";

SplKeys["ZR"] = 0;
SplKeys["BS"] = 8;
SplKeys["CR"] = 13;

var lang = "tamil";
var chnbin = "\u0BCD";
var ugar = "\u0BC1";
var uugar = "\u0BC2";

var tatw = new Array();
tatw['\\!'] = "\u0BB8";
tatw['\\$'] = "\u0B9C";
tatw['\\%'] = "\u0BC1";
tatw['\\^'] = "\u0BC2";
tatw['\\&'] = "\u0BB7";
tatw['_'] = "\u0BB8\u0BCD\u0BB0\u0BC0";
tatw['q'] = "\u0BA3\u0BC1";
tatw['w'] = "\u0BB1";
tatw['e'] = "\u0BA8";
tatw['r'] = "\u0B9A";
tatw['t'] = "\u0BB5";
tatw['y'] = "\u0BB2";
tatw['u'] = "\u0BB0";
tatw['i'] = "\u0BC8";
tatw['o'] = "\u0B9F\u0BBF";
tatw['p'] = "\u0BBF";
tatw['\\['] = "\u0BC1";
tatw['\\]'] = "\u0B94";
tatw["\\\\"] = "\u0B95\u0BCD\u0BB7";
tatw['Q'] = "\u0B9E\u0BC1";
tatw['W'] = "\u0BB1\u0BC1";
tatw['E'] = "\u0BA8\u0BC1";
tatw['R'] = "\u0B9A\u0BC1";
tatw['T'] = "\u0B95\u0BC2";
tatw['Y'] = "\u0BB2\u0BC1";
tatw['U'] = "\u0BB0\u0BC1";
tatw['I'] = "\u0B90";
tatw['O'] = "\u0B9F\u0BC0";
tatw['P'] = "\u0BC0";
tatw['\\{'] = "\u0BC2";
tatw['\\}'] = "\u0BC2";

tatw['a'] = "\u0BAF";
tatw['s'] = "\u0BB3";
tatw['d'] = "\u0BA9";
tatw['f'] = "\u0B95";
tatw['g'] = "\u0BAA";
tatw['h'] = "\u0BBE";
tatw['j'] = "\u0BA4";
tatw['k'] = "\u0BAE";
tatw['l'] = "\u0B9F";
tatw['\\;'] = "\u0BCD";
tatw['\\\''] = "\u0B99";
tatw['A'] = "\u0BB1\u0BBE";
tatw['S'] = "\u0BB3\u0BC1";
tatw['D'] = "\u0BA9\u0BC1";
tatw['F'] = "\u0B95\u0BC1";
tatw['G'] = "\u0BB4\u0BC1";
tatw['H'] = "\u0BB4";
tatw['J'] = "\u0BA4\u0BC1";
tatw['K'] = "\u0BAE\u0BC1";
tatw['L'] = "\u0B9F\u0BC1";
tatw['\\:'] = "\u00B0";
tatw['\\"'] = "\u0B9E";

tatw['z'] = "\u0BA3";
tatw['x'] = "\u0B92";
tatw['c'] = "\u0B89";
tatw['v'] = "\u0B8E";
tatw['b'] = "\u0BC6";
tatw['n'] = "\u0BC7";
tatw['m'] = "\u0B85";
tatw[','] = "\u0B87";
tatw['Z'] = "\u0BB9";
tatw['X'] = "\u0B93";
tatw['C'] = "\u0B8A";
tatw['V'] = "\u0B8F";
tatw['B'] = "\u0B83";
tatw['N'] = "\u0B9A\u0BC2";
tatw['M'] = "\u0B86";
tatw['\\<'] = "\u0B88";

tatw['\\|'] = "!";
tatw['\\`'] = "&";
tatw['\\.'] = ",";
tatw['/'] = ".";
tatw['\\#'] = "%";
tatw['\\~'] = ";";
tatw['-'] = "/";
tatw['\\@'] = "\"";
tatw['\\>'] = "-";
tatw['\u0BC1\u0BC2'] = "\u0BC2";

//Phonetic
var ta = new Array();
ta['f'] = "qp";
ta['B'] = "b";
ta['C'] = "c";
ta['D'] = "d";
ta['F'] = "qp";
ta['G'] = "g";
ta['H'] = "h";
ta['J'] = "j";
ta['K'] = "k";
ta['M'] = "m";
ta['P'] = "p";
ta['Q'] = "q";
ta['T'] = "t";
ta['V'] = "v";
ta['W'] = "w";
ta['X'] = "x";
ta['Y'] = "y";
ta['Z'] = "z";

//Cons
ta['\u0BA8\u0BCDg'] = "\u0B99\u0BCD";
ta['\u0BA9\u0BCDg'] = "\u0B99\u0BCD";
ta['\u0BA8\u0BCDj'] = "\u0B9E\u0BCD";
ta['\u0BA9\u0BCDj'] = "\u0B9E\u0BCD";
ta['\u0B9F\u0BCDh'] = "\u0BA4\u0BCD";
ta['\u0B9A\u0BCDh'] = "\u0BB7\u0BCD";
ta['\u0BA9\u0BCD\u0BA4\u0BCD'] = "\u0BA8\u0BCD\u0BA4\u0BCD";
ta['ng'] = "\u0B99\u0BCD";
ta['nj'] = "\u0B9E\u0BCD";
ta['th'] = "\u0BA4\u0BCD";
ta['sh'] = "\u0BB7\u0BCD";
ta['k'] = "\u0B95\u0BCD";
ta['g'] = "\u0B95\u0BCD";
ta['c'] = "\u0B9A\u0BCD";
ta['s'] = "\u0B9A\u0BCD";
ta['t'] = "\u0B9F\u0BCD";
ta['d'] = "\u0B9F\u0BCD";
ta['N'] = "\u0BA3\u0BCD";
ta[' n'] = " \u0BA8\u0BCD";
ta['^n'] = "\u0BA8\u0BCD";
ta['\nn'] = "\n\u0BA8\u0BCD";
ta['w'] = "\u0BA8\u0BCD";
ta['p'] = "\u0BAA\u0BCD";
ta['b'] = "\u0BAA\u0BCD";
ta['m'] = "\u0BAE\u0BCD";
ta['y'] = "\u0BAF\u0BCD";
ta['r'] = "\u0BB0\u0BCD";
ta['l'] = "\u0BB2\u0BCD";
ta['v'] = "\u0BB5\u0BCD";
ta['R'] = "\u0BB1\u0BCD";
ta['L'] = "\u0BB3\u0BCD";
ta['z'] = "\u0BB4\u0BCD";
ta['n'] = "\u0BA9\u0BCD";
ta['S'] = "\u0BB8\u0BCD";
ta['h'] = "\u0BB9\u0BCD";
ta['j'] = "\u0B9C\u0BCD";
ta['x'] = "\u0B95\u0BCD\u0BB7\u0BCD";
//adjVows Small
ta['\u0BCDa'] = "\u200C";
ta['\u0BCDi'] = "\u0BBF";
ta['\u0BCDu'] = "\u0BC1";
ta['\u0BCDe'] = "\u0BC6";
ta['\u0BCDo'] = "\u0BCA";
ta['\u200Ci'] = "\u0BC8";
ta['\u200Cu'] = "\u0BCC";
//adjVows Big
ta['\u200Ca'] = "\u0BBE";
ta['\u0BBFi'] = "\u0BC0";
ta['\u0BC1u'] = "\u0BC2";
ta['\u0BC6e'] = "\u0BC7";
ta['\u0BCAo'] = "\u0BCB";
ta['\u0BCDA'] = "\u0BBE";
ta['\u0BCDI'] = "\u0BC0";
ta['\u0BCDU'] = "\u0BC2";
ta['\u0BCDE'] = "\u0BC7";
ta['\u0BCDO'] = "\u0BCB";
//Vows
ta['-'] = "\u200D";
ta['\u0B85i'] = "\u0B90";
ta['\u0B85u'] = "\u0B94";
ta['ai'] = "\u0B90";
ta['au'] = "\u0B94";
ta['\u0B85a'] = "\u0B86";
ta['\u0B87i'] = "\u0B88";
ta['\u0B89u'] = "\u0B8A";
ta['\u0B8Ee'] = "\u0B8F";
ta['\u0B92o'] = "\u0B93";
ta['a'] = "\u0B85";
ta['A'] = "\u0B86";
ta['i'] = "\u0B87";
ta['I'] = "\u0B88";
ta['u'] = "\u0B89";
ta['U'] = "\u0B8A";
ta['e'] = "\u0B8E";
ta['E'] = "\u0B8F";
ta['o'] = "\u0B92";
ta['O'] = "\u0B93";
ta['q'] = "\u0B83";
//Nums
ta['\u0BF10'] = "\u0BF2";
ta['\u0BF00'] = "\u0BF1";
ta['\u0BE70'] = "\u0BF0";
ta['\u200D1'] = "\u0BE7";
ta['\u200D2'] = "\u0BE8";
ta['\u200D3'] = "\u0BE9";
ta['\u200D4'] = "\u0BEA";
ta['\u200D5'] = "\u0BEB";
ta['\u200D6'] = "\u0BEC";
ta['\u200D7'] = "\u0BED";
ta['\u200D8'] = "\u0BEE";
ta['\u200D9'] = "\u0BEF";
ta['\u200D0'] = "0";
ta['(.+)\u200C(.+)'] = "$1$2";

// Tamil 99 keys
var ta99 = new Array();
//caret symbol for special purposes
ta99['\\^']="\u200C";

// mellina vallina rule
ta99["\u0B99\u200Ch"]="\u0B99\u0BCD\u0B95\u200C";
ta99["\u0B9E\u200C\\["]="\u0B9E\u0BCD\u0B9A\u200C";
ta99["\u0BA3\u200Co"]="\u0BA3\u0BCD\u0B9F\u200C";
ta99["\u0BA8\u200Cl"]="\u0BA8\u0BCD\u0BA4\u200C";
ta99["\u0BAE\u200Cj"]="\u0BAE\u0BCD\u0BAA\u200C";
ta99["\u0BA9\u200Cu"]="\u0BA9\u0BCD\u0BB1\u200C";

//auto pulli rule for same letter repeat
ta99["\u0BB3\u200Cy"]="\u0BB3\u0BCD\u0BB3\u200D";
ta99["\u0BB3\u0BCD{2}"]="\u0BB3\u0BCD\u0BB3\u200C";
ta99["\u0BB1\u200Cu"]="\u0BB1\u0BCD\u0BB1\u200D";
ta99["\u0BB1\u0BCD{2}"]="\u0BB1\u0BCD\u0BB1\u200C";
ta99["\u0BA9\u200Ci"]="\u0BA9\u0BCD\u0BA9\u200D";
ta99["\u0BA9\u0BCD{2}"]="\u0BA9\u0BCD\u0BA9\u200C";
ta99["\u0B9F\u200Co"]="\u0B9F\u0BCD\u0B9F\u200D";
ta99["\u0B9F\u0BCD{2}"]="\u0B9F\u0BCD\u0B9F\u200C";
ta99["\u0BA3\u200Cp"]="\u0BA3\u0BCD\u0BA3\u200D";
ta99["\u0BA3\u0BCD{2}"]="\u0BA3\u0BCD\u0BA3\u200C";
ta99["\u0B9A\u200C\\["]="\u0B9A\u0BCD\u0B9A\u200D";
ta99["\u0B9A\u0BCD{2}"]="\u0B9A\u0BCD\u0B9A\u200C";
ta99["\u0B9E\u200C\\]"]="\u0B9E\u0BCD\u0B9E\u200D";
ta99["\u0B9E\u0BCD{2}"]="\u0B9E\u0BCD\u0B9E\u200C";

ta99["\u0B95\u200Ch"]="\u0B95\u0BCD\u0B95\u200D";
ta99["\u0B95\u0BCD{2}"]="\u0B95\u0BCD\u0B95\u200C";
ta99["\u0BAA\u200Cj"]="\u0BAA\u0BCD\u0BAA\u200D";
ta99["\u0BAA\u0BCD{2}"]="\u0BAA\u0BCD\u0BAA\u200C";
ta99["\u0BAE\u200Ck"]="\u0BAE\u0BCD\u0BAE\u200D";
ta99["\u0BAE\u0BCD{2}"]="\u0BAE\u0BCD\u0BAE\u200C";
ta99["\u0BA4\u200Cl"]="\u0BA4\u0BCD\u0BA4\u200D";
ta99["\u0BA4\u0BCD{2}"]="\u0BA4\u0BCD\u0BA4\u200C";
ta99["\u0BA8\u200C;"]="\u0BA8\u0BCD\u0BA8\u200D";
ta99["\u0BA8\u0BCD{2}"]="\u0BA8\u0BCD\u0BA8\u200C";
ta99["\u0BAF\u200C\'"]="\u0BAF\u0BCD\u0BAF\u200D";
ta99["\u0BAF\u0BCD{2}"]="\u0BAF\u0BCD\u0BAF\u200C";

ta99["\u0BB5\u200Cv"]="\u0BB5\u0BCD\u0BB5\u200D";
ta99["\u0BB5\u0BCD{2}"]="\u0BB5\u0BCD\u0BB5\u200C";
ta99["\u0B99\u200Cb"]="\u0B99\u0BCD\u0B99\u200D";
ta99["\u0B99\u0BCD{2}"]="\u0B99\u0BCD\u0B99\u200C";
ta99["\u0BB2\u200Cn"]="\u0BB2\u0BCD\u0BB2\u200D";
ta99["\u0BB2\u0BCD{2}"]="\u0BB2\u0BCD\u0BB2\u200C";
ta99["\u0BB0\u200Cm"]="\u0BB0\u0BCD\u0BB0\u200D";
ta99["\u0BB0\u0BCD{2}"]="\u0BB0\u0BCD\u0BB0\u200C";
ta99["\u0BB4\u200C/"]="\u0BB4\u0BCD\u0BB4\u200D";
ta99["\u0BB4\u0BCD{2}"]="\u0BB4\u0BCD\u0BB4\u200C";

//auto pulli rule  for vada mozhi ezuthu
ta99["\u0BB8\u200CQ"]="\u0BB8\u0BCD\u0BB8\u200D";
ta99["\u0BB8\u0BCD{2}"]="\u0BB8\u0BCD\u0BB8\u200C";
ta99["\u0BB7\u200CW"]="\u0BB7\u0BCD\u0BB7\u200D";
ta99["\u0BB7\u0BCD{2}"]="\u0BB7\u0BCD\u0BB7\u200C";
ta99["\u0B9C\u200CE"]="\u0B9C\u0BCD\u0B9C\u200D";
ta99["\u0B9C\u0BCD{2}"]="\u0B9C\u0BCD\u0B9C\u200C";
ta99["\u0BB9\u200CR"]="\u0BB9\u0BCD\u0BB9\u200D";
ta99["\u0BB9\u0BCD{2}"]="\u0BB9\u0BCD\u0BB9\u200C";

//otru
ta99["[\u200D|\u200C]q"]="\u0BBE";
ta99["[\u200D|\u200C]w"]="\u0BC0";
ta99["[\u200D|\u200C]e"]="\u0BC2";
ta99["[\u200D|\u200C]r"]="\u0BC8";
ta99["[\u200D|\u200C]t"]="\u0BC7";
ta99["\u0BCDa"]="\u200C";
ta99["[\u200D|\u200C]a"]= "";
ta99["[\u200D|\u200C]s"]="\u0BBF"
ta99["[\u200D|\u200C]d"]="\u0BC1"
ta99["[\u200D|\u200C]f"]="\u0BCD";
ta99["[\u200D|\u200C]g"]="\u0BC6";
ta99["[\u200D|\u200C]z"]="\u0BCC";
ta99["[\u200D|\u200C]x"]="\u0BCB";
ta99["[\u200D|\u200C]c"]="\u0BCA";

// copyright & spl symbols
ta99["\u200Cc"]="\u00A9";
ta99["\u200C\\."]="\u2022";

// uyir
ta99["q"]="\u0B86";
ta99["w"]="\u0B88";
ta99["e"]="\u0B8A";
ta99["r"]="\u0B90";
ta99["t"]="\u0B8F";

ta99["a"]="\u0B85";
ta99["s"]="\u0B87";
ta99["d"]="\u0B89";
ta99["f"]="\u0B83";
ta99["F"]="\u0B83";
ta99["g"]="\u0B8E";

ta99["z"]="\u0B94";
ta99["x"]="\u0B93";
ta99["c"]="\u0B92";

// vada mozhi ezuthu
ta99["Q"]="\u0BB8\u200C";
ta99["W"]="\u0BB7\u200C";
ta99["E"]="\u0B9C\u200C";
ta99["R"]="\u0BB9\u200C";
ta99["T"]="\u0B95\u0BCD\u0BB7\u200C";
ta99["Y"]="\u0BB8\u0BCD\u0BB0\u0BC0";
ta99["O"]="[";
ta99["P"]="]";

//mei
ta99["y"]="\u0BB3\u200C";
ta99["u"]="\u0BB1\u200C";
ta99["i"]="\u0BA9\u200C";
ta99["p"]="\u0BA3\u200C";
ta99["o"]="\u0B9F\u200C";
ta99["\\["]="\u0B9A\u200C";
ta99["\\]"]="\u0B9E\u200C";

ta99["g"]="\u0B8E";
ta99["h"]="\u0B95\u200C";
ta99["j"]="\u0BAA\u200C";
ta99["k"]="\u0BAE\u200C";
ta99["l"]="\u0BA4\u200C";
ta99[";"]="\u0BA8\u200C";
ta99["\'"]="\u0BAF\u200C";

ta99["v"]="\u0BB5\u200C";
ta99["b"]="\u0B99\u200C";
ta99["n"]="\u0BB2\u200C";
ta99["m"]="\u0BB0\u200C";
ta99["/"]="\u0BB4\u200C";


// spl symbols
ta99["M"]="/";
ta99["A"]="\u0BF9";
ta99["S"]="\u0BFA";
ta99["D"]="\u0BF8";
ta99["K"]="\"";
ta99["L"]=":";
ta99["\\:"]=";";
ta99["\""]="\'";
ta99["Z"]="\u0BF3";
ta99["X"]="\u0BF4";
ta99["C"]="\u0BF5";
ta99["V"]="\u0BF6";
ta99["B"]="\u0BF7";

ta99['(.+)\u200C(.+)'] = "$1$2";

function test ()
{
    console.log("test")
}
function convertThis(e,numchar)
{
    if (!isIE)
	   var Key = e.which;
    else
		var Key = e.keyCode;

	var Char = String.fromCharCode(Key);
	if(typeof numchar == "undefined")
		numchar = 4;
	if( isIE )
	{
		var myField = e.srcElement;
		myField.caretPos = document.selection.createRange().duplicate();
		var prevChar = myField.caretPos.text;
		var diff = 0;
		var cpos = getCursorPosition(myField);
		if(prevChar.length != 0)
			document.selection.clear();
		if(myField.value.length != 0 && cpos != "1,1" )
		{
			myField.caretPos.moveStart('character',-1);
			prevChar = myField.caretPos.text;
			diff ++;
		}
		if(prevChar == chnbin)
		{
			myField.caretPos.moveStart('character',-1);
			prevChar = myField.caretPos.text;
			diff ++;
		}

		if(cpos[1] > numchar )
		{
			myField.caretPos.moveStart('character', diff - numchar);
			prevChar = myField.caretPos.text;
		}
		if(prevChar == "" && cpos != "1,1")
			prevChar =  "\u000A";
		if(Key == 13)
			Char = "\u000A";
		myField.caretPos.text = getLang(prevChar,Char, 0)
		e.cancelBubble = true;
		e.returnValue = false;
	}
	else
	{
		myField = e.target;
		if( myField.selectionStart >= 0)
		{
			if(isSplKey(Key) ||  e.ctrlKey )
				return true;
			var startPos = myField.selectionStart;
			var endPos = myField.selectionEnd;
			var txtTop = myField.scrollTop;
			if(myField.value.length == 0)
			{
				var prevChar = "";
				myField.value = getLang(prevChar,Char, startPos)
			}
			else
			{
				var prevChar = myField.value.substring(startPos - 1,startPos);
				var prevStr =  myField.value.substring(0,startPos - 1);
				if(prevChar == chnbin)
				{
					prevChar = myField.value.substring(startPos - 2,startPos);
					prevStr =  myField.value.substring(0,startPos - 2);
				}
				cpos = getCursorPosition(myField);
				if(cpos[1] >= numchar)
				{
					prevChar = myField.value.substring(startPos - numchar,startPos);
					prevStr =  myField.value.substring(0,startPos - numchar);
				}
				myField.value = prevStr + getLang(prevChar,Char, myField.selectionStart)
						  + myField.value.substring(endPos, myField.value.length);
			}
			myField.selectionStart = sPos ;
			myField.selectionEnd = sPos;
			if((myField.scrollHeight+4)+"px" != myField.style.height)
				myField.scrollTop = txtTop;
			e.stopPropagation();
			e.preventDefault();
		}
	}
	showCombi(e)
}

function showCombi(e)
{
    if(document.getElementById('HelpDiv') == null)
    {
	   var helpdiv  = document.createElement('div');
		helpdiv.setAttribute('id','HelpDiv');
		helpdiv.setAttribute('align','left');
		if(isIE)
		{
			var bdy = e.srcElement.parentNode;
			bdy.insertBefore(helpdiv, e.srcElement);
		}
		else
		{
			bdy = e.target.parentNode;
			bdy.insertBefore(helpdiv, e.target);
		}

	}
	else
	{
		var helpdiv  = document.getElementById('HelpDiv');
	}
	var helpstyle = getStyleObject('HelpDiv');
	if(!toShowHelp || kbmode != 'roman')
	{	helpstyle.display = 'none';	return;	}
    var prevChar=""
    var Char=""
	var prevWord =  getLang(prevChar,Char,0)
	if(isLangOtru(prevWord.substring(prevWord.length - 1)))
		prevWord = prevWord.substring(prevWord.length - 2)
	else
		prevWord = prevWord.substring(prevWord.length - 1)

	var helptxt = "";
	var prevLet = getLang(prevWord,Char,0); prevLet = prevLet.substring(prevLet.length - 1);
	if( prevWord != "" && !isLangOtru(prevWord) && prevLet != getLang('',Char,0) )
	{
		if(Char == 'a' || Char == 'i' ||Char == 'u' || Char == 'e' || Char == 'o' )
		{
			helptxt =  '<td style="font-size:12px;border:1px solid #0DE8E9;">' +prevWord+ ' + ' + Char+' = <b>' + getLang(prevWord,Char,0) + "</b></td>" ;
			if(Char == 'a')
				helptxt +=  '<td style="font-size:12px;border:1px solid #0DE8E9;">' + prevWord + ' + i = <b>' + getLang(prevWord,'i',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
						  + prevWord + ' + u = <b>' + getLang(prevWord,'u',0) + "</b></td>";
		}
		else if( Char != getLang('',Char,0))
		{
			helptxt = '<td style="font-size:12px;border:1px solid #0DE8E9;">' +prevWord + ' + a = <b>' + getLang(prevWord,'a',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
				+ prevWord + ' + A = <b>' + getLang(prevWord,'A',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
				+ prevWord + ' + i = <b>' + getLang(prevWord,'i',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
				+ prevWord + ' + I = <b>' + getLang(prevWord,'I',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
				+ prevWord + ' + u = <b>' + getLang(prevWord,'u',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
				+ prevWord + ' + U = <b>' + getLang(prevWord,'U',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
				+ prevWord + ' + e = <b>' + getLang(prevWord,'e',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
				+ prevWord + ' + E = <b>' + getLang(prevWord,'E',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
				+ prevWord + ' + a + i = <b>' + getLang(getLang(prevWord,'a',0),'i',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
				+ prevWord + ' + o = <b>' + getLang(prevWord,'o',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
				+ prevWord + ' + o = <b>' + getLang(prevWord,'O',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
				+ prevWord + ' + a + u = <b>' + getLang(getLang(prevWord,'a',0),'u',0) + "</b></td>"
			if(lang == 'tamil')
			{
				if(getLang('','t',0) == prevWord)
					helptxt += '<td style="font-size:12px;border:1px solid #0DE8E9;">' +prevWord + ' + h = <b>' + getLang(prevWord,'h',0) + "</b></td>";
				if(getLang('','s',0) == prevWord)
					helptxt += '<td style="font-size:12px;border:1px solid #0DE8E9;">' +prevWord + ' + h = <b>' + getLang(prevWord,'h',0)+ "</b></td>";
				if(getLang('','S',0) == prevWord)
					helptxt += '<td style="font-size:12px;border:1px solid #0DE8E9;">' + prevWord + ' + r + I = <b>' + getLang(getLang(prevWord,'r',0),'I',0) + "</b></td>";
				if(getLang('k','n',0).indexOf(prevWord) > 0 )
					helptxt += '<td style="font-size:12px;border:1px solid #0DE8E9;">' +prevWord + ' + t + h = <b>' + getLang(getLang(prevWord,'t',0),'h',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
								+ prevWord + ' + g = <b>' + getLang(prevWord,'g',0) + "</b></td><td style='font-size:12px;border:1px solid #0DE8E9;'>"
								+ prevWord + ' + j = <b>' + getLang(prevWord,'j',0) + "</b></td>";
			}
		}
		helpdiv.innerHTML = '<table cellpadding="2" cellspacing="0" border="0" style="border:1px solid #0DE8E9;background-color:#BDE8E9"><tr>'+ helptxt + '</tr></table>';
		helpstyle.display = 'block';

	}
	else
		helpstyle.display = 'none';
	if(isIE) e.srcElement.onblur = hideHelp;
	else e.target.onblur = hideHelp;
}

function isSplKey(keynum)
{
	var retVal = false;
    var i = "";
	for(i in SplKeys)
	{
		if(keynum == SplKeys[i])
			retVal = true;
	}
	return retVal;
}

function getLang(prv, txt, sP)
{
	sPos = sP;
	if(kbmode == "english")
	{
		var retTxt = prv+txt;
		sPos ++;
	}
	else if(kbmode == "typewriter")
	{
		if(prv == ugar && mapLang(txt,sP,"tw") == uugar)
			retTxt = mapLang(prv+txt,sP,"tw");
		else
			retTxt = prv+mapLang(txt,sP,"tw");
	}
	else if(kbmode == "tamil99")
	{
		retTxt = mapLang(prv+txt,sP,"t99");
	}
	else
	{
		if(pkbmode == "english")
		{
			retTxt = prv+mapLang(txt);
			pkbmode = "roman";
		}
		else
			retTxt = mapLang(prv+txt);
	}
	return retTxt;
}

function mapLang(txt,sP,mod)
{
	if(sP != null)
		sPos = sP;
	var prvlen = txt.length;
	var txtarr = eval(lang.substring(0,2));
	if(mod != null && mod == "tw")
		txtarr = eval(lang.substring(0,2)+"tw");
	if(mod != null && mod == "t99")
		txtarr = eval(lang.substring(0,2)+"99");
	var retTxt = "";
    var itm = "";
	for(itm in txtarr)
	{
		var rexp = new RegExp(itm,"g");
		txt = txt.replace(rexp, txtarr[itm]);
	}
	sPos += (txt.length -prvlen +1);
	return txt;
}

function getCursorPosition(textarea)
{
	var txt = textarea.value;
	var len = txt.length;
	var erg = txt.split("\n");
	var pos = -1;
	if(typeof document.selection != "undefined")
	{ // FOR MSIE
	var range_sel = document.selection.createRange();
	var range_obj = textarea.createTextRange();
	range_obj.moveToBookmark(range_sel.getBookmark());
	range_obj.moveEnd('character',textarea.value.length);
	pos = len - range_obj.text.length;
	}
	else if(typeof textarea.selectionStart != "undefined")
	{ // FOR MOZILLA
	pos = textarea.selectionStart;
	}
	if(pos != -1)
	{
		for(var ind = 0;ind<erg.length;ind++)
		{
			len = erg[ind].length + 1;
			if(pos < len)
				break;
			pos -= len;
		}
		ind++; pos++;
		return [ind, pos]; // ind = LINE, pos = COLUMN
	}
}

function isLangOtru(letter)
{
	var isOtru = false;
	var otruArr = new Array (	'\u200C',
	"\u0BCD","\u0BBE","\u0BBF","\u0BC0", "\u0BC1","\u0BC2","\u0BC6","\u0BC7","\u0BC8","\u0BCA","\u0BCB","\u0BCC", // Tamil
	"\u0C4D","\u0C3E","\u0C3F","\u0C40","\u0C41","\u0C42","\u0C46","\u0C47","\u0C48","\u0C4A","\u0C4B","\u0C4C","\u0C43","\u0C44","\u0C01","\u0C02","\u0C03",  //Telugu
	"\u094D","\u093E","\u093F","\u0940","\u0941","\u0942","\u0946","\u0947","\u0948","\u094A","\u094B","\u094C","\u0901","\u0902","\u0903",// Hindi
	"\u0D3E","\u0D3F","\u0D40","\u0D41","\u0D42","\u0D43","\u0D47","\u0D46","\u0D48","\u0D4A","\u0D4B","\u0D4C","\u0D02","\u0D03",  //Malayalam
	"\u0CBE","\u0CBF","\u0CC0","\u0CC1","\u0CC2","\u0CC3","\u0CC4","\u0CC6","\u0CC7","\u0CC8","\u0CCA","\u0CCB","\u0CCC","\u0C82","\u0C83",//Kannada
	"\u0ABE","\u0ABF","\u0AC0","\u0AC1","\u0AC2","\u0AC5","\u0AC7","\u0AC8","\u0AC9","\u0ACB","\u0ACC","\u0A81","\u0A82","\u0A83",//Gujarathi
	"\u0B3E","\u0B3F","\u0B40","\u0B41","\u0B42","\u0B46","\u0B47","\u0B48","\u0B4A","\u0B4B","\u0B4C","\u0B01","\u0B02","\u0B03",//Oriya
	"\u09BE","\u09BF","\u09C0","\u09C1","\u09C2","\u09C6","\u09C7","\u09C8","\u09CA","\u09CB","\u09CC","\u0981","\u0982","\u0983",//Bengali
	"\u0A3E","\u0A3F","\u0A40","\u0A41","\u0A42","\u0A46","\u0A47","\u0A48","\u0A4A","\u0A4B","\u0A4C","\u0A50","\u0A03"//Punjabi
	);
	for(var i=0;i<otruArr.length;i++)
		if(otruArr[i] == letter)
			isOtru = true;
	return isOtru;
}

function showHelp(obj)
{
	toShowHelp = obj.checked;
	var helpstyle = getStyleObject('HelpDiv');
	if(!toShowHelp)
		helpstyle.display = 'none';
}

function hideHelp()
{
	var helpstyle  = getStyleObject('HelpDiv');
	helpstyle.display = 'none';
}
function getStyleObject(objectId)
{
    // cross-browser function to get an object's style object given its
    if(document.getElementById && document.getElementById(objectId)) {
	// W3C DOM
	return document.getElementById(objectId).style;
    } else if (document.all && document.all(objectId)) {
	// MSIE 4 DOM
	return document.all(objectId).style;
    } else if (document.layers && document.layers[objectId]) {
	// NN 4 DOM.. note: this won't find nested layers
	return document.layers[objectId];
    } else {
	return false;
    }
} // getStyleObject
window.convertThis = convertThis;