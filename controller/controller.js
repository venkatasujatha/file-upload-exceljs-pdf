const path = require('path')
const excelJs = require('exceljs')
const employee2 = require('../model/employee')
const {dataSource} = require('../database')
const empRepo = dataSource.getRepository('employee2');
const pdf =require('pdfkit');
const fs =require('fs')
const axios =require('axios')
const uploadFile = async (req, res) => {
  let data = []
  
  try {
    
   
    const errormsg = []
    const workbook = new excelJs.Workbook();
     const result = await workbook.xlsx.readFile(req.file.path);
     const sheetCount =workbook.worksheets.length;
    console.log("TotalCount",sheetCount);
    if (sheetCount === 0) {
      errormsg.push({ message: "Workbook empty." });
    } else{
      workbook.eachSheet(async (sheet)=>{
        const actualCount =sheet.actualRowCount;
      console.log(actualCount)
      const rowCount = sheet.rowCount
      console.log(rowCount)
      const columnCount = sheet.columnCount
      console.log(columnCount)
      if(actualCount > 1 && columnCount == 2){
      let resp = validateHeaders(sheet.getRow(1).values)
      console.log(resp.status);
      if(resp.status =='ERROR') {
        errormsg.push({location: resp.location, message: resp.message})
       console.log(errormsg)
      }else{
       for(let i = 2;i<=rowCount;i++) {
       const name = sheet.getRow(i).values[1];
       const age = sheet.getRow(i).values[2];
        console.log("name",name)
        if((name == undefined && age != undefined) || (name!= undefined && age == undefined)){
          errormsg.push({message: " empty row exists"})
          console.log(errormsg)
          break;
        }
        if(onlyAlphabets(name) && containsOnlyNumbers(age)){
        let mydata = {
          Name: name,
          Age: age,
        };
        data.push(mydata)
        console.log("data",data)
       }     
      }  
    }   

    }else{

      console.log("column count is more than 2")
    }  
      })

    }   
    let resp1;
      if(errormsg.length>0)
    {
      return {status: 'ERROR', message: 'invalid rows present in sheet'}

    }
    
    else{
      
     resp1= await empRepo.save(data);
      console.log("resp1",resp1)
      
    }
     if(resp1.length>0)
     {
      
        resp1= await axios.get('http://localhost:4000/downloadFile');
        res.status(200).json({
         message:"success",
         res:resp1.data
        })
        
      } 
     
  } catch (err) {
    
    console.log(err.message)
    // res.send(400).json({
    //   message: 'file upload is failed'
    // })
  }
  function validateHeaders(headerRow) {

    console.log(headerRow)
  
    if(headerRow[1]!=='Name' || headerRow[2]!=='Age') {
  
        return {status: 'ERROR', location: "ROW 1", message: 'Incorrect Header.'}
  
    }
  
    else {
  
        return {status: 'SUCCESS'}
  
    }
  
  }
  function onlyAlphabets(str) {
    return /^[a-zA-Z]+$/.test(str);
  }
  function containsOnlyNumbers(str) {
    return /^[0-9]+$/.test(str);
  }
}
const downloadFile = async (req, res) => {
  try {
   
    
    const resp = await empRepo.find({select:{
      Age:true
    }});
     //let count =await empRepo.count();
     const count =resp.length
     console.log("count",count);
    // console.log("sum1",resp.Age)
    let sum = 0;
    
     for (let i = 0; i < resp.length; i++) {
      const res=resp[i].Age;
     console.log(res);
     sum+=res;
     }
    console.log("sum",sum)
   const avg =parseInt(sum/count)
    //Create a pdf document
    const doc = new pdf();
    doc.pipe(fs.createWriteStream("./uploads/file.pdf"));

    doc.fontSize(25).text(`totalrecords:${count}, averageage:${avg}`, 200, 200)
    doc.end();
    res.status(200).json({
      message: 'get all records successfully',
      res: {totalrecords:count,averageage:avg}
    })
   
    
  } catch (error) {
    console.log(error.message);
    res.send(400).json({
      message: 'unable to get the records'
    })
  }
};

module.exports = { uploadFile,downloadFile }