const express = require("express");
const app = express();
const userRouts = require("./routs/userRouts");
const viewRouts = require("./routs/viewRouts");
const apkRouts = require("./routs/apkRouts");
const handlebars = require("express-handlebars");
const path=require('path')
const hbr = require("handlebars");
const cors=require('cors');
// const morgan = require("morgan");
// 
app.use((req,res,next)=>{
console.log(req.headers.authorization);
  // console.log({
  //   user:req.user?req.user.role:'no user',
  //   cookie:req.headers.cookie
  // }); 
next();
});
app.set("view engine", "hbs");
app.engine(
  "hbs",
  handlebars({
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
    defaultLayout: "index",
    extname: "hbs",
  })
);
app.use(express.json());
app.use(cors({origin:true}));

// app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,"public")));
// app.use((req,res,next)=>{
//   console.log("hello");
//   next();
//   });
app.use("/apk", apkRouts);
app.use("/user", userRouts);
app.use("/", viewRouts);
// app.get('*',(re,res)=>{
//   res.status(200).json({data:[{data:"rout not found"}]});
// });
hbr.registerHelper("createCate", function (row) {
  return row;
});
hbr.registerHelper("navbar", function(user) {
  if (!user) {
    return `
    <li class="nav-item">
    <a href="dashboard" class="nav-link active"><i
        class="icon-home4"></i><span>Dashboard</span></a>
  </li>
  <li class="nav-item">
							<a href="products" class="nav-link "><i class="icon-unfold"></i><span>Apk's</span></a>
						</li>
  `
  }else if (user.role=='admin') {
    return `
    <li class="nav-item">
							<a href="dashboard  " class="nav-link active"><i
									class="icon-home4"></i><span>Dashboard</span></a>
						</li>
						<li class="nav-item ">
							<a href="home  " class="nav-link"><i class="icon-home2"></i> <span>Home</span></a>
						</li>
						<li class="nav-item ">
							<a href="category  " class="nav-link"><i class="icon-list-unordered"></i>
								<span>Categories</span></a>
						</li>
						<li class="nav-item">
							<a href="products" class="nav-link "><i class="icon-unfold"></i><span>Apk's</span></a>
						</li>
						<li class="nav-item ">
							<a href="users" class="nav-link"><i class="icon-people"></i> <span>Staff</span></a>
						</li>
            <li class="nav-item ">
							<a href="users" class="nav-link"><i class="icon-people"></i> <span>Users</span></a>
						</li>
    `;
     }
    else{
    return `
    <li class="nav-item">
    <a href="dashboard" class="nav-link active"><i
        class="icon-home4"></i><span>Dashboard</span></a>
  </li>
  <li class="nav-item">
							<a href="products" class="nav-link "><i class="icon-unfold"></i><span>Apk's</span></a>
						</li>
  `
  }
});
hbr.registerHelper("status", function(status) {
const role=status;
console.log({role});
  if (role=='admin') {
    return `
    <td style="width:25%">
    <form id="status" name="status">
      <label for="pending">Pending</label>
<input id="pending" value="aa" type="radio" name="pending"/>
        <label for="approved">Approved</label>
<input id="approved" value="bb" type="radio" name="approved"/>
        <label for="rejected">Rejected</label>
<input id="rejected" value="cc" type="radio" name="rejected" checked/>
</form>
  </td>
    `;
     }
    else{
    return `
    <td>
    <p>${status}</p>
  </td>
  `
  }    
});
hbr.registerHelper('json', function(context) {
  return JSON.stringify(context).replace(/"/g, '&quot;');
});
hbr.registerHelper('check', function(item) {
if (item.actions==='approved') {
  return `checked`;
} else {
  return null;
}
});
module.exports = app;
