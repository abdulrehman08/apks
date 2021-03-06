const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Category = require("../models/categoryModel");
const Apk = require("../models/apkModel");
const multer = require("multer");
const path=require('path');
const Statics = require("../models/staticsModel");
// var public = path.join(__dirname, '../public/apk/');


// multiple files uploads
const multipleImagesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/");
  },

  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + file.originalname);
  },
});
const multipleImagesFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload images", 400), false);
  }
};
const multiImageUpload = multer({
  storage: multipleImagesStorage,
  fileFilter: multipleImagesFilter,
});
exports.uploadMultiImages = multiImageUpload;
// save to the database in image array
exports.saveImages = catchAsync(async (req, res, next) => {
  req.body.images = [];
  if (req.files) {
    req.files.map(async (file) => {
      req.body.images.push(file.filename);
    });
  }
  next();
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/apk/");
  },
  filename: (req, file, cb) => {
    cb(null, `apk-${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("application")) {
    cb(null, true);
  } else {
    cb(new AppError("No apk! Please upload only apk file", 400), false);
  }
};
// const imageStorage = multer.memoryStorage();

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/");
  },
  filename: (req, file, cb) => {
    // req.body.image= `image-${req.user.id}-${Date.now()}.jpeg`;
    cb(null, `image-${req.user.id}-${Date.now()}.jpeg`);
  },
});
// validate for image
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("No image! Please upload only images", 400), false);
  }
};
const uploadFile = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
});
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
});

exports.uploadImage = uploadImage.single("image");
exports.uploadFile = uploadFile.single("file");
exports.uploadFileHandler = catchAsync(async (req, res) => {
  const filename = req.file ? req.file.filename : "No_file.apk";
  // console.log({apk:req.file});
  const title = req.params.title;
  const result = await Apk.findOneAndUpdate({ title }, { file: filename });
  res.status(201).json({
    data: result,
  });
});

exports.uploadImagesHandler = catchAsync(async (req, res) => {
  const title = req.params.title;
  const images = req.body.images;
  const result = await Apk.findOneAndUpdate({ title }, { images });
  res.status(201).json({
    data: result,
  });
});
exports.updateStatics=catchAsync(async (req, res) => {
      const filename = req.params.image;
await Statics.findOneAndUpdate({title:"client"},{image:filename});
console.log({filename});
res.status(200).json({
  message:"statics updated successfully"
})
} );
exports.updateApk= catchAsync(async (req, res) => {
  console.log( req.body ,'abdulrehman');
  const user = req.user;
  const {apkTitle}=  req.params;
    const actions=user.role=='admin'? 'approved':'pending';
    const hot = req.body.hot == "true";
    const top = req.body.top == "true";
    const feature = req.body.feature == "true";
    const trending = req.body.trending == "true";
    // const filename = req.file.filename;
    const {
      requirements,
      category,
      subCategory,
      tags,
      title,
      developer,
      description,
      version,
      // website,
    } = req.body;
    // console.log({ apkTitle });
    // if (!title )
    //   return next(new AppError("please enter complete detail", 404));
    const apk = await Apk.findOneAndUpdate({title:apkTitle},{
      creator: req.user.name,
      actions,
      user,
      version,
      category,
      subCategory,
      requirements,
      title,
      tags,
      developer,
      // image: filename,
      description,
      hot,
      // officialWebsite: website,
      editorChoice: feature,
      trending: trending,
      top,
    });
    if(req.file)
    await Apk.findOneAndUpdate({title:apkTitle},{image: req.file.filename});
    res.status(201).json({
      data: apk,
    });
  });
  
exports.addApk = catchAsync(async (req, res, next) => {
// console.log({ body: req.body, image: req.file });
const user = req.user;
  const actions=user.role=='admin'? 'approved':'pending';
  const hot = req.body.hot == "true";
  const top = req.body.top == "true";
  const feature = req.body.feature == "true";
  const trending = req.body.trending == "true";
  const filename = req.file.filename;
  const {
    requirements,
    category,
    subCategory,
    tags,
    title,
    developer,
    description,
    version,
    website,
  } = req.body;
  console.log({ description });
  if (!title || !filename)
    return next(new AppError("please enter complete detail", 404));
  const apk = await Apk.create({
    creator: req.user.name,
    actions,
    user,
    version,
    category,
    subCategory,
    requirements,
    title,
    tags,
    developer,
    image: filename,
    description,
    hot,
    officialWebsite: website,
    editorChoice: feature,
    trending: trending,
    top,
  });
  res.status(201).json({
    data: apk,
  });
});

exports.getAllApk = catchAsync(async (req, res) => {
  const allApk = await Apk.find();
  res.status(201).json({
    data: allApk,
  });
});
exports.allApprovedApk= catchAsync(async (req, res) => {
  const allApk = await Apk.find({actions:'approved'});
  res.status(201).json({
  data: allApk,
  });
});
exports.getApk= catchAsync(async (req, res) => {
  const apk = await Apk.findOne({actions:'approved',title:req.params.title});
  res.status(200).json({
    data: apk,
  });
});
exports.getSameCateApps=catchAsync(async (req, res) => {
  console.log({cate:req.params.cate});
  const apk = await Apk.find({actions:'approved',subCategory:req.params.cate});
  res.status(200).json({
    data: apk,
  });
});
exports.trendingApks=catchAsync(async (req, res) => {
  const apk = await Apk.find({actions:'approved',trending:true});
  res.status(200).json({
    data: apk,
  });
});
exports.papularApks= catchAsync(async (req, res) => {
  const allApk = await Apk.find({actions:'approved',createdAt: { $gt: new Date(Date.now() - 24*60*60 * 1000) }});
  res.status(201).json({
    data: allApk,
  });
});
exports.deleteApk = catchAsync(async (req, res) => {
  const title = req.params.title;
  const rs = await Apk.findOneAndRemove({ title });
  console.log({ title, rs });
  const data = await Apk.find();
  res.status(201).json({
    data,
  });
});
exports.updateActions = catchAsync(async (req, res) => {
  await Apk.findOneAndUpdate(
    { title: req.body.title },
    { actions: req.body.actions }
  );
  console.log({title:req.body.title,actions:req.body.actions});
  const updatedApk = await Apk.findOne({ title: req.body.title });
  res.status(201).json({
    data: updatedApk,
  });
});

exports.addCategory = catchAsync(async (req, res) => {
  const { category, slug } = req.body;
  await Category.create({
    category,
    slug,
  });
  const allCate = await Category.find();
  res.status(201).json({
    data: allCate,
  });

  // const apk = await Category.findOne({ "category.name": "games" });
  // console.log(apk);
  // const [...subCate] = apk.category.subCategory;
  // subCate.push("Fun");
  // const result = await Category.findByIdAndUpdate(apk._id, {
  //   "category.subCategory": subCate,
  // // });
  // const apk = await Category.find();
  // const names = apk.map((e) => e.category.name);
});

exports.getSubcategories=catchAsync(async (req, res) => {
  const data = await Category.findOne({category:req.params.cate});
  res.status(200).json({ data });
});
exports.deleteSubcategory=catchAsync(async (req, res) => {
  const data = await Category.findOne({category:req.params.cate});
  const rmc=data.subCategory.filter(d=>d.name!==req.body.name);
  // console.log({name:req.body.name});
  await Category.findOneAndUpdate({category:req.params.cate},{subCategory:rmc});
  res.status(200).json({ data ,rmc});
});

exports.addSubCategory = catchAsync(async (req, res) => {
  console.log(req.body);
  const { cate } = req.params;
  const { slug, subCate } = req.body;
  const filename = req.file.filename;
  const newSubCate = { name: subCate, image: filename, slug: slug };
  const category = await Category.findOne({ category: cate });
  category.subCategory.push(newSubCate);
  await Category.findByIdAndUpdate(category._id, {
    subCategory: category.subCategory,
  });
  const allCate = await Category.find();
  res.status(201).json({
    data: allCate,
  });
});


exports.editSubCategory = catchAsync(async (req, res) => {
  console.log(req.body);
  const { cate,subcate } = req.params;
  
  const { slug, } = req.body;
  const filename = req.file ? req.file.filename:null;
  const newSubCate = { name: subcate, image: filename, slug: slug };
  const category = await Category.findOne({ category: cate });
 const index= category.subCategory.findIndex(e=> e.name===subcate );
 console.log({index:index});
 const subcategory= category.subCategory[index];
 subcategory.name=subcate;
 if (filename) subcategory.image=filename;
 subcategory.slug=slug;
 category.subCategory[index]=subcategory;
 console.log({subcategory});
  await Category.findByIdAndUpdate(category._id, {
    subCategory: category.subCategory,
  });
  const allCate = await Category.find();
  res.status(201).json({
    data: allCate,
  });
});


exports.removeCategory = catchAsync(async (req, res) => {
  const cate = req.params.cate;
  await Category.findOneAndRemove({ category: cate });
  const allCate = await Category.find();
  res.status(201).json({
    data: allCate,
  });
});
exports.getAllCate = catchAsync(async (req, res) => {
  const data = await Category.find();
  res.status(200).json({ data });
});
exports.getOneApk = catchAsync(async (req, res) => {
  const {title}=req.params;
console.log({title});
  const data = await Apk.findOne({title});
  res.status(200).json({ data });
});

exports.getStates = catchAsync(async (req, res) => {
  const data = await Category.find();
  res.status(200).json({ data });
});
exports.getDownload=catchAsync(async (req, res) => {
  const {title}=req.params;
console.log({title});
const {file,downloads} = await Apk.findOne({title});
await Apk.findOneAndUpdate({title},{downloads:downloads+1})
console.log({downloads});
  const readyFile = path.join(__dirname, `../public/apk/${file}`);
  res.download(readyFile);
  // console.log('dowloaded');
  // res.sendFile(readyFile);
});

exports.getcategory = catchAsync(async (req, res) => {
  const category = req.params.category;
  console.log({category});
  const data = await Category.findOne({ category });
  console.log({data});
  res.status(200).json({ data });
});

/////////////////

// const multerStorage = multer.memoryStorage();
// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image") || file.mimetype.startsWith("application")) {
//     cb(null, true);
//   } else {
//     cb("Please upload only image or apks", false);
//   }
// };

// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter
// });
// const uploadFiles = upload.array("images", 10); // limit to 10 images
// const uploadImages = (req, res, next) => {
//   uploadFiles(req, res, err => {
//     if (err instanceof multer.MulterError) { // A Multer error occurred when uploading.
//       if (err.code === "LIMIT_UNEXPECTED_FILE") { // Too many images exceeding the allowed limit
// console.log(err);      }
//     } else if (err) {
//       console.log(err);
//       // handle other errors
//     }

//     // Everything is ok.
//     next();
//   });
// };
// const resizeImages = async (req, res, next) => {
//   if (!req.files) return next();
//   req.body.images = [];
//   await Promise.all(
//     req.files.map(async file => {
//       const newFilename = ...;

//       await sharp(file.buffer)
//         .resize(640, 320)
//         .toFormat("jpeg")
//         .jpeg({ quality: 90 })
//         .toFile(`upload/${newFilename}`);

//       req.body.images.push(newFilename);
//     })
//   );

//   next();
// };
/////////////////
