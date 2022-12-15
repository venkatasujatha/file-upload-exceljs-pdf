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
     
    const errMsg = []
    const wb = new excelJs.Workbook();
     const result = await wb.xlsx.readFile(req.file.path);
     const sheetCount =wb.worksheets.length;
    console.log("TotalCount",sheetCount);
   
    if (sheetCount === 0) {
      errMsg.push({ message: "Workbook empty." });
    } else {
      for (let i = 0; i < sheetCount; i++) {
        let sheet = wb.worksheets[i];
        sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          if (rowNumber === 1 && row.cellCount === 2) {
            // Checking if Header exists
            if (!row.hasValues) {
              errMsg.push({ status: "Error", message: "Empty Headers" });
            } else if (row.values[1] !== "Name" || row.values[2] !== "Age") {
              errMsg.push({
                location: "Row " + rowNumber,
                message: "Incorrect Headers",
              });
            }
          }
          // Checking only those rows which have a value
          else if (row.hasValues) {
            let flag = true;
            const alphabetRegex = new RegExp(/^[a-zA-Z]+$/);
            const numberRegex = new RegExp(/^[0-9]+$/);
            if (
              row.cellCount === 2 &&
              row.values[1] !== undefined &&
              row.values[2] !== undefined &&
              alphabetRegex.test(row.values[1]) &&
              numberRegex.test(row.values[2])
            ) {
              data.push({ Name: row.values[1], Age: row.values[2] });
            } else {
              errMsg.push({
                location: "Row " + rowNumber,
                message: "Incorrect or missing values.",
              });
            }
          }
        });
      }
    }
    let resp1;
    if (errMsg.length > 0) {
      console.log("empty rows exists")
      return {status: 'ERROR', message: 'invalid rows present in sheet'}
    } 
    else {
     console.log("data stored in db");
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
     
    console.log("errMsg: ", errMsg);
    console.log("data: ", data);
} catch(err)
    {
      console.log(err.message)
    }
}
    
  
    //   workbook.eachSheet(async (sheet)=>{
    //     const actualCount =sheet.actualRowCount;
    //   console.log(actualCount)
    //   const rowCount = sheet.rowCount
    //   console.log(rowCount)
    //   const columnCount = sheet.columnCount
    //   console.log(columnCount)
    //   if(actualCount > 1 && columnCount == 2){
    //   let resp = validateHeaders(sheet.getRow(1).values)
    //   console.log(resp.status);
    //   if(resp.status =='ERROR') {
    //     errormsg.push({location: resp.location, message: resp.message})
    //    console.log(errormsg)
    //   }else{
    //    for(let i = 2;i<=rowCount;i++) {
    //    const name = sheet.getRow(i).values[1];
    //    const age = sheet.getRow(i).values[2];
    //     console.log("name",name)
    //     if((name == undefined && age != undefined) || (name!= undefined && age == undefined)){
    //       errormsg.push({message: " empty row exists"})
    //       console.log(errormsg)
    //       break;
    //     }
    //     if(onlyAlphabets(name) && containsOnlyNumbers(age)){
    //     let mydata = {
    //       Name: name,
    //       Age: age,
    //     };
    //     data.push(mydata)
    //     console.log("data",data)
    //    }     
    //   }  
    // }   

    // }else{

    //   console.log("column count is more than 2")
    // }  
    //   })

    // }   
    // let resp1;
    //   if(errormsg.length>0)
    // {
    //   return {status: 'ERROR', message: 'invalid rows present in sheet'}

    // }
    
    // else{
      
    //  resp1= await empRepo.save(data);
    //   console.log("resp1",resp1)
      
    // }
    //  if(resp1.length>0)
    //  {
      
    //     resp1= await axios.get('http://localhost:4000/downloadFile');
    //     res.status(200).json({
    //      message:"success",
    //      res:resp1.data
    //     })
        
  //     } 
     
  // } catch (err) {
    
  //   console.log(err.message)
    
  // }
//   function validateHeaders(headerRow) {

//     console.log(headerRow)
  
//     if(headerRow[1]!=='Name' || headerRow[2]!=='Age') {
  
//         return {status: 'ERROR', location: "ROW 1", message: 'Incorrect Header.'}
  
//     }
  
//     else {
  
//         return {status: 'SUCCESS'}
  
//     }
  
//   }
//   function onlyAlphabets(str) {
//     return /^[a-zA-Z]+$/.test(str);
//   }
//   function containsOnlyNumbers(str) {
//     return /^[0-9]+$/.test(str);
//   }
// }
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