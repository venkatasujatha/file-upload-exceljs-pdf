const path = require('path')
const excelJs = require('exceljs')
const employee2 = require('../model/employee')
const {dataSource} = require('../database')
const empRepo = dataSource.getRepository('employee2');
const pdf =require('pdfkit');
const { Console } = require('console');
const uploadFile = async (req, res) => {
  let data = []
  
  try {
    

    const errormsg = []

    const workbook = new excelJs.Workbook();

     const result = await workbook.xlsx.readFile(req.file.path);

      const actualCount = workbook.worksheets[0].actualRowCount;

      console.log(actualCount)

      const rowCount = workbook.worksheets[0].rowCount

      console.log(rowCount)

      const columnCount = workbook.worksheets[0].columnCount

      console.log(columnCount)

      if(actualCount > 1 && columnCount == 2){

      let resp = validateHeaders(workbook.worksheets[0].getRow(1).values)

      console.log(resp.status);

      if(resp.status =='ERROR') {

        errormsg.push({location: resp.location, message: resp.message})

       console.log(errormsg)

      }else{

       for(let i = 2;i<=actualCount;i++) {

       const name = workbook.worksheets[0].getRow(i).values;

       const age = workbook.worksheets[0].getRow(i).values;

        console.log("name",name)

       

        if(onlyAlphabets(name) && containsOnlyNumbers(age)||name==undefined &&age==undefined){

        let mydata = {

          Name: name,

          Age: age,

        };

        data.push(mydata)

        console.log(data)
  
       }     

      }  

    }   
    const resp1=await empRepo.save(data);
console.log(resp1)


// console.log(file)
res.status(200).json({
  message: 'file uploaded successfully',
  res: resp1
})
    }else{

      console.log("column count is more than 2")

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
      age:true
    }});
     //let count =await empRepo.count();
     const count =resp.length
     console.log("count",count);
    console.log("sum1",resp.age)
    let sum = 0;
    
     for (let i = 0; i < resp.length; i++) {
      const res=resp[i].age;
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