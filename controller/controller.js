const fs = require('fs')
const { json } = require('body-parser')
const path = require('path')
const excelJs = require('exceljs')
const employee2 = require('../model/employee')
const {dataSource} = require('../database')
const empRepo = dataSource.getRepository('employee2');
const pdf =require('pdfkit');


const uploadFile = async (req, res) => {
  let data = []
  
  try {
    const wb = new excelJs.Workbook()
    const resp = await wb.xlsx.readFile(req.file.path)
    console.log(resp)
    let data =[]
    wb.eachSheet((sheet) => {
     
     if(sheet.columnCount<=2)
     { 
      sheet.eachRow( function (row) {
        if (onlyAlphabets(row.values[1]) && containsOnlyNumbers(row.values[2])&&(row.values[1]!= ''&& row.values[2]!='' || row.values[1]==''&& row.values[2]== '') ) {
          
         const mydata = {
           name: row.values[1],
           age: row.values[2]
         }
        console.log("value1",row.values[1])
        console.log("value2",row.values[2])

         data.push(mydata)
         console.log("result",mydata)  
        }
        else
        {
          console.log("validation failed")
        }    
      })
    }else{
      console.log("column count is more than 2")
    }

  })
   
    const resp1=await empRepo.save(data);
    console.log(resp1)

   
    // console.log(file)
    res.status(200).json({
      message: 'file uploaded successfully',
      res: resp1
    })
  } catch (err) {
    console.log("something went wrong")
    // res.send(400).json({
    //   message: 'file upload is failed'
    // })
  }
}

const downloadFile = async (req, res) => {
  try {
   
    
    const resp = await empRepo.find({select:{
      age:true
    }});
     let count =await empRepo.count();
     console.log("count",count);
    
    let sum = 0;
    let array = [];
    for (let i = 0; i < resp.length; i++) {
      array.push(parseInt(resp[i].age));
    }
    array.map((res) => {
      sum += res;
    });

    console.log("sum",sum)
    console.log(resp);
    //Create a pdf document
    const doc = new pdf();
    doc.pipe(fs.createWriteStream("./uploads/file.pdf"));

    doc.fontSize(25).text(`totalrecords:${count}, averageage:${sum / count}`, 200, 200);
    doc.end();
    res.status(200).json({
      message: 'get all records successfully',
      res: {totalrecords:count,averageage:sum/count}
    })
   
    
  } catch (error) {
    console.log(error.message);
    res.send(400).json({
      message: 'unable to get the records'
    })
  }
};

function onlyAlphabets(str) {
  return /^[a-zA-Z]+$/.test(str);
}

function containsOnlyNumbers(str) {
  return /^[0-9]+$/.test(str);
}
module.exports = { uploadFile,downloadFile }
