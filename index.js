const fetch = require('node-fetch')
const { toXML } = require("jstoxml");
'use strict';

/*
// option template
// you can try this
// ===========================================
// https://www.dpriver.com/pp/sqlformat.htm
// ===========================================
let options = {
	dbvendor  : "oracle", // endor, access, db2, mssql, mysql, oracle, mdx, generic
	outputfmt : "SQL", // htmlkeeplayout, htmlkeeplayout2, htmlkeeplayoutmodifycase, htmlkeeplayout2modifycase, txtmodifycase, C#, C# String Builder, Delphi, Java, Java String Buffer, PHP, VB, VBSBD, VC, dbobject, proc, procobol, xml
	keywordcs     : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
	tablenamecs   : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
	columnnamecs  : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
	functioncs    : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
	datatypecs    : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
	variablecs    : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
	aliascs       : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
	quotedidentifiercs : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
	identifiercs  : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword     
	lnbrwithcomma : "beforewithspace", // after,before,beforewithspace
	liststyle     : "stack",     // stack,nostack
	salign        : "sright",    // sleft,sright
	quotechar     : "\"",
	maxlenincm    : "80"
}
*/

let formatter = {
	inputOptions : {},
	outputOptionsDefalut : {
		sqlpp_request : {
			clientid  : "dpriver-9094-8133-2031",
			dbvendor  : "oracle", // endor, access, db2, mssql, mysql, oracle, mdx, generic
			outputfmt : "SQL", // htmlkeeplayout, htmlkeeplayout2, htmlkeeplayoutmodifycase, htmlkeeplayout2modifycase, txtmodifycase, C#, C# String Builder, Delphi, Java, Java String Buffer, PHP, VB, VBSBD, VC, dbobject, proc, procobol, xml
			inputsql  : "",
			formatoptions : {
				keywordcs     : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
				tablenamecs   : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
				columnnamecs  : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
				functioncs    : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
				datatypecs    : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
				variablecs    : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
				aliascs       : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
				quotedidentifiercs : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword
				identifiercs  : "Uppercase", // Uppercase,Lowercase,InitCap,Unchanged,initcapeachword     
				lnbrwithcomma : "beforewithspace", // after,before,beforewithspace
				liststyle     : "stack",     // stack,nostack
				salign        : "sright",    // sleft,sright
				quotechar     : "\"",    
				maxlenincm    : "80"
			}
		}
	},
	format : async function (pSql, pOptions) {
		if ( pSql == undefined || pSql == null ||  pSql == "" ) return ""
		let vOptions = formatter.outputOptionsDefalut
		if ( pOptions != null ) {
			formatter.chkOptions.forEach(function(item,index,arr2) {
				if ( pOptions[item] != null && pOptions[item] != "" ) {
					if ( item == "dbvendor" || item == "outputfmt" ) {
						vOptions.sqlpp_request[item] = pOptions[item]
					} else {
						vOptions.sqlpp_request.formatoptions[item] = pOptions[item]
					}
				}
			})
		}
		vOptions.sqlpp_request.inputsql = pSql

		return fetch( "https://www.dpriver.com/cgi-bin/ppserver"
		 			, {method:'post',body:toXML(vOptions)} )
			.then(res=>res.text())
			.then(res => {
			
				let vSql = formatter.getXml(res, "formattedsql")
				vSql = formatter.replaceAll(vSql, "&lt;" , "<")
				vSql = formatter.replaceAll(vSql, "&amp;", "&")
				vSql = formatter.replaceAll(vSql, "&gt;" , ">")

				if ( formatter.getXml(res,"retmessage") == "success" ) {
					if ( vSql == "Input SQL is empty!" ) {
						console.log("실패4")
						return pSql
					}

					let hbb = pSql.match(/([\u0100-\uFFFD])+/g) // 한글 깨지기 전
					let hba = vSql.match(/([\u0100-\uFFFD])+/g) // 한글 깨진 후
					if ( hbb == null ) hbb = []
					if ( hba == null ) hba = []
					if ( hbb.length == hba.length ) {
						for ( let ii =0; ii < hbb.length; ii++ ) { // 깨진 한글 보정
							vSql = vSql.replace(hba[ii],hbb[ii])
						}
					} else { // 한글 등 특수문자 바인딩 실패
					}
				} else { // 파싱 실패, 포멧은 살아있다.
				}
				return vSql
		})
	},
	chkOptions : ["keywordcs", "tablenamecs", "columnnamecs", "functioncs", "datatypecs", "variablecs", "aliascs", "quotedidentifiercs", "identifiercs", "lnbrwithcomma", "liststyle", "salign", "quotechar", "maxlenincm", "dbvendor", "outputfmt"],
	replaceAll : (str, searchStr, replaceStr) => str.split(searchStr).join(replaceStr),
	getXml : (pXml,pTag) => {
		let ss = pXml.indexOf("<" + pTag + ">") + ("<" + pTag + ">").length
		let sd = pXml.indexOf("</" + pTag + ">")
		return pXml.substr(ss,sd-ss)
	}
}
module.exports = formatter